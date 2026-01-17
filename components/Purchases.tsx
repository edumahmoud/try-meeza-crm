import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Search, Truck, Plus, Trash2, 
  Save, Hash, Calendar, X, Eye, Info, Check, User, Phone, Copy, ClipboardList, Tag, Activity, Layers, HandCoins, Receipt, CreditCard,
  TrendingDown, AlertTriangle, MessageSquare, ChevronLeft, ArrowRight, Clock, RotateCcw, ChevronDown, Users, FileText, DownloadCloud, LayoutGrid, List, Filter, Lock, ArrowUpDown, PackagePlus
} from 'lucide-react';
import { Product, PurchaseRecord, PurchaseItem, Supplier, SupplierPayment, User as UserType } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// دالة تحديد حالة الفاتورة
const getStatusConfig = (p: PurchaseRecord) => {
  if (p.isDeleted) return { label: 'مرتجع توريد', color: 'bg-slate-100 text-slate-500 border-slate-200' };
  if (p.remainingAmount === 0) return { label: 'مسددة بالكامل', color: 'bg-indigo-600 text-white border-indigo-700 shadow-sm' };
  if (p.paidAmount > 0 && p.remainingAmount > 0) return { label: 'جاري السداد', color: 'bg-amber-500 text-white border-amber-600 shadow-sm' };
  return { label: 'آجل (غير مسدد)', color: 'bg-rose-50 text-rose-600 border-rose-100' };
};

// قالب PDF لمرتجع التوريد
const ReturnPurchaseTemplate: React.FC<{ purchase: PurchaseRecord, reason: string, summary: any }> = ({ purchase, reason, summary }) => (
  <div className="bg-white p-12 text-right" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
    <div className="flex justify-between items-start mb-10 border-b pb-8">
      <div>
        <h1 className="text-3xl font-black text-rose-600">ميزة POS</h1>
        <p className="text-sm font-bold text-slate-400 mt-1">سند مرتجع توريد بضاعة</p>
      </div>
      <div className="text-left">
        <p className="font-black font-mono">#{purchase.id}</p>
        <p className="text-xs text-slate-400">{new Date().toLocaleDateString('ar-EG')}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-8 mb-10">
      <div><p className="text-[10px] font-black text-slate-400 uppercase">المورد</p><p className="text-lg font-black">{purchase.supplierName}</p></div>
      <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase">سبب المرتجع</p><p className="text-sm font-bold text-rose-600 italic">"{reason}"</p></div>
    </div>
    <table className="w-full text-sm mb-10 border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b text-slate-500"><th className="p-3">الصنف</th><th className="p-3 text-center">الكمية المرتجعة</th><th className="p-3 text-center">سعر التكلفة</th><th className="p-3 text-left">قيمة المرتجع</th></tr>
      </thead>
      <tbody>
        {summary.details.filter((d: any) => d.returning > 0).map((item: any, i: number) => (
          <tr key={i} className="border-b"><td className="p-3 font-bold">{item.name}</td><td className="p-3 text-center">{item.returning}</td><td className="p-3 text-center">{item.costPrice.toLocaleString()}</td><td className="p-3 text-left font-black">{(item.returning * item.costPrice).toLocaleString()} ج.م</td></tr>
        ))}
      </tbody>
    </table>
    <div className="flex justify-end">
      <div className="w-72 space-y-3 bg-rose-50 p-6 rounded-2xl border border-rose-100">
        <div className="flex justify-between text-xs font-bold text-rose-400"><span>إجمالي المرتجع الفعلي:</span><span>{summary.totalReturnedValue.toLocaleString()} ج.م</span></div>
        {summary.debtReduction > 0 && <div className="flex justify-between text-xs font-bold text-indigo-600"><span>تخفيض مديونية:</span><span>{summary.debtReduction.toLocaleString()} ج.م</span></div>}
        {summary.cashRefund > 0 && <div className="flex justify-between text-xs font-bold text-emerald-600"><span>مستحق استرداد نقدي:</span><span>{summary.cashRefund.toLocaleString()} ج.م</span></div>}
      </div>
    </div>
  </div>
);

