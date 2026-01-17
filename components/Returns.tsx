
import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, AlertCircle, ArrowRight, History, Calendar, Clock as ClockIcon, Trash2, AlertTriangle, Copy, Check, ShoppingCart } from 'lucide-react';
import { Invoice, ReturnRecord, ReturnItem, User as UserType } from '../types';

interface ReturnsProps {
  invoices: Invoice[];
  returns: ReturnRecord[];
  onAddReturn: (record: ReturnRecord) => void;
  onDeleteReturn: (id: string, reason: string) => void;
  onRestockItem: (id: string, qty: number) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  user: UserType;
}

const Returns: React.FC<ReturnsProps> = ({ invoices, returns, onAddReturn, onDeleteReturn, onRestockItem, onShowToast, user }) => {
  const [invoiceId, setInvoiceId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [confirmDelete, setConfirmDelete] = useState<{id: string, reason: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeReturns = useMemo(() => returns.filter(r => !r.isDeleted), [returns]);

  const handleSearchInvoice = () => {
    const inv = invoices.find(i => (i.id === invoiceId || i.id.toLowerCase() === invoiceId.toLowerCase()) && !i.isDeleted);
    if (inv) { setSelectedInvoice(inv); setReturnItems({}); }
    else { onShowToast?.("لم يتم العثور على فاتورة نشطة بهذا الرقم", "error"); }
  };

  const alreadyReturnedQty = (invId: string, productId: string) => {
    return activeReturns.filter(r => r.invoiceId === invId).reduce((acc, r) => {
      const item = r.items.find(i => i.productId === productId);
      return acc + (item ? item.quantity : 0);
    }, 0);
  };

  const effectiveDiscountMultiplier = useMemo(() => {
    if (!selectedInvoice || selectedInvoice.totalBeforeDiscount === 0) return 1;
    return selectedInvoice.netTotal / selectedInvoice.totalBeforeDiscount;
  }, [selectedInvoice]);

  const handleReturnQtyChange = (productId: string, qty: number, maxQty: number) => {
    const returnedBefore = alreadyReturnedQty(selectedInvoice!.id, productId);
    const availableToReturn = maxQty - returnedBefore;
    if (qty > availableToReturn) { onShowToast?.(`الحد الأقصى المتاح ${availableToReturn} قطعة`, "error"); return; }
    setReturnItems(prev => ({ ...prev, [productId]: Math.max(0, qty) }));
  };

  const handleReturnAll = () => {
    if (!selectedInvoice) return;
    const newReturns: Record<string, number> = {};
    selectedInvoice.items.forEach(item => {
      const returnedBefore = alreadyReturnedQty(selectedInvoice.id, item.productId);
      const available = item.quantity - returnedBefore;
      if (available > 0) {
        newReturns[item.productId] = available;
      }
    });
    setReturnItems(newReturns);
    onShowToast?.("تم تحديد كافة الكميات المتاحة للإرجاع", "success");
  };

  const processReturn = () => {
    if (!selectedInvoice) return;
    const items: ReturnItem[] = (Object.entries(returnItems) as [string, number][])
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const invoiceItem = selectedInvoice.items.find(i => i.productId === productId)!;
        const effectiveRefundPerUnit = invoiceItem.unitPrice * effectiveDiscountMultiplier;
        return { productId, name: invoiceItem.name, quantity: qty, refundAmount: Number((qty * effectiveRefundPerUnit).toFixed(2)), wholesalePriceAtSale: invoiceItem.wholesalePriceAtSale };
      });
    if (items.length === 0) { onShowToast?.('يرجى تحديد كمية صنف واحد على الأقل', "error"); return; }
    const totalRefund = items.reduce((acc, item) => acc + item.refundAmount, 0);
    const now = new Date();
    // Fix: Added missing createdBy and branchId to satisfy ReturnRecord interface requirements.
    const record: ReturnRecord = { 
      id: `RET-${now.getTime().toString().slice(-6)}`, 
      invoiceId: selectedInvoice.id, 
      items, 
      totalRefund: Number(totalRefund.toFixed(2)), 
      date: now.toLocaleDateString('ar-EG'), 
      time: now.toLocaleTimeString('ar-EG'), 
      timestamp: now.getTime(), 
      createdBy: user.id,
      branchId: user.branchId,
      isDeleted: false 
    };
    onAddReturn(record);
    items.forEach(item => onRestockItem(item.productId, item.quantity));
    onShowToast?.("تم تسجيل المرتجع بنجاح", "success");
    setSelectedInvoice(null); setInvoiceId(''); setReturnItems({});
  };

  const handleDeleteReturn = () => {
    if (!confirmDelete || !confirmDelete.reason.trim()) return;
    onDeleteReturn(confirmDelete.id, confirmDelete.reason);
    onShowToast?.("نقل المرتجع إلى سلة محذوفات ميزة", "success");
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-8 animate-in select-text" dir="rtl">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between no-print h-auto md:h-24">
        <div className="relative flex-1"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="رقم الفاتورة للمرتجع..." className="w-full pr-14 pl-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchInvoice()} /></div>
        <button onClick={handleSearchInvoice} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center gap-3 active:scale-95 transition-all">بحث<ArrowRight size={18} /></button>
      </div>

      {selectedInvoice && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in">
          <div className="p-8 border-b bg-indigo-50/50 flex justify-between items-center"><div><h3 className="text-xl font-black text-indigo-900">مرتجع مبيعات ميزة</h3><p className="text-[10px] text-indigo-600 font-bold uppercase mt-1">فاتورة: #{selectedInvoice.id}</p></div><div className="text-left text-slate-400 text-[10px] flex gap-4"><span className="flex items-center gap-1"><Calendar size={12}/> {selectedInvoice.date}</span></div></div>
          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-amber-50 p-5 rounded-2xl border border-amber-100">
              <div className="text-[11px] text-amber-800 font-bold">يتم رد المبلغ بناءً على "السعر الفعلي" المسدد بالفاتورة (Weighted Refund).</div>
              <button onClick={handleReturnAll} className="px-6 py-2 bg-amber-600 text-white font-black rounded-xl text-[10px] flex items-center gap-2 hover:bg-amber-700 transition-all"><ShoppingCart size={14} /> ارتجاع كامل الفاتورة</button>
            </div>
            <div className="overflow-hidden border border-slate-100 rounded-2xl"><table className="w-full text-right"><thead className="bg-slate-50 text-[9px] text-slate-500 font-black"><tr><th className="px-6 py-4">الصنف</th><th className="px-6 py-4 text-center">المباع</th><th className="px-6 py-4 text-center">الرد الآن</th><th className="px-6 py-4">إجمالي الرد</th></tr></thead>
                <tbody className="divide-y text-xs">{selectedInvoice.items.map(item => { const prevRet = alreadyReturnedQty(selectedInvoice.id, item.productId); const canRet = item.quantity - prevRet; const curRet = returnItems[item.productId] || 0; const effRef = item.unitPrice * effectiveDiscountMultiplier;
                    return (<tr key={item.productId} className="hover:bg-slate-50/30"><td className="px-6 py-5"><p className="font-black text-slate-800">{item.name}</p></td><td className="px-6 py-5 text-center font-bold text-slate-600">{item.quantity}</td><td className="px-6 py-5"><div className="flex justify-center"><input type="number" min="0" max={Math.max(0, canRet)} disabled={canRet <= 0} value={curRet} onChange={(e) => handleReturnQtyChange(item.productId, Number(e.target.value), item.quantity)} className="w-16 px-2 py-2 bg-white border rounded-lg text-center font-black text-indigo-600 text-xs" /></div></td><td className="px-6 py-5 font-black text-slate-800">{(curRet * effRef).toLocaleString()} ج.م</td></tr>);})}</tbody></table></div>
            <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6"><div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">إجمالي المسترد</p><p className="text-3xl font-black text-rose-600">{(Object.entries(returnItems) as [string, number][]).reduce((acc, [pid, qty]) => { const it = selectedInvoice.items.find(i => i.productId === pid); return acc + (qty * (it?.unitPrice || 0) * effectiveDiscountMultiplier); }, 0).toLocaleString()} <span className="text-sm">ج.م</span></p></div><div className="flex gap-3"><button onClick={() => setSelectedInvoice(null)} className="px-8 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-[10px]">إلغاء</button><button onClick={processReturn} className="px-8 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] active:scale-95 transition-all">إتمام المرتجع</button></div></div></div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden no-print">
        <div className="p-8 border-b bg-slate-50/30 flex items-center gap-4"><History size={20} className="text-rose-500" /><h3 className="text-lg font-black text-slate-800">سجل مرتجعات ميزة النشط</h3></div>
        <div className="overflow-x-auto"><table className="w-full text-right text-xs min-w-[700px]"><thead className="bg-slate-50 text-slate-400 font-black text-[8px] border-b"><tr><th className="px-8 py-5">رقم المرتجع</th><th className="px-8 py-5">الأصل</th><th className="px-8 py-5">التاريخ</th><th className="px-8 py-5 text-center">القيمة</th><th className="px-8 py-5"></th></tr></thead>
              <tbody className="divide-y">{activeReturns.length === 0 ? (<tr><td colSpan={5} className="p-16 text-center text-slate-300 font-bold italic">لا توجد مرتجعات نشطة</td></tr>) : activeReturns.map(rec => (
                       <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="px-8 py-5 font-black">
                            <button onClick={() => {navigator.clipboard.writeText(rec.id); setCopiedId(rec.id); setTimeout(()=>setCopiedId(null),2000)}} className="flex items-center gap-2 hover:bg-indigo-50 px-2 py-1 rounded transition-colors group">
                                #{rec.id}
                                {copiedId === rec.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-30 transition-opacity" />}
                            </button>
                          </td>
                          <td className="px-8 py-5 font-bold text-slate-500">#{rec.invoiceId}</td>
                          <td className="px-8 py-5 text-slate-400 font-bold">{rec.date}</td>
                          <td className="px-8 py-5 font-black text-rose-600 text-sm text-center">{rec.totalRefund.toLocaleString()} ج.م</td>
                          <td className="px-8 py-5 text-left">
                            {user.role === 'admin' && (
                              <button onClick={() => setConfirmDelete({id: rec.id, reason: ''})} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                            )}
                          </td>
                       </tr>))}</tbody></table></div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-8 text-center bg-rose-50"><div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Trash2 size={32} /></div><h3 className="text-xl font-black mb-2">نقل للسلة؟</h3><p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4">سبب الحذف الإلزامي:</p><textarea autoFocus value={confirmDelete.reason} onChange={e => setConfirmDelete({...confirmDelete, reason: e.target.value})} className="w-full p-3 rounded-xl border border-rose-200 outline-none font-bold text-xs min-h-[80px]" placeholder="مثال: تسجيل خاطئ..." /></div>
            <div className="p-5 flex gap-3 border-t border-slate-50"><button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 bg-slate-100 rounded-xl font-black text-[10px]">تراجع</button><button onClick={handleDeleteReturn} disabled={!confirmDelete.reason.trim()} className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] disabled:opacity-50 active:scale-95 transition-all">تأكيد الحذف</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
