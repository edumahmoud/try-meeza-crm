
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Trash2, RotateCcw, AlertTriangle, FileText, Package, X, Trash, History, Search, Coins, ShoppingCart, DollarSign, Eye, Info, Calendar, Hash, User, Phone } from 'lucide-react';
import { Invoice, Product, ReturnRecord, User as UserType } from '../types';

/**
 * InvoiceTemplate: المكون الدفاعي لسلة المحذوفات بتصميم ألوان فاتحة
 * تم إصلاح تقطع الكلمات وتصغير خانة الإجمالي
 */
const InvoiceTemplate: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  if (!invoice) return <div className="p-10 text-center text-rose-500 font-bold">خطأ في تحميل البيانات</div>;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = Number(invoice.totalBeforeDiscount) || 0;
  const discountVal = Number(invoice.discountValue) || 0;
  const discountAmt = invoice.discountType === 'fixed' ? discountVal : (subtotal * discountVal / 100);
  const discountPerc = invoice.discountType === 'percentage' ? discountVal : (subtotal > 0 ? ((discountVal / subtotal) * 100).toFixed(0) : 0);
  const netTotal = Number(invoice.netTotal) || 0;

  return (
    <div className="bg-white text-slate-800 w-full max-w-[210mm] mx-auto p-6 md:p-12 shadow-sm border border-slate-100 rounded-[1.5rem]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex justify-between items-start mb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-indigo-600 mb-1">ميزة</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mr-1">سلة المحذوفات الرقابية</p>
        </div>
        <div className="text-left bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 shadow-sm animate-pulse">
          <p className="text-[9px] font-black text-rose-400 uppercase mb-1">حالة السند</p>
          <p className="text-sm font-black text-rose-700">سند محذوف / ملغى</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 py-8 border-y border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-rose-600"><Hash size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p>
              <p className="text-sm font-black text-slate-700">#{invoice.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-rose-600"><Calendar size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">تاريخ الإصدار</p>
              <p className="text-sm font-black text-slate-700">{invoice.date}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">العميل</p>
              <p className="text-sm font-black text-slate-700">{invoice.customerName || 'عميل نقدي'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-rose-600"><User size={14}/></div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">سبب الحذف</p>
              <p className="text-sm font-black text-rose-600 italic">"{invoice.deletionReason || 'غير محدد'}"</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-rose-600"><AlertTriangle size={14}/></div>
          </div>
        </div>
      </div>

      <div className="mb-12 overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm opacity-60 grayscale">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 font-black text-[10px] uppercase">
              <th className="p-5">الصنف</th>
              <th className="p-5 text-center">السعر</th>
              <th className="p-5 text-center">الكمية</th>
              <th className="p-5 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-5">{item.name}</td>
                <td className="p-5 text-center text-slate-400">{item.unitPrice.toLocaleString()}</td>
                <td className="p-5 text-center font-black">{item.quantity}</td>
                <td className="p-5 text-left font-black text-indigo-600">{item.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="flex-1 w-full md:max-w-xs">
           <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
              <p className="text-[9px] font-black text-rose-400 uppercase mb-2 flex items-center gap-2"><Trash size={10}/> تنبيه رقابي</p>
              <p className="text-[10px] font-bold text-rose-700 leading-relaxed italic">هذه البيانات موجودة في سلة المحذوفات. يمكن استعادتها أو حذفها نهائياً من قبل الإدارة.</p>
           </div>
        </div>
        <div className="w-full md:w-60 bg-rose-50/50 p-5 rounded-[1.5rem] border border-rose-100 space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
            <span>القيمة الملغاة:</span>
            <span className="text-slate-600">{subtotal.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] font-black text-slate-900 uppercase">صافي الملغى</span>
            <div className="text-xl font-black text-rose-600">
              {netTotal.toLocaleString()} <span className="text-[10px] font-bold text-rose-400">ج.م</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-dashed border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">سجل محذوفات ميزة POS</p>
      </div>
    </div>
  );
};

interface RecycleBinProps {
  deletedInvoices: Invoice[];
  deletedProducts: Product[];
  deletedReturns: ReturnRecord[];
  onRestoreInvoice: (id: string, restoreStock: boolean) => void;
  onPermanentlyDeleteInvoice: (id: string) => void;
  onEmptyInvoiceBin: () => void;
  onRestoreProduct: (id: string) => void;
  onPermanentlyDeleteProduct: (id: string) => void;
  onEmptyProductBin: () => void;
  onRestoreReturn: (id: string) => void;
  onPermanentlyDeleteReturn: (id: string) => void;
  onEmptyReturnBin: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  user: UserType;
}

const RecycleBin: React.FC<RecycleBinProps> = ({
  deletedInvoices,
  deletedProducts,
  deletedReturns,
  onRestoreInvoice,
  onPermanentlyDeleteInvoice,
  onEmptyInvoiceBin,
  onRestoreProduct,
  onPermanentlyDeleteProduct,
  onEmptyProductBin,
  onRestoreReturn,
  onPermanentlyDeleteReturn,
  onEmptyReturnBin,
  onShowToast,
  user
}) => {
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<'invoices' | 'products' | 'returns'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'restore' | 'delete' | 'empty', target: 'invoice' | 'product' | 'return', id?: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<{type: string, data: any} | null>(null);
  const [restoreStock, setRestoreStock] = useState(true);

  const binAnalytics = useMemo(() => {
    return {
      invoicesValue: (deletedInvoices || []).reduce((sum, inv) => sum + (inv.netTotal || 0), 0),
      productsValue: (deletedProducts || []).reduce((sum, prod) => sum + ((prod.stock || 0) * (prod.retailPrice || 0)), 0),
      returnsValue: (deletedReturns || []).reduce((sum, ret) => sum + (ret.totalRefund || 0), 0)
    };
  }, [deletedInvoices, deletedProducts, deletedReturns]);

  const filteredInvoices = useMemo(() => (deletedInvoices || []).filter(inv => inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase())), [deletedInvoices, searchQuery]);
  const filteredProducts = useMemo(() => (deletedProducts || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.includes(searchQuery)), [deletedProducts, searchQuery]);
  const filteredReturns = useMemo(() => (deletedReturns || []).filter(ret => ret.id.toLowerCase().includes(searchQuery.toLowerCase()) || ret.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())), [deletedReturns, searchQuery]);

  const handleAction = () => {
    if (!confirmDialog) return;
    try {
        if (confirmDialog.type === 'empty') {
        if (confirmDialog.target === 'invoice') onEmptyInvoiceBin();
        else if (confirmDialog.target === 'product') onEmptyProductBin();
        else if (confirmDialog.target === 'return') onEmptyReturnBin();
        onShowToast?.("تم تفريغ السلة نهائياً", "success");
        } else if (confirmDialog.type === 'restore') {
        if (confirmDialog.target === 'invoice' && confirmDialog.id) onRestoreInvoice(confirmDialog.id, restoreStock);
        else if (confirmDialog.target === 'product' && confirmDialog.id) onRestoreProduct(confirmDialog.id);
        else if (confirmDialog.target === 'return' && confirmDialog.id) onRestoreReturn(confirmDialog.id);
        onShowToast?.("تمت استعادة العنصر", "success");
        } else if (confirmDialog.type === 'delete') {
        if (confirmDialog.target === 'invoice' && confirmDialog.id) onPermanentlyDeleteInvoice(confirmDialog.id);
        else if (confirmDialog.target === 'product' && confirmDialog.id) onPermanentlyDeleteProduct(confirmDialog.id);
        else if (confirmDialog.target === 'return' && confirmDialog.id) onPermanentlyDeleteReturn(confirmDialog.id);
        onShowToast?.("تم الحذف النهائي", "success");
        }
    } catch (e) {
        onShowToast?.("حدث خطأ أثناء تنفيذ العملية", "error");
    }
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] pb-12" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Coins size={20}/></div>
          <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">قيمة الفواتير المحذوفة</p><p className="text-xl font-black text-slate-800">{binAnalytics.invoicesValue.toLocaleString()} ج.م</p></div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><ShoppingCart size={20}/></div>
          <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">قيمة المخزون المحذوف (بيع)</p><p className="text-xl font-black text-slate-800">{binAnalytics.productsValue.toLocaleString()} ج.م</p></div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><DollarSign size={20}/></div>
          <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">قيمة المرتجعات المحذوفة</p><p className="text-xl font-black text-slate-800">{binAnalytics.returnsValue.toLocaleString()} ج.م</p></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl flex-1 w-full lg:w-auto overflow-x-auto">
            <button onClick={() => { setActiveTab('invoices'); setSearchQuery(''); }} className={`flex-1 min-w-[130px] flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}><FileText size={16} /> الفواتير ({deletedInvoices.length})</button>
            <button onClick={() => { setActiveTab('products'); setSearchQuery(''); }} className={`flex-1 min-w-[130px] flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}><Package size={16} /> الأصناف ({deletedProducts.length})</button>
            <button onClick={() => { setActiveTab('returns'); setSearchQuery(''); }} className={`flex-1 min-w-[130px] flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'returns' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}><History size={16} /> المرتجعات ({deletedReturns.length})</button>
          </div>
          {isAdmin && (
            <button onClick={() => setConfirmDialog({ type: 'empty', target: activeTab })} disabled={(activeTab === 'invoices' ? deletedInvoices : activeTab === 'products' ? deletedProducts : deletedReturns).length === 0} className="px-8 py-3 bg-rose-50 text-rose-600 font-black rounded-xl hover:bg-rose-600 hover:text-white transition-all text-xs flex items-center gap-2 border border-rose-100 disabled:opacity-50"><Trash size={16} /> تفريغ السلة</button>
          )}
        </div>
        <div className="relative"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="بحث سريع في سلة ميزة..." className="w-full pr-14 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/></div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto"><table className="w-full text-right text-[10px]"><thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b"><tr><th className="px-8 py-5">البيان</th><th className="px-8 py-5">سبب الحذف</th><th className="px-8 py-5 text-center">توقيت الحذف</th><th className="px-8 py-5 text-center">القيمة/المخزون</th><th className="px-8 py-5 text-left">الإجراءات</th></tr></thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {activeTab === 'invoices' && filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-4"><p className="font-black text-indigo-600">#{inv.id}</p><p className="text-[8px] text-slate-400">{inv.customerName}</p></td>
                  <td className="px-8 py-4 text-rose-600 max-w-[200px] truncate">{inv.deletionReason || '-'}</td>
                  <td className="px-8 py-4 text-center text-slate-400 text-[8px]">{new Date(inv.deletionTimestamp || 0).toLocaleString('ar-EG')}</td>
                  <td className="px-8 py-4 text-center font-black text-slate-900">{(inv.netTotal || 0).toLocaleString()} ج.م</td>
                  <td className="px-8 py-4 text-left"><div className="flex gap-2 justify-end">
                      <button onClick={() => setPreviewItem({type: 'invoice', data: inv})} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white"><Eye size={14}/></button>
                      <button onClick={() => setConfirmDialog({ type: 'restore', target: 'invoice', id: inv.id })} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-500 hover:text-white"><RotateCcw size={14}/></button>
                      {isAdmin && (
                        <button onClick={() => setConfirmDialog({ type: 'delete', target: 'invoice', id: inv.id })} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white"><Trash2 size={14}/></button>
                      )}
                  </div></td>
                </tr>
              ))}
              {activeTab === 'products' && filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-4"><p className="font-black text-slate-800">{p.name}</p><p className="text-[8px] text-slate-400">{p.code}</p></td>
                  <td className="px-8 py-4 text-rose-600 max-w-[200px] truncate">{p.deletionReason || '-'}</td>
                  <td className="px-8 py-4 text-center text-slate-400 text-[8px]">{new Date(p.deletionTimestamp || 0).toLocaleString('ar-EG')}</td>
                  <td className="px-8 py-4 text-center font-black">{p.stock || 0} قطعة</td>
                  <td className="px-8 py-4 text-left"><div className="flex gap-2 justify-end">
                      <button onClick={() => setPreviewItem({type: 'product', data: p})} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white"><Eye size={14}/></button>
                      <button onClick={() => setConfirmDialog({ type: 'restore', target: 'product', id: p.id })} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-500 hover:text-white"><RotateCcw size={14}/></button>
                      {isAdmin && (
                        <button onClick={() => setConfirmDialog({ type: 'delete', target: 'product', id: p.id })} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white"><Trash2 size={14}/></button>
                      )}
                  </div></td>
                </tr>
              ))}
              {activeTab === 'returns' && filteredReturns.map(ret => (
                <tr key={ret.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-4"><p className="font-black text-rose-600">#{ret.id}</p><p className="text-[8px] text-slate-400">للفاتورة: {ret.invoiceId}</p></td>
                  <td className="px-8 py-4 text-rose-600 max-w-[200px] truncate">{ret.deletionReason || '-'}</td>
                  <td className="px-8 py-4 text-center text-slate-400 text-[8px]">{new Date(ret.deletionTimestamp || 0).toLocaleString('ar-EG')}</td>
                  <td className="px-8 py-4 text-center font-black text-slate-900">{(ret.totalRefund || 0).toLocaleString()} ج.م</td>
                  <td className="px-8 py-4 text-left"><div className="flex gap-2 justify-end">
                      <button onClick={() => setPreviewItem({type: 'return', data: ret})} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white"><Eye size={14}/></button>
                      <button onClick={() => setConfirmDialog({ type: 'restore', target: 'return', id: ret.id })} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-500 hover:text-white"><RotateCcw size={14}/></button>
                      {isAdmin && (
                        <button onClick={() => setConfirmDialog({ type: 'delete', target: 'return', id: ret.id })} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white"><Trash2 size={14}/></button>
                      )}
                  </div></td>
                </tr>
              ))}
            </tbody>
        </table></div>
      </div>

      {/* Improved Preview Modal for Recycle Bin */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 md:p-8 animate-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
             <div className="p-6 border-b bg-rose-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                    <Trash2 size={20}/>
                  </div>
                  <div>
                    <h3 className="font-black text-base">معاينة المحذوفات الرقابية</h3>
                    <p className="text-[10px] font-bold opacity-70 uppercase mt-0.5">سجل ملغى {previewItem.type === 'invoice' ? 'رقم ' + previewItem.data.id : previewItem.data.name}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewItem(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                  <X size={24}/>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 scrollbar-hide">
                <div className="max-w-[210mm] mx-auto origin-top">
                  {previewItem.type === 'invoice' && <InvoiceTemplate invoice={previewItem.data}/>}
                  {previewItem.type === 'product' && (
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 w-full max-w-md mx-auto space-y-8">
                      <div className="text-center">
                        <h4 className="text-3xl font-black text-slate-800 mb-2">{previewItem.data.name}</h4>
                        <p className="text-xs font-bold text-slate-400">باركود الصنف: {previewItem.data.code}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">سعر الجملة</p><p className="text-xl font-black">{previewItem.data.wholesalePrice || 0} ج.م</p></div>
                        <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center"><p className="text-[10px] font-black text-indigo-400 uppercase mb-2">سعر البيع</p><p className="text-xl font-black text-indigo-600">{previewItem.data.retailPrice || 0} ج.م</p></div>
                      </div>
                      <div className="p-6 bg-slate-800 text-white rounded-3xl flex justify-between items-center px-8 shadow-xl"><span className="font-bold text-xs">المخزون المحذوف:</span><span className="font-black text-2xl">{previewItem.data.stock || 0} قطعة</span></div>
                      <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl"><p className="text-[10px] font-black text-rose-400 uppercase mb-2">توضيح سبب الحذف</p><p className="text-xs font-bold text-rose-700 italic">"{previewItem.data.deletionReason || 'غير محدد'}"</p></div>
                    </div>
                  )}
                  {previewItem.type === 'return' && (
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 w-full max-w-md mx-auto space-y-8">
                      <div className="text-center">
                        <h4 className="text-3xl font-black text-rose-600 mb-2">مرتجع #{previewItem.data.id}</h4>
                        <p className="text-xs font-bold text-slate-400">مرتبط بالفاتورة: {previewItem.data.invoiceId}</p>
                      </div>
                      <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-center"><p className="text-[10px] font-black text-rose-400 uppercase mb-2">إجمالي القيمة المستردة</p><p className="text-4xl font-black text-rose-700">{(previewItem.data.totalRefund || 0).toLocaleString()} <span className="text-sm font-bold opacity-60">ج.م</span></p></div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">تاريخ تسجيل المرتجع</p><p className="text-sm font-black text-slate-700">{previewItem.data.date} | {previewItem.data.time}</p></div>
                    </div>
                  )}
                </div>
             </div>

             <div className="p-8 bg-white border-t border-slate-100 flex gap-4 no-print shrink-0">
                <button onClick={() => setPreviewItem(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-sm hover:bg-slate-200 transition-all">إغلاق المعاينة</button>
             </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in">
            <div className={`p-8 text-center ${confirmDialog.type === 'restore' ? 'bg-indigo-50' : 'bg-rose-50'}`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${confirmDialog.type === 'restore' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>{confirmDialog.type === 'restore' ? <RotateCcw size={32} /> : <AlertTriangle size={32} />}</div>
              <h3 className="text-xl font-black mb-2">{confirmDialog.type === 'restore' ? 'تأكيد الاستعادة' : 'تأكيد الحذف النهائي'}</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{confirmDialog.type === 'restore' ? 'سيتم استعادة هذا العنصر لقوائم ميزة النشطة.' : 'تنبيه: سيتم مسح البيانات تماماً ولا يمكن التراجع عنها.'}</p>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 py-4 bg-white border font-black rounded-2xl text-xs">إلغاء</button>
              <button onClick={handleAction} className={`flex-[1.5] py-4 text-white font-black rounded-2xl shadow-xl text-xs ${confirmDialog.type === 'restore' ? 'bg-indigo-600' : 'bg-rose-600'}`}>تأكيد العملية</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;