// مكون اختيار فاتورة للسداد الموحد
const UnifiedPaymentSelectionModal: React.FC<{
  supplier: Supplier;
  purchases: PurchaseRecord[];
  onClose: () => void;
  onSelectInvoice: (purchaseId: string, remainingAmount: number) => void;
}> = ({ supplier, purchases, onClose, onSelectInvoice }) => {
  const [modalSearch, setModalSearch] = useState('');
  
  const debtInvoices = useMemo(() => {
    const list = purchases.filter(p => p.supplierId === supplier.id && !p.isDeleted && p.remainingAmount > 0);
    if (!modalSearch.trim()) return list;
    const q = modalSearch.toLowerCase();
    return list.filter(p => 
      p.id.toLowerCase().includes(q) || 
      (p.supplierInvoiceNumber && p.supplierInvoiceNumber.toLowerCase().includes(q))
    );
  }, [purchases, supplier.id, modalSearch]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4 animate-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col border border-emerald-100">
        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-md"><HandCoins size={24} /></div>
            <div>
              <h2 className="text-xl font-black">سداد مديونية: {supplier.name}</h2>
              <p className="text-emerald-100 font-bold opacity-80 text-[10px]">اختر الفاتورة المراد سدادها</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="بحث سريع برقم الفاتورة..." className="w-full pr-9 pl-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[10px] focus:ring-2 focus:ring-emerald-500/20" value={modalSearch} onChange={e => setModalSearch(e.target.value)} autoFocus />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scrollbar-hide">
          <div className="space-y-3">
            {debtInvoices.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <AlertTriangle size={48} className="mx-auto text-rose-500 mb-3 opacity-20" />
                <p className="text-slate-400 font-bold">{modalSearch.trim() ? 'الفاتورة غير موجودة' : 'لا توجد ديون مستحقة لهذا المورد'}</p>
              </div>
            ) : (
              debtInvoices.map(p => (
                <button key={p.id} onClick={() => onSelectInvoice(p.id, p.remainingAmount)} className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between group text-right">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Receipt size={20} /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800 text-sm">فاتورة #{p.id}</p>
                        {p.supplierInvoiceNumber && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black">المورد: {p.supplierInvoiceNumber}</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">{p.date} - {p.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-rose-400 uppercase leading-none mb-1">المتبقي</p>
                      <p className="text-sm font-black text-rose-600">{p.remainingAmount.toLocaleString()} ج.م</p>
                    </div>
                    <ChevronLeft size={20} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:-translate-x-1 transition-all" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-slate-100 text-slate-500 font-black rounded-xl text-xs">إلغاء</button>
        </div>
      </div>
    </div>
  );
};

// مكون كشف حساب المورد المتطور
const SupplierHistoryModal: React.FC<{ 
  supplier: Supplier; 
  purchases: PurchaseRecord[]; 
  payments: SupplierPayment[]; 
  onClose: () => void;
  onPreviewInvoice: (p: PurchaseRecord) => void;
  onReturnInvoice: (purchaseId: string) => void;
  onUnifiedPayment: () => void;
}> = ({ supplier, purchases, payments, onClose, onPreviewInvoice, onReturnInvoice, onUnifiedPayment }) => {
  const [innerSearch, setInnerSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'day' | 'month' | 'year'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'debt'>('all');
  const [modalSort, setModalSort] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supplierCounts = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('ar-EG');
    const month = now.getMonth();
    const year = now.getFullYear();
    const supPurchases = purchases.filter(p => p.supplierId === supplier.id && !p.isDeleted);

    return {
      today: supPurchases.filter(p => p.date === todayStr).length,
      month: supPurchases.filter(p => {
        const d = new Date(p.timestamp);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length,
      year: supPurchases.filter(p => {
        const d = new Date(p.timestamp);
        return d.getFullYear() === year;
      }).length
    };
  }, [purchases, supplier.id]);

  const supplierPurchases = useMemo(() => {
    let list = purchases.filter(p => p.supplierId === supplier.id && !p.isDeleted);
    
    // فلترة التاريخ
    if (dateFilter !== 'all') {
      const now = new Date();
      list = list.filter(p => {
        const d = new Date(p.timestamp);
        if (dateFilter === 'day') return d.toDateString() === now.toDateString();
        if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (dateFilter === 'year') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }

    // فلترة الحالة
    if (statusFilter !== 'all') {
      list = list.filter(p => statusFilter === 'paid' ? p.remainingAmount === 0 : p.remainingAmount > 0);
    }

    // فلترة البحث
    if (innerSearch.trim()) {
      const q = innerSearch.toLowerCase();
      list = list.filter(p => p.id.toLowerCase().includes(q) || (p.supplierInvoiceNumber && p.supplierInvoiceNumber.toLowerCase().includes(q)));
    }

    // الترتيب (الأصل هو الطابع الزمني لضمان دقة ترتيب الوقت كما هو مطلوب)
    list.sort((a, b) => {
      const aVal = a[modalSort.key as keyof PurchaseRecord] as number;
      const bVal = b[modalSort.key as keyof PurchaseRecord] as number;
      return modalSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [purchases, supplier.id, innerSearch, dateFilter, statusFilter, modalSort]);

  const handleSort = (key: string) => {
    setModalSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportStatement = async () => {
    const container = document.createElement('div');
    container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.width = '210mm';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(
      <div className="p-12 bg-white text-right" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <h1 className="text-2xl font-black text-indigo-600 mb-2">كشف حساب مورد: {supplier.name}</h1>
        <p className="text-xs text-slate-400 mb-8 border-b pb-4">تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')} | المدى: {dateFilter === 'all' ? 'كامل السجل' : dateFilter === 'day' ? 'اليوم' : dateFilter === 'month' ? 'الشهر الحالي' : 'السنة الحالية'}</p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-4 border rounded-xl text-center"> <p className="text-[10px] font-black text-slate-400">إجمالي التوريد</p> <p className="font-black">{supplier.totalSupplied.toLocaleString()} ج.م</p> </div>
          <div className="p-4 border rounded-xl text-center"> <p className="text-[10px] font-black text-slate-400">إجمالي المسدد</p> <p className="font-black text-emerald-600">{supplier.totalPaid.toLocaleString()} ج.م</p> </div>
          <div className="p-4 border rounded-xl bg-rose-50 text-center"> <p className="text-[10px] font-black text-rose-400">المديونية الحالية</p> <p className="font-black text-rose-600">{supplier.totalDebt.toLocaleString()} ج.م</p> </div>
        </div>
        <h3 className="font-black text-sm mb-4 border-r-4 border-indigo-600 pr-3">سجل المديونيات المشمولة</h3>
        <table className="w-full text-xs mb-10 border-collapse">
          <thead><tr className="bg-slate-50 border-b"><th className="p-3">رقم الفاتورة</th><th className="p-3">التاريخ والوقت</th><th className="p-3 text-center">الحالة</th><th className="p-3 text-center">القيمة</th><th className="p-3 text-center">المسدد</th><th className="p-3 text-left">المتبقي</th></tr></thead>
          <tbody>
            {supplierPurchases.map(p => (
              <tr key={p.id} className="border-b"><td className="p-3 font-bold">#{p.id}</td><td className="p-3">{p.date} - {p.time}</td><td className="p-3 text-center">{getStatusConfig(p).label}</td><td className="p-3 text-center">{p.totalAmount.toLocaleString()}</td><td className="p-3 text-center">{p.paidAmount.toLocaleString()}</td><td className="p-3 text-left font-black text-rose-600">{p.remainingAmount.toLocaleString()} ج.م</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
    const canvas = await html2canvas(container.firstChild as HTMLElement, { scale: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Statement_${supplier.name}.pdf`);
    root.unmount(); document.body.removeChild(container);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4 animate-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-indigo-100">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md"><Truck size={32} /></div>
            <div>
              <h2 className="text-2xl font-black">{supplier.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-[10px]">كشف حساب المورد والعمليات</p>
                {supplier.taxNumber && <p className="text-indigo-100 font-black text-[10px] bg-white/10 px-2 py-0.5 rounded">الرقم الضريبي: {supplier.taxNumber}</p>}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={handleExportStatement} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 flex items-center gap-2 text-xs font-black"><DownloadCloud size={20}/> تنزيل كشف حساب</button>
             <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">فواتير اليوم</p>
              <p className="text-lg font-black text-indigo-600">{supplierCounts.today}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">فواتير الشهر</p>
              <p className="text-lg font-black text-indigo-600">{supplierCounts.month}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">فواتير السنة</p>
              <p className="text-lg font-black text-indigo-600">{supplierCounts.year}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-rose-400 uppercase mb-1">المديونية الإجمالية</p>
              <p className="text-lg font-black text-rose-600">{supplier.totalDebt.toLocaleString()} ج.م</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
              {[
                {id: 'all', label: 'الكل'},
                {id: 'day', label: 'اليوم'},
                {id: 'month', label: 'الشهر'},
                {id: 'year', label: 'السنة'}
              ].map(f => (
                <button key={f.id} onClick={() => setDateFilter(f.id as any)} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black transition-all ${dateFilter === f.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>{f.label}</button>
              ))}
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all">
              <option value="all">كل الحالات</option>
              <option value="paid">مسددة بالكامل</option>
              <option value="debt">عليها مديونية</option>
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3"><Receipt size={18} className="text-indigo-600"/><h3 className="font-black text-sm text-slate-800">سجل الفواتير والمديونيات</h3></div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                   <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="بحث برقم الفاتورة..." className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[10px] focus:ring-2 focus:ring-indigo-500/10" value={innerSearch} onChange={e => setInnerSearch(e.target.value)} />
                </div>
                <button onClick={onUnifiedPayment} className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-xl flex items-center gap-2 text-[11px] font-black"><HandCoins size={16}/> سداد مديونية</button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/50 text-slate-400 font-black text-[9px] border-b">
                  <tr>
                    <th className="p-4 px-6">رقم الفاتورة</th>
                    <th className="p-4 text-center">فاتورة المورد</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('timestamp')}>التاريخ والوقت <ArrowUpDown size={10} className="inline mr-1" /></th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-center">القيمة</th>
                    <th className="p-4 text-center text-rose-500 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('remainingAmount')}>المتبقي <ArrowUpDown size={10} className="inline mr-1" /></th>
                    <th className="p-4 text-left">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {supplierPurchases.length === 0 ? (
                    <tr><td colSpan={7} className="p-10 text-center text-slate-300 italic">{innerSearch.trim() ? 'الفاتورة غير موجودة' : 'لا توجد ديون مسجلة حالياً'}</td></tr>
                  ) : supplierPurchases.map(p => {
                    const status = getStatusConfig(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4 px-6">
                          <button 
                            onClick={() => handleCopy(p.id)} 
                            className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-2 py-1 rounded transition-all"
                            title="اضغط لنسخ الرقم"
                          >
                            #{p.id}
                            {copiedId === p.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-30" />}
                          </button>
                        </td>
                        <td className="p-4 text-center text-slate-600 font-mono text-[10px]">{p.supplierInvoiceNumber || '---'}</td>
                        <td className="p-4 text-slate-400">{p.date} - {p.time}</td>
                        <td className="p-4 text-center"><span className={`px-2 py-0.5 rounded text-[8px] font-black ${status.color}`}>{status.label}</span></td>
                        <td className="p-4 text-center text-slate-900">{p.totalAmount.toLocaleString()}</td>
                        <td className="p-4 text-center text-rose-600">{p.remainingAmount.toLocaleString()}</td>
                        <td className="p-4 text-left">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => onPreviewInvoice(p)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={14}/></button>
                            <button onClick={() => onReturnInvoice(p.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"><RotateCcw size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PurchasesProps {
  products: Product[];
  suppliers: Supplier[];
  purchases: PurchaseRecord[];
  payments: SupplierPayment[];
  onAddSupplier: (name: string, phone?: string, tax?: string) => Supplier;
  onDeleteSupplier: (id: string) => void;
  onAddPurchase: (record: PurchaseRecord) => void;
  onDeletePurchase: (id: string, reason: string, actualReturnValue?: number) => void;
  onRestorePurchase: (id: string) => void;
  onPermanentlyDeletePurchase: (id: string) => void;
  onAddPayment: (supplierId: string, amount: number, purchaseId: string, notes?: string) => void;
  onAddProduct: (n: string, d: string, w: number, r: number, s: number) => Product;
  onUpdateStock: (id: string, qty: number, price: number, retail?: number) => void;
  onShowToast: (m: string, t: 'success' | 'error') => void;
  user: UserType;
}

const Purchases: React.FC<PurchasesProps> = ({ 
  products, suppliers, purchases, payments, 
  onAddSupplier, onDeleteSupplier, onAddPurchase, onDeletePurchase, onRestorePurchase, onPermanentlyDeletePurchase,
  onAddPayment, onAddProduct, onUpdateStock, onShowToast, user 
}) => {
  const [activeView, setActiveView] = useState<'purchases' | 'suppliers'>('purchases');
  const [suppliersViewMode, setSuppliersViewMode] = useState<'grid' | 'list'>('grid');
  const [purchaseSubView, setPurchaseSubView] = useState<'active' | 'returned'>('active');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'debt'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });
  
  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierSearchInAdd, setSupplierSearchInAdd] = useState(''); 
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearchInModal, setProductSearchInModal] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<PurchaseRecord | null>(null);
  const [selectedSupplierProfile, setSelectedSupplierProfile] = useState<Supplier | null>(null);
  const [unifiedPaymentSupplier, setUnifiedPaymentSupplier] = useState<Supplier | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ supplierId: string, purchaseId: string, max: number } | null>(null);
  const [confirmDeleteSupplier, setConfirmDeleteSupplier] = useState<Supplier | null>(null);
  
  // حالات المرتجع المتطور
  const [confirmReturnPurchase, setConfirmReturnPurchase] = useState<{id: string, reason: string, returnItems: Record<string, number>} | null>(null);

  // حالة إضافة صنف توريد
  const [itemDetailModal, setItemDetailModal] = useState<{ 
    productId: string, name: string, costPrice: number, retailPrice: number, quantity: number, notes: string, isNew: boolean, existingStock?: number 
  } | null>(null);

  const totalDebtValue = useMemo(() => purchases.filter(p => !p.isDeleted).reduce((acc, p) => acc + (p.remainingAmount || 0), 0), [purchases]);

  const filteredPurchases = useMemo(() => {
    let list = purchases.filter(p => {
      const matchView = p.isDeleted === (purchaseSubView === 'returned');
      const matchSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.supplierInvoiceNumber && p.supplierInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchSupplier = supplierFilter ? p.supplierName === supplierFilter : true;
      const matchStatus = statusFilter === 'all' ? true : statusFilter === 'paid' ? p.remainingAmount === 0 : p.remainingAmount > 0;

      return matchView && matchSearch && matchSupplier && matchStatus;
    });

    if (sortConfig) {
      list.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof PurchaseRecord] as number;
        const bVal = b[sortConfig.key as keyof PurchaseRecord] as number;
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return list;
  }, [purchases, searchTerm, purchaseSubView, supplierFilter, statusFilter, sortConfig]);

  const groupedPurchases = useMemo(() => {
    const groups: { [key: string]: PurchaseRecord[] } = {};
    filteredPurchases.forEach(p => {
      const d = new Date(p.timestamp);
      const key = d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    // ترتيب المجموعات تنازلياً حسب التاريخ
    return Object.entries(groups).sort((a, b) => new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime());
  }, [filteredPurchases]);

  const sortedSuppliers = useMemo(() => {
    let list = [...suppliers].filter(s => !s.isDeleted && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.phone && s.phone.includes(searchTerm))));
    return list;
  }, [suppliers, searchTerm]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSavePurchase = () => {
    const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return onShowToast("يرجى اختيار مورد", "error");
    const now = new Date();
    const record: PurchaseRecord = {
      id: `PUR-${now.getTime().toString().slice(-6)}`,
      supplierId: selectedSupplierId,
      supplierName: supplier.name,
      taxNumber: supplier.taxNumber,
      supplierInvoiceNumber: invoiceNumber || undefined,
      items: cart,
      totalAmount,
      paidAmount,
      remainingAmount: Math.max(0, totalAmount - paidAmount),
      paymentStatus: paidAmount >= totalAmount ? 'cash' : 'credit',
      date: now.toLocaleDateString('ar-EG'),
      time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
      createdBy: user.id,
      branchId: user.branchId,
      isDeleted: false
    };

    onAddPurchase(record);
    
    // حفظ الأصناف (تحديث القديم أو إنشاء الجديد)
    cart.forEach(item => {
      const existingProduct = products.find(p => p.id === item.productId);
      if (!existingProduct) {
        onAddProduct(item.name, item.notes || '', item.costPrice, item.retailPrice, item.quantity);
      } else {
        onUpdateStock(item.productId, item.quantity, item.costPrice, item.retailPrice);
      }
    });

    onShowToast("تم حفظ التوريد بنجاح وتحديث بيانات المخزن", "success");
    setIsAddOpen(false); setCart([]); setPaidAmount(0); setInvoiceNumber(''); setSelectedSupplierId(''); setSupplierSearchInAdd('');
  };

  const handleConfirmReturn = () => {
    if (!confirmReturnPurchase || !confirmReturnPurchase.reason.trim()) return;
    const purchase = purchases.find(p => p.id === confirmReturnPurchase.id);
    if (!purchase) return;
    
    let totalReturnedValue = 0;
    const details = purchase.items.map(item => {
      const returningQty = confirmReturnPurchase.returnItems[item.productId] || 0;
      const product = products.find(p => p.id === item.productId);
      const finalReturning = Math.min(returningQty, item.quantity, product?.stock || 0);
      
      totalReturnedValue += finalReturning * item.costPrice;
      if (finalReturning > 0) onUpdateStock(item.productId, -finalReturning, item.costPrice);
      
      return { 
        name: item.name, 
        purchased: item.quantity, 
        returning: finalReturning, 
        costPrice: item.costPrice 
      };
    });

    // منطق مالي مطور: خفض المديونية أولاً ثم استرداد نقدي
    const debtReduction = Math.min(totalReturnedValue, purchase.remainingAmount);
    const cashRefund = Math.max(0, totalReturnedValue - debtReduction);

    onDeletePurchase(confirmReturnPurchase.id, confirmReturnPurchase.reason, totalReturnedValue);
    
    // تصدير PDF للمرتجع
    const container = document.createElement('div');
    container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.width = '210mm';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(<ReturnPurchaseTemplate purchase={purchase} reason={confirmReturnPurchase.reason} summary={{details, totalReturnedValue, debtReduction, cashRefund}} />);
    setTimeout(async () => {
      const canvas = await html2canvas(container.firstChild as HTMLElement, { scale: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`Return_Invoice_${purchase.id}.pdf`);
      root.unmount(); document.body.removeChild(container);
    }, 1000);

    setConfirmReturnPurchase(null);
    onShowToast(`تم الإرجاع: خفض مديونية بقيمة ${debtReduction} واسترداد ${cashRefund} نقداً`, "success");
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
          <button onClick={() => setActiveView('purchases')} className={`flex-1 min-w-[120px] py-3 px-6 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeView === 'purchases' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}><Truck size={16} /> سجل التوريد</button>
          <button onClick={() => setActiveView('suppliers')} className={`flex-1 min-w-[120px] py-3 px-6 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeView === 'suppliers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}><User size={16} /> الموردين</button>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="بحث عام..." className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[11px] outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          {activeView === 'purchases' && (
            <button onClick={() => setIsAddOpen(true)} className="px-8 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] flex items-center gap-3 shadow-lg hover:bg-indigo-700 transition-all active:scale-95"><Plus size={16} /> توريد بضاعة</button>
          )}
          {activeView === 'suppliers' && (
            <button onClick={() => setIsSupplierModalOpen(true)} className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl text-[10px] flex items-center gap-2 shadow-lg"><Plus size={14}/> مورد جديد</button>
          )}
        </div>
      </div>

      {/* 2. Analytics & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Receipt size={28}/></div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي الفواتير</p><h3 className="text-xl font-black text-slate-800">{activeView === 'purchases' ? purchases.length : suppliers.length} فاتورة</h3></div>
        </div>
        <div className="bg-rose-50 p-6 rounded-[2.5rem] text-rose-800 border border-rose-100 shadow-rose-100/50 shadow-sm flex items-center gap-5 relative overflow-hidden">
           <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shrink-0"><TrendingDown size={28}/></div>
           <div className="relative z-10">
             <p className="text-[9px] font-black opacity-60 uppercase mb-1 text-rose-500">إجمالي مديونية التوريد</p>
             <h3 className="text-xl font-black">{totalDebtValue.toLocaleString()} ج.م</h3>
           </div>
           <Truck size={80} className="absolute -bottom-6 -left-6 text-rose-100/50 rotate-12" />
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Users size={28}/></div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">الموردين النشطين</p><h3 className="text-xl font-black text-slate-800">{suppliers.filter(s=>!s.isDeleted).length} مورد</h3></div>
        </div>
      </div>

      {activeView === 'purchases' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
           <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3"><Activity size={20} className="text-indigo-600" /><h3 className="font-black text-sm text-slate-800">سجل التوريد التاريخي</h3></div>
              <div className="flex flex-wrap gap-3">
                <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all">
                  <option value="">كل الموردين</option>
                  {suppliers.filter(s=>!s.isDeleted).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all">
                  <option value="all">كل الحالات</option>
                  <option value="paid">مسددة بالكامل</option>
                  <option value="debt">عليها مديونية</option>
                </select>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button onClick={() => setPurchaseSubView('active')} className={`px-6 py-1.5 rounded-lg text-[9px] font-black transition-all ${purchaseSubView === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>النشط</button>
                  <button onClick={() => setPurchaseSubView('returned')} className={`px-6 py-1.5 rounded-lg text-[9px] font-black transition-all ${purchaseSubView === 'returned' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400'}`}>المرتجع</button>
                </div>
              </div>
           </div>
           <div className="p-4 space-y-8">
             {groupedPurchases.length === 0 ? (
               <div className="p-20 text-center text-slate-300 font-bold italic">{searchTerm.trim() || supplierFilter ? 'الفاتورة غير موجودة' : 'لا توجد فواتير توريد مسجلة'}</div>
             ) : (
               groupedPurchases.map(([month, list]) => (
                 <div key={month} className="space-y-4">
                    <div className="flex items-center gap-3 px-4"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div><h4 className="font-black text-[12px] text-slate-700">{month}</h4><div className="flex-1 h-[1px] bg-slate-100"></div></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-[11px] min-w-[1000px]">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b">
                          <tr>
                            <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('timestamp')}>التاريخ والوقت <ArrowUpDown size={10} className="inline mr-1" /></th>
                            <th className="px-8 py-5">المورد</th>
                            <th className="px-8 py-5">الحالة</th>
                            <th className="px-8 py-5 text-center cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('totalAmount')}>الإجمالي <ArrowUpDown size={10} className="inline mr-1" /></th>
                            <th className="px-8 py-5 text-center cursor-pointer hover:bg-slate-100 transition-all text-rose-600" onClick={() => handleSort('remainingAmount')}>المتبقي <ArrowUpDown size={10} className="inline mr-1" /></th>
                            <th className="px-8 py-5 text-left">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold">
                          {list.map(p => { const status = getStatusConfig(p); return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-8 py-4">
                                <button 
                                  onClick={() => handleCopy(p.id)} 
                                  className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-2 py-1 rounded transition-all"
                                  title="اضغط للنسخ وتأكيد العملية"
                                >
                                  #{p.id}
                                  {copiedId === p.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-30" />}
                                </button>
                                <p className="text-[9px] text-slate-400 mt-1">{p.date} - {p.time}</p>
                              </td>
                              <td className="px-8 py-4"><button onClick={() => { setActiveView('suppliers'); setSelectedSupplierProfile(suppliers.find(s=>s.id === p.supplierId) || null); }} className="text-slate-800 hover:text-indigo-600 transition-all hover:underline">{p.supplierName}</button></td>
                              <td className="px-8 py-4 text-center"><span className={`px-3 py-1 rounded-lg text-[8px] font-black border ${status.color}`}>{status.label}</span></td>
                              <td className="px-8 py-4 text-center text-slate-900 font-black">{p.totalAmount.toLocaleString()}</td>
                              <td className="px-8 py-4 text-center text-rose-600">{p.remainingAmount.toLocaleString()}</td>
                              <td className="px-8 py-4 text-left"><button onClick={() => setPreviewInvoice(p)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={16}/></button></td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      ) : (
        <div className={suppliersViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {sortedSuppliers.map(s => {
            return (
              <div key={s.id} className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group ${suppliersViewMode === 'list' ? 'flex items-center justify-between p-4 px-8' : 'p-6'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><User size={24}/></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-800 text-sm">{s.name}</h4>
                      {s.taxNumber && <span className="bg-indigo-50 text-indigo-500 text-[8px] px-2 py-0.5 rounded font-black border border-indigo-100">ضريبي: {s.taxNumber}</span>}
                    </div>
                    {s.phone && <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1"><Phone size={10}/> {s.phone}</p>}
                  </div>
                </div>

                <div className={suppliersViewMode === 'grid' ? "grid grid-cols-2 gap-3 my-6" : "flex gap-8 mx-8"}>
                   <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center text-blue-800 shadow-blue-100 shadow-sm"><p className="text-[8px] font-black text-blue-400 uppercase mb-1">إجمالي التوريد</p><p className="text-xs font-black">{s.totalSupplied.toLocaleString()} ج.م</p></div>
                   <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-center text-rose-800 shadow-rose-100 shadow-sm"><p className="text-[8px] font-black opacity-60 uppercase mb-1 text-rose-400">المديونية</p><p className="text-xs font-black">{s.totalDebt.toLocaleString()} ج.م</p></div>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={() => setSelectedSupplierProfile(s)} className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"> كشف حساب</button>
                  <button onClick={() => setConfirmDeleteSupplier(s)} className="p-3 bg-rose-50 text-rose-300 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"><Trash2 size={16}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unified Payment Selection Modal */}
      {unifiedPaymentSupplier && (
        <UnifiedPaymentSelectionModal supplier={unifiedPaymentSupplier} purchases={purchases} onClose={() => { setUnifiedPaymentSupplier(null); setSelectedSupplierProfile(unifiedPaymentSupplier); }} onSelectInvoice={(pid, max) => { setPaymentModal({ supplierId: unifiedPaymentSupplier.id, purchaseId: pid, max }); setUnifiedPaymentSupplier(null); }} />
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1300] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in">
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0"><h3 className="font-black text-sm flex items-center gap-2"><HandCoins size={18}/> سداد مديونية مورد</h3><button onClick={() => {setPaymentModal(null); setSelectedSupplierProfile(suppliers.find(s=>s.id === paymentModal.supplierId) || null);}} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button></div>
              <div className="p-8 space-y-6">
                 <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center"><p className="text-[10px] font-black text-indigo-400">المبلغ المتبقي بالفاتورة</p><p className="text-xl font-black text-indigo-700">{paymentModal.max.toLocaleString()} ج.م</p></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المبلغ المراد سداده</label><input type="number" autoFocus className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" value={paidAmount || ''} onChange={e => setPaidAmount(Number(e.target.value))} /></div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3 border-t"><button onClick={() => {setPaymentModal(null); setSelectedSupplierProfile(suppliers.find(s=>s.id === paymentModal.supplierId) || null);}} className="flex-1 py-3 bg-white border text-slate-500 font-black rounded-xl text-xs">إلغاء</button><button onClick={() => {if(!paidAmount || paidAmount <= 0) return; onAddPayment(paymentModal.supplierId, paidAmount, paymentModal.purchaseId, "سداد توريد"); setPaymentModal(null); setPaidAmount(0); onShowToast("تم تسجيل السداد بنجاح", "success"); setSelectedSupplierProfile(suppliers.find(s=>s.id === paymentModal.supplierId) || null);}} className="flex-[2] py-3 bg-emerald-600 text-white font-black rounded-xl text-xs shadow-xl active:scale-95 transition-all">تأكيد السداد</button></div>
           </div>
        </div>
      )}

      {/* Confirm Return Purchase Modal (المطورة لدعم الارتجاع الجزئي والمالي) */}
      {confirmReturnPurchase && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in border border-rose-100 flex flex-col max-h-[90vh]">
              <div className="p-6 bg-rose-600 text-white flex justify-between items-center shrink-0"><h3 className="font-black text-sm flex items-center gap-2"><RotateCcw size={18}/> إرجاع فاتورة (كلي/جزئي)</h3><button onClick={() => setConfirmReturnPurchase(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button></div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scrollbar-hide">
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[9px] font-black text-amber-600 leading-relaxed italic">ملاحظة: سيتم خصم قيمة المرتجع من المديونية أولاً، وفي حال كانت الفاتورة مسددة بالكامل يتم رد المبلغ نقداً.</p>
                 </div>
                 
                 <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-400 font-black text-[9px] border-b">
                        <tr><th className="p-4">الصنف</th><th className="p-4 text-center">المشتري</th><th className="p-4 text-center">بالمخزن</th><th className="p-4 text-center">الرد</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {purchases.find(p=>p.id === confirmReturnPurchase.id)?.items.map(item => {
                          const product = products.find(p=>p.id === item.productId);
                          const maxToReturn = Math.min(item.quantity, product?.stock || 0);
                          return (
                            <tr key={item.productId} className="hover:bg-slate-50">
                              <td className="p-4 font-black text-slate-800">{item.name}</td>
                              <td className="p-4 text-center font-bold text-slate-400">{item.quantity}</td>
                              <td className="p-4 text-center font-black text-indigo-600">{product?.stock || 0}</td>
                              <td className="p-4 text-center">
                                <input 
                                  type="number" 
                                  min="0" 
                                  max={maxToReturn} 
                                  className="w-16 px-2 py-1.5 bg-slate-50 border rounded-lg text-center font-black text-xs text-rose-600 outline-none focus:ring-2 focus:ring-rose-500/20"
                                  value={confirmReturnPurchase.returnItems[item.productId] || 0}
                                  onChange={e => {
                                    const val = Math.min(maxToReturn, Number(e.target.value));
                                    setConfirmReturnPurchase({...confirmReturnPurchase, returnItems: {...confirmReturnPurchase.returnItems, [item.productId]: val}});
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                 </div>

                 <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">سبب الارتجاع</label><textarea autoFocus className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs h-24" placeholder="مثال: تلف، انتهاء صلاحية..." value={confirmReturnPurchase.reason} onChange={e => setConfirmReturnPurchase({...confirmReturnPurchase, reason: e.target.value})} /></div>
              </div>
              <div className="p-6 bg-white flex gap-3 border-t shrink-0"><button onClick={() => setConfirmReturnPurchase(null)} className="flex-1 py-3 bg-slate-100 border text-slate-500 font-black rounded-xl text-xs">إلغاء</button><button onClick={handleConfirmReturn} disabled={!confirmReturnPurchase.reason.trim() || Object.values(confirmReturnPurchase.returnItems).every(v=>v===0)} className="flex-[2] py-3 bg-rose-600 text-white font-black rounded-xl text-xs shadow-xl active:scale-95 transition-all">تأكيد المرتجع وإصدار PDF</button></div>
           </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-indigo-100">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <h3 className="font-black text-sm flex items-center gap-3"><Truck size={20} /> تسجيل فاتورة توريد جديدة</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 scrollbar-hide space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المورد</label>
                      <div className="relative mt-1">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" placeholder="ابحث باسم المورد أو الهاتف..." className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm" value={supplierSearchInAdd} onChange={e => {setSupplierSearchInAdd(e.target.value); setShowSupplierDropdown(true);}} />
                        {showSupplierDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden divide-y">
                             {suppliers.filter(s => !s.isDeleted && (s.name.toLowerCase().includes(supplierSearchInAdd.toLowerCase()) || (s.phone && s.phone.includes(supplierSearchInAdd)))).slice(0, 5).map(s => (
                               <button key={s.id} onClick={() => {setSelectedSupplierId(s.id); setSupplierSearchInAdd(s.name); setShowSupplierDropdown(false);}} className="w-full p-3 text-right flex items-center justify-between hover:bg-indigo-50 transition-colors">
                                  <div><p className="text-[11px] font-black text-slate-800">{s.name}</p></div>
                                  <div className="text-left"><p className="text-[9px] font-black text-rose-500">مديونية: {s.totalDebt} ج.م</p></div>
                               </button>
                             ))}
                             {suppliers.filter(s => !s.isDeleted && (s.name.toLowerCase().includes(supplierSearchInAdd.toLowerCase()))).length === 0 && supplierSearchInAdd && (
                                <button onClick={() => { onAddSupplier(supplierSearchInAdd); setShowSupplierDropdown(false); }} className="w-full p-3 text-indigo-600 font-black text-xs hover:bg-indigo-50 flex items-center gap-2"><Plus size={14}/> إضافة كمورد جديد</button>
                             )}
                          </div>
                        )}
                      </div>
                   </div>
                   <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم فاتورة المورد (اختياري)</label><input type="text" placeholder="رقم الفاتورة الورقية..." className="w-full px-5 py-3 mt-1 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">أصناف الفاتورة</label>
                   <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="ابحث عن صنف أو اكتب اسم صنف جديد..." className="w-full pr-11 pl-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-black text-sm shadow-inner" value={productSearchInModal} onChange={e => {setProductSearchInModal(e.target.value); setShowProductDropdown(true);}} />
                      {showProductDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[110]">
                           {products.filter(p=>!p.isDeleted && (p.name.toLowerCase().includes(productSearchInModal.toLowerCase()) || p.code.includes(productSearchInModal))).slice(0, 5).map(p => (
                             <button key={p.id} onClick={() => { setItemDetailModal({ productId: p.id, name: p.name, costPrice: p.wholesalePrice, retailPrice: p.retailPrice, quantity: 1, notes: '', isNew: false, existingStock: p.stock }); setShowProductDropdown(false); setProductSearchInModal(''); }} className="w-full p-4 flex items-center justify-between hover:bg-indigo-50 border-b last:border-0 group">
                                <div className="text-right">
                                  <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600">{p.name}</p>
                                  <p className="text-[9px] text-slate-400">رصيد: {p.stock} | تكلفة: {p.wholesalePrice} ج.م</p>
                                </div>
                                <Plus size={18} className="text-indigo-600" />
                             </button>
                           ))}
                           {productSearchInModal && products.filter(p=>!p.isDeleted && p.name.toLowerCase().includes(productSearchInModal.toLowerCase())).length === 0 && (
                             <button onClick={() => { setItemDetailModal({ productId: 'NEW-'+Date.now(), name: productSearchInModal, costPrice: 0, retailPrice: 0, quantity: 1, notes: '', isNew: true }); setShowProductDropdown(false); setProductSearchInModal(''); }} className="w-full p-5 text-indigo-600 font-black text-xs hover:bg-indigo-50 flex items-center justify-center gap-3"><PackagePlus size={18}/> تعريف "{productSearchInModal}" كصنف توريد جديد</button>
                           )}
                        </div>
                      )}
                   </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                   <div className="p-4 bg-slate-50 border-b font-black text-[10px] text-slate-500 uppercase tracking-widest">قائمة أصناف التوريد</div>
                   <div className="flex-1 overflow-x-auto"><table className="w-full text-right text-xs min-w-[600px]"><thead className="bg-slate-50/50 text-slate-400 text-[9px] border-b"><tr><th className="p-4">الصنف</th><th className="p-4 text-center">التكلفة</th><th className="p-4 text-center">الكمية</th><th className="p-4 text-left">الإجمالي</th><th className="p-4"></th></tr></thead>
                         <tbody className="divide-y divide-slate-50 font-bold">{cart.map(item => (
                               <tr key={item.productId} className="hover:bg-slate-50 transition-colors"><td className="p-4">
                                  <p className="text-slate-800 font-black">{item.name}</p>
                               </td><td className="p-4 text-center">{item.costPrice.toLocaleString()}</td><td className="p-4 text-center">{item.quantity}</td><td className="p-4 text-left text-indigo-600">{item.subtotal.toLocaleString()}</td><td className="p-4 text-left"><button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td></tr>
                            ))}</tbody></table></div>
                </div>
             </div>
             <div className="p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row items-center gap-6 shrink-0 shadow-sm">
                <div className="flex-1 flex gap-6 items-center w-full">
                   <div className="space-y-1 flex-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">المسدد الآن (كاش)</label><input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm shadow-inner" value={paidAmount || ''} onChange={e => setPaidAmount(Number(e.target.value))} /></div>
                   <div className="text-left shrink-0"><p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">إجمالي الفاتورة</p><p className="text-2xl font-black text-slate-800">{cart.reduce((a,b)=>a+b.subtotal, 0).toLocaleString()} ج.م</p></div>
                </div>
                <div className="flex gap-4 w-full md:w-auto"><button onClick={() => setIsAddOpen(false)} className="flex-1 md:w-32 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px]">إلغاء</button><button onClick={handleSavePurchase} disabled={!selectedSupplierId || cart.length === 0} className="flex-[2] md:w-64 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl text-[10px] active:scale-95 transition-all disabled:opacity-50">حفظ التوريد</button></div>
             </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {itemDetailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in border border-indigo-100">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center"><h3 className="font-black text-sm flex items-center gap-2"><Tag size={18} /> {itemDetailModal.isNew ? 'تعريف صنف توريد جديد' : 'تحديث صنف من المخزن'}</h3><button onClick={() => setItemDetailModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button></div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 mb-1">اسم الصنف</p>
                <input type="text" className="w-full text-center text-lg font-black text-slate-800 bg-slate-50 border-none rounded-xl py-2" value={itemDetailModal.name} onChange={e => setItemDetailModal({...itemDetailModal, name: e.target.value})} />
                {!itemDetailModal.isNew && <p className="text-[9px] text-indigo-500 font-black mt-2">متوفر بالمخزن حالياً: {itemDetailModal.existingStock} قطعة</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">سعر التكلفة</label><input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" value={itemDetailModal.costPrice || ''} onChange={e => setItemDetailModal({...itemDetailModal, costPrice: Number(e.target.value)})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">سعر البيع</label><input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" value={itemDetailModal.retailPrice || ''} onChange={e => setItemDetailModal({...itemDetailModal, retailPrice: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">الكمية الواردة</label><input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" value={itemDetailModal.quantity || ''} onChange={e => setItemDetailModal({...itemDetailModal, quantity: Number(e.target.value)})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">ملاحظات على الصنف</label><input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={itemDetailModal.notes} onChange={e => setItemDetailModal({...itemDetailModal, notes: e.target.value})} placeholder="مثال: تاريخ صلاحية معين، دفعة خاصة..." /></div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-4"><button onClick={() => setItemDetailModal(null)} className="flex-1 py-4 bg-white border text-slate-500 font-black rounded-2xl text-[10px]">إلغاء</button><button onClick={() => {
              if(!itemDetailModal.name.trim() || itemDetailModal.quantity <= 0) return;
              const newItem: PurchaseItem = { productId: itemDetailModal.productId, name: itemDetailModal.name, quantity: itemDetailModal.quantity, costPrice: itemDetailModal.costPrice, retailPrice: itemDetailModal.retailPrice, subtotal: itemDetailModal.costPrice * itemDetailModal.quantity, notes: itemDetailModal.notes };
              setCart(prev => [...prev.filter(i => i.productId !== newItem.productId), newItem]);
              setItemDetailModal(null);
            }} className="flex-[1.5] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl text-[10px] active:scale-95 transition-all">تأكيد الإضافة</button></div>
          </div>
        </div>
      )}

      {/* Preview Invoice Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1400] flex items-center justify-center p-4 md:p-8 animate-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4"><div className="p-2.5 bg-white/20 rounded-xl border border-white/30"><Eye size={20}/></div><div><h3 className="font-black text-base">معاينة فاتورة توريد</h3><p className="text-[10px] font-bold opacity-70 mt-0.5 font-mono">#{previewInvoice.id}</p></div></div>
                <button onClick={() => setPreviewInvoice(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto bg-slate-50 p-12 scrollbar-hide">
                <div className="bg-white p-10 border border-slate-100 rounded-[2rem] shadow-sm text-right">
                  <div className="flex justify-between items-start mb-8 pb-8 border-b">
                    <div><h4 className="text-3xl font-black text-indigo-600">ميزة POS</h4><p className="text-[10px] font-black text-slate-400 uppercase">سند توريد مؤرشف</p></div>
                    <div className="text-left text-xs space-y-1"><p className="font-black font-mono">#{previewInvoice.id}</p><p className="text-slate-400 font-bold">{previewInvoice.date} - {previewInvoice.time}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">المورد</p><p className="text-xl font-black text-slate-800">{previewInvoice.supplierName}</p></div>
                    <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">حالة السداد</p><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${getStatusConfig(previewInvoice).color}`}>{getStatusConfig(previewInvoice).label}</span></div>
                  </div>
                  <table className="w-full text-right mb-10 text-xs"><thead className="bg-slate-50 text-[10px] font-black border-b text-slate-500"><tr><th className="p-4">الصنف</th><th className="p-4 text-center">التكلفة</th><th className="p-4 text-center">الكمية</th><th className="p-4 text-left">الإجمالي</th></tr></thead>
                    <tbody className="divide-y font-bold">{previewInvoice.items.map((it, idx)=>(<tr key={idx}><td className="p-4 text-slate-700">{it.name}</td><td className="p-4 text-center">{it.costPrice.toLocaleString()}</td><td className="p-4 text-center">{it.quantity}</td><td className="p-4 text-left text-indigo-600">{it.subtotal.toLocaleString()}</td></tr>))}</tbody></table>
                  <div className="flex justify-end pt-8 border-t">
                    <div className="w-72 space-y-4 bg-slate-50 p-6 rounded-2xl">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>إجمالي الفاتورة:</span><span>{previewInvoice.totalAmount.toLocaleString()} ج.م</span></div>
                      <div className="flex justify-between text-[10px] font-black text-emerald-500 uppercase"><span>المسدد:</span><span>{previewInvoice.paidAmount.toLocaleString()} ج.م</span></div>
                      <div className="flex justify-between text-lg font-black text-rose-600 border-t pt-2 border-slate-200 uppercase"><span>الصافي المتبقي:</span><span>{previewInvoice.remainingAmount.toLocaleString()} ج.م</span></div>
                    </div>
                  </div>
                </div>
             </div>
             <div className="p-6 bg-white border-t flex justify-end shrink-0 gap-3">
               <button onClick={() => { onShowToast("جاري تصدير PDF...", "success"); }} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[11px] flex items-center gap-2 shadow-lg"><DownloadCloud size={18}/> تحميل PDF</button>
               <button onClick={() => setPreviewInvoice(null)} className="px-10 py-3 bg-slate-100 text-slate-500 font-black rounded-2xl text-[11px]">إغلاق</button>
             </div>
          </div>
        </div>
      )}

      {/* Supplier Profile Modal */}
      {selectedSupplierProfile && (
        <SupplierHistoryModal 
          supplier={selectedSupplierProfile} 
          purchases={purchases} 
          payments={payments} 
          onClose={() => setSelectedSupplierProfile(null)} 
          onPreviewInvoice={setPreviewInvoice} 
          onReturnInvoice={(pid) => {
            const p = purchases.find(pur => pur.id === pid);
            const initialItems: Record<string, number> = {};
            p?.items.forEach(i => initialItems[i.productId] = 0);
            setConfirmReturnPurchase({id: pid, reason: '', returnItems: initialItems}); 
            setSelectedSupplierProfile(null);
          }} 
          onUnifiedPayment={() => { setUnifiedPaymentSupplier(selectedSupplierProfile); setSelectedSupplierProfile(null); }} 
        />
      )}
    </div>
  );
};

export default Purchases;