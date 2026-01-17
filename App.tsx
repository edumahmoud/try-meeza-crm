import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, Product, Invoice, Expense, ReturnRecord, User as UserType, PurchaseRecord } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory, { ProductDetailsModal } from './components/Inventory';
import Returns from './components/Returns';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Archive from './components/Archive';
import RecycleBin from './components/RecycleBin';
import Customers from './components/Customers';
import Purchases from './components/Purchases'; 
import Staff from './components/Staff';
import Branches from './components/Branches';
import Login from './components/Login';
import { useInventory } from './hooks/useInventory';
import { useSalesData } from './hooks/useSalesData';
import { usePurchaseData } from './hooks/usePurchaseData';
import { useStaffData } from './hooks/useStaffData';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('meeza_pos_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setView] = useState<ViewType>(() => {
    const saved = localStorage.getItem('meeza_pos_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.role === 'employee') return 'sales';
    }
    return 'dashboard';
  });

  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const inventory = useInventory();
  const salesData = useSalesData();
  const purchaseData = usePurchaseData();
  const staffData = useStaffData();

  useEffect(() => {
    if (user) {
      localStorage.setItem('meeza_pos_user', JSON.stringify(user));
      // توجيه الموظف للمبيعات إذا كان في الرئيسية (التي لا يملك صلاحيتها)
      if (user.role === 'employee' && currentView === 'dashboard') {
        setView('sales');
      }
    } else {
      localStorage.removeItem('meeza_pos_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFullRestore = (data: any) => {
    try {
      salesData.restoreAllData({ invoices: data.invoices || [], returns: data.returns || [], expenses: data.expenses || [] });
      if (data.products) inventory.restoreProducts(data.products);
      purchaseData.restorePurchaseData(data.suppliers || [], data.purchases || [], data.supplierPayments || []);
      staffData.restoreStaffData(data.users || [], data.branches || []);
      showToast("تمت استعادة كافة بيانات النظام بنجاح", "success");
    } catch (error) {
      showToast("حدث خطأ أثناء استعادة البيانات", "error");
    }
  };

  const userFilteredData = useMemo(() => {
    if (!user) return { invoices: [], returns: [], expenses: [], purchases: [] };
    if (user.role === 'employee') {
      return {
        invoices: salesData.invoices.filter(i => i.createdBy === user.id),
        returns: salesData.returns.filter(r => r.createdBy === user.id),
        expenses: salesData.expenses.filter(e => e.createdBy === user.id),
        purchases: purchaseData.purchases.filter(p => p.createdBy === user.id)
      };
    }
    return {
      invoices: salesData.invoices,
      returns: salesData.returns,
      expenses: salesData.expenses,
      purchases: purchaseData.purchases
    };
  }, [user, salesData, purchaseData]);

  const handleSaveInvoiceWithUser = (inv: Invoice) => {
    salesData.saveInvoice({ ...inv, createdBy: user!.id, creatorUsername: user!.username, branchId: user!.branchId });
  };

  const handleAddReturnWithUser = (ret: ReturnRecord) => {
    salesData.addReturn({ ...ret, createdBy: user!.id, branchId: user!.branchId });
  };

  const handleAddExpenseWithUser = (exp: Expense) => {
    salesData.addExpense({ ...exp, createdBy: user!.id, branchId: user!.branchId });
  };

  if (!user) return <Login onLogin={setUser} />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          invoices={userFilteredData.invoices.filter(i => !i.isDeleted)} 
          returns={userFilteredData.returns.filter(r => !r.isDeleted)} 
          expenses={userFilteredData.expenses} 
          products={inventory.products.filter(p => !p.isDeleted)}
          purchases={userFilteredData.purchases}
          payments={purchaseData.payments}
          suppliers={purchaseData.suppliers}
          onProductClick={(p) => setSelectedDetailProduct(p)}
          user={user}
        />;
      case 'sales':
        return <Sales 
          products={inventory.products.filter(p => !p.isDeleted)} 
          invoices={userFilteredData.invoices.filter(i => !i.isDeleted)}
          onSaveInvoice={handleSaveInvoiceWithUser}
          onDeductStock={inventory.deductStock}
          onGoToView={(view) => setView(view)}
          onShowToast={showToast}
          user={user}
        />;
      case 'purchases':
        return <Purchases 
          products={inventory.products}
          suppliers={purchaseData.suppliers}
          purchases={userFilteredData.purchases}
          payments={purchaseData.payments}
          onAddSupplier={purchaseData.addSupplier}
          onDeleteSupplier={purchaseData.deleteSupplier}
          onAddPurchase={(p) => purchaseData.addPurchase({ ...p, createdBy: user.id, branchId: user.branchId })}
          onDeletePurchase={purchaseData.deletePurchase}
          onRestorePurchase={purchaseData.restorePurchase}
          onPermanentlyDeletePurchase={purchaseData.permanentlyDeletePurchase}
          onAddPayment={(s, a, pid, n) => purchaseData.addSupplierPayment(s, a, pid, n)}
          onAddProduct={inventory.addProduct}
          onUpdateStock={inventory.updateStockWAC}
          onShowToast={showToast}
          user={user}
        />;
      case 'inventory':
        return <Inventory 
          products={inventory.products} 
          onUpdateProduct={inventory.updateProduct}
          onUpdateStock={inventory.updateStockWAC}
          onDeleteProduct={inventory.deleteProduct}
          onProductClick={(p) => setSelectedDetailProduct(p)}
          onShowToast={showToast}
          user={user}
        />;
      case 'returns':
        return <Returns 
          invoices={salesData.invoices.filter(i => !i.isDeleted)} 
          returns={userFilteredData.returns}
          onAddReturn={handleAddReturnWithUser}
          onDeleteReturn={salesData.deleteReturn}
          onRestockItem={inventory.restockItem}
          onShowToast={showToast}
          user={user}
        />;
      case 'staff':
        return <Staff 
          user={user}
          users={staffData.users}
          branches={staffData.branches}
          invoices={salesData.invoices}
          returns={salesData.returns}
          expenses={salesData.expenses}
          onAddUser={staffData.addUser}
          onUpdateRole={staffData.updateUserRole}
          onDeleteUser={staffData.deleteUser}
          onShowToast={showToast}
        />;
      case 'branches':
        return <Branches 
          user={user}
          branches={staffData.branches}
          users={staffData.users}
          onAddBranch={staffData.addBranch}
          onShowToast={showToast}
        />;
      case 'customers':
        return <Customers invoices={salesData.invoices} onShowToast={showToast} />;
      case 'expenses':
        return <Expenses expenses={userFilteredData.expenses} onAddExpense={handleAddExpenseWithUser} />;
      case 'reports':
        return <Reports 
          invoices={salesData.invoices.filter(i => !i.isDeleted)} 
          returns={salesData.returns.filter(r => !r.isDeleted)} 
          expenses={salesData.expenses} 
          purchases={purchaseData.purchases}
          supplierPayments={purchaseData.payments}
          user={user}
        />;
      case 'archive':
        return <Archive invoices={userFilteredData.invoices} onDeleteInvoice={salesData.deleteInvoice} onGoToView={(view) => setView(view)} onShowToast={showToast} user={user} />;
      case 'recycleBin':
        return <RecycleBin 
          deletedInvoices={salesData.invoices.filter(i => i.isDeleted)}
          deletedProducts={inventory.products.filter(p => p.isDeleted)}
          deletedReturns={salesData.returns.filter(r => r.isDeleted)}
          onRestoreInvoice={salesData.restoreInvoice}
          onPermanentlyDeleteInvoice={salesData.permanentlyDeleteInvoice}
          onEmptyInvoiceBin={salesData.emptyInvoiceBin}
          onRestoreProduct={inventory.restoreProduct}
          onPermanentlyDeleteProduct={inventory.permanentlyDeleteProduct}
          onEmptyProductBin={inventory.emptyProductBin}
          onRestoreReturn={salesData.restoreReturn}
          onPermanentlyDeleteReturn={salesData.permanentlyDeleteReturn}
          onEmptyReturnBin={salesData.emptyReturnBin}
          onShowToast={showToast}
          user={user}
        />;
      default:
        return <Dashboard 
          invoices={userFilteredData.invoices.filter(i => !i.isDeleted)} 
          returns={userFilteredData.returns.filter(r => !r.isDeleted)} 
          expenses={userFilteredData.expenses} 
          products={inventory.products.filter(p => !p.isDeleted)}
          purchases={userFilteredData.purchases}
          payments={purchaseData.payments}
          suppliers={purchaseData.suppliers}
          onProductClick={(p) => setSelectedDetailProduct(p)}
          user={user}
        />;
    }
  };

  return (
    <Layout 
      currentView={currentView} setView={setView} products={inventory.products} onReset={salesData.executeReset} onRestore={handleFullRestore} onProductClick={(p) => setSelectedDetailProduct(p)} toast={toast} onCloseToast={() => setToast(null)} user={user} onLogout={handleLogout}
    >
      <div className="animate-in">{renderView()}</div>
      {selectedDetailProduct && <ProductDetailsModal product={selectedDetailProduct} onClose={() => setSelectedDetailProduct(null)} user={user} />}
    </Layout>
  );
};

export default App;