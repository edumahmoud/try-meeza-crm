
import { useState, useEffect } from 'react';
import { PurchaseRecord, Supplier, SupplierPayment } from '../types';

export const usePurchaseData = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_suppliers');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_purchases');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const [payments, setPayments] = useState<SupplierPayment[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_supplier_payments');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('meeza_pos_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('meeza_pos_purchases', JSON.stringify(purchases));
    localStorage.setItem('meeza_pos_supplier_payments', JSON.stringify(payments));
  }, [suppliers, purchases, payments]);

  const addSupplier = (name: string, phone?: string, taxNumber?: string) => {
    const existing = suppliers.find(s => s.name === name && !s.isDeleted);
    if (existing) return existing;

    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      name,
      phone,
      taxNumber,
      totalDebt: 0,
      totalPaid: 0,
      totalSupplied: 0,
      isDeleted: false
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  const deleteSupplier = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier && (Number(supplier?.totalDebt) || 0) > 0) {
      throw new Error("لا يمكن حذف مورد له مديونية قائمة. يرجى تصفية الحساب أولاً.");
    }
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isDeleted: true } : s));
  };

  const addPurchase = (record: PurchaseRecord) => {
    setPurchases(prev => [record, ...prev]);
    setSuppliers(prevSuppliers => {
      return prevSuppliers.map(s => {
        if (s.id === record.supplierId) {
          return {
            ...s,
            totalSupplied: (Number(s.totalSupplied) || 0) + Number(record.totalAmount),
            totalDebt: (Number(s.totalDebt) || 0) + Number(record.remainingAmount),
            totalPaid: (Number(s.totalPaid) || 0) + Number(record.paidAmount)
          };
        }
        return s;
      });
    });
  };

  // تعديل منطق الارتجاع لخصم القيمة المرتجعة فعلياً فقط من حساب المورد
  const deletePurchase = (id: string, reason: string, actualReturnValue: number = 0) => {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;
    
    const valueToDeduct = actualReturnValue > 0 ? actualReturnValue : purchase.totalAmount;

    setSuppliers(sPrev => sPrev.map(s => {
      if (s.id === purchase.supplierId) {
        // نخصم فقط القيمة التي تم إرجاع بضاعتها فعلياً
        // المديونية المتبقية للفاتورة يتم تعديلها بناءً على ما تم إرجاعه
        const newTotalSupplied = Math.max(0, (Number(s.totalSupplied) || 0) - valueToDeduct);
        const newTotalDebt = Math.max(0, (Number(s.totalDebt) || 0) - valueToDeduct);

        return {
          ...s,
          totalSupplied: newTotalSupplied,
          totalDebt: newTotalDebt
        };
      }
      return s;
    }));

    setPurchases(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        isDeleted: true, 
        deletionReason: reason, 
        deletionTimestamp: Date.now(),
        // تحديث المديونية في الفاتورة نفسها لتوضيح المبلغ المتبقي كتعويض
        remainingAmount: Math.max(0, p.remainingAmount - valueToDeduct)
      } : p
    ));
  };

  const restorePurchase = (id: string) => {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;

    setSuppliers(sPrev => sPrev.map(s => {
      if (s.id === purchase.supplierId) {
        return {
          ...s,
          totalSupplied: (Number(s.totalSupplied) || 0) + Number(purchase.totalAmount),
          totalDebt: (Number(s.totalDebt) || 0) + Number(purchase.remainingAmount),
          totalPaid: (Number(s.totalPaid) || 0) + Number(purchase.paidAmount)
        };
      }
      return s;
    }));

    setPurchases(prev => prev.map(p => 
      p.id === id ? { ...p, isDeleted: false, deletionReason: undefined, deletionTimestamp: undefined } : p
    ));
  };

  const permanentlyDeletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  };

  const addSupplierPayment = (supplierId: string, amount: number, purchaseId: string, notes?: string) => {
    const paymentAmount = Number(amount) || 0;
    const now = new Date();
    
    const savedUser = localStorage.getItem('meeza_pos_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    const payment: SupplierPayment = {
      id: `PAY-${now.getTime().toString().slice(-6)}`,
      supplierId,
      purchaseId,
      amount: paymentAmount,
      date: now.toLocaleDateString('ar-EG'),
      time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
      notes: notes || `سداد للفاتورة #${purchaseId}`,
      createdBy: currentUser?.id || 'system'
    };
    setPayments(prev => [payment, ...prev]);

    setPurchases(prev => prev.map(p => {
      if (p.id === purchaseId) {
        const newPaid = Number(p.paidAmount) + paymentAmount;
        const newRemaining = Math.max(0, Number(p.remainingAmount) - paymentAmount);
        return {
          ...p,
          paidAmount: newPaid,
          remainingAmount: newRemaining
        };
      }
      return p;
    }));
    
    setSuppliers(prevSuppliers => {
      return prevSuppliers.map(s => {
        if (s.id === supplierId) {
          return {
            ...s,
            totalDebt: Math.max(0, (Number(s.totalDebt) || 0) - paymentAmount),
            totalPaid: (Number(s.totalPaid) || 0) + paymentAmount
          };
        }
        return s;
      });
    });
  };

  const restorePurchaseData = (sData: Supplier[], pData: PurchaseRecord[], payData: SupplierPayment[]) => {
    setSuppliers(Array.isArray(sData) ? sData : []);
    setPurchases(Array.isArray(pData) ? pData : []);
    setPayments(Array.isArray(payData) ? payData : []);
  };

  return { 
    suppliers, 
    purchases, 
    payments, 
    addSupplier, 
    deleteSupplier,
    addPurchase, 
    deletePurchase,
    restorePurchase,
    permanentlyDeletePurchase,
    addSupplierPayment,
    restorePurchaseData
  };
};
