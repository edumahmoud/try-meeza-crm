import { useState, useEffect } from 'react';
import { Invoice, ReturnRecord, Expense } from '../types';

export const useSalesData = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Meeza: Failed to load invoices", err);
      return [];
    }
  });

  const [returns, setReturns] = useState<ReturnRecord[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_returns');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Meeza: Failed to load returns", err);
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Meeza: Failed to load expenses", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('meeza_pos_invoices', JSON.stringify(invoices));
      localStorage.setItem('meeza_pos_returns', JSON.stringify(returns));
      localStorage.setItem('meeza_pos_expenses', JSON.stringify(expenses));
    } catch (err) {
      console.error("Meeza: Failed to save sales data", err);
    }
  }, [invoices, returns, expenses]);

  const saveInvoice = (invoice: Invoice) => {
    if (!invoice) return;
    setInvoices(prev => [invoice, ...prev]);
  };

  const deleteInvoice = (invoiceId: string, reason: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, isDeleted: true, deletionReason: reason, deletionTimestamp: Date.now() } : inv
    ));
  };

  const restoreInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, isDeleted: false, deletionReason: undefined, deletionTimestamp: undefined } : inv
    ));
  };

  const permanentlyDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  };

  const emptyInvoiceBin = () => {
    setInvoices(prev => prev.filter(inv => !inv.isDeleted));
  };

  const addReturn = (returnRecord: ReturnRecord) => {
    if (!returnRecord) return;
    setReturns(prev => [returnRecord, ...prev]);
  };

  const deleteReturn = (returnId: string, reason: string) => {
    setReturns(prev => prev.map(ret => 
      ret.id === returnId ? { ...ret, isDeleted: true, deletionReason: reason, deletionTimestamp: Date.now() } : ret
    ));
  };

  const restoreReturn = (returnId: string) => {
    setReturns(prev => prev.map(ret => 
      ret.id === returnId ? { ...ret, isDeleted: false, deletionReason: undefined, deletionTimestamp: undefined } : ret
    ));
  };

  const permanentlyDeleteReturn = (returnId: string) => {
    setReturns(prev => prev.filter(ret => ret.id !== returnId));
  };

  const emptyReturnBin = () => {
    setReturns(prev => prev.filter(ret => !ret.isDeleted));
  };

  const addExpense = (expense: Expense) => {
    if (!expense) return;
    setExpenses(prev => [expense, ...prev]);
  };

  const restoreAllData = (data: { invoices: Invoice[], returns: ReturnRecord[], expenses: Expense[] }) => {
    setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    setReturns(Array.isArray(data.returns) ? data.returns : []);
    setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
  };

  const executeReset = () => {
    // 1. تصفير الحالات البرمجية أولاً لمنع إعادة الحفظ التلقائي من الـ hooks
    setInvoices([]);
    setReturns([]);
    setExpenses([]);

    // 2. مسح كافة البيانات المرتبطة بالتطبيق من المتصفح
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('meeza_pos_')) {
        localStorage.removeItem(key);
      }
    });

    // 3. إعادة تحميل الصفحة فوراً بشكل نهائي لتحديث كافة البيانات في الذاكرة
    // تم التعديل من window.location.origin إلى reload() لتجنب خطأ 404
    window.location.reload();
  };

  return { 
    invoices, 
    returns, 
    expenses, 
    saveInvoice, 
    deleteInvoice,
    restoreInvoice,
    permanentlyDeleteInvoice,
    emptyInvoiceBin,
    addReturn, 
    deleteReturn,
    restoreReturn,
    permanentlyDeleteReturn,
    emptyReturnBin,
    addExpense,
    executeReset,
    restoreAllData
  };
};