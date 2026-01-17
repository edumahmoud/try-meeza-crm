
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Search, Eye, Hash, X, DownloadCloud, MessageCircle, Copy, Check, Trash2, AlertTriangle, Info, Printer, User, Calendar, Phone } from 'lucide-react';
import { Invoice, ViewType, User as UserType } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceTemplate: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  if (!invoice) return <div className="p-10 text-center text-rose-500 font-bold">خطأ في تحميل بيانات السند</div>;
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = Number(invoice.totalBeforeDiscount) || 0;
  const isPercentage = invoice.discountType === 'percentage';
  const discountVal = Number(invoice.discountValue) || 0;
  const discountAmt = isPercentage ? (subtotal * discountVal / 100) : discountVal;
  const netTotal = Number(invoice.netTotal) || 0;
  return (
    <div className="bg-white text-slate-800 w-full max-w-[210mm] mx-auto p-6 md:p-12 shadow-sm border border-slate-100 rounded-[1.5rem] select-text" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex justify-between items-start mb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-indigo-600 mb-1">ميزة</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mr-1">سجلات الأرشيف الموثقة</p>
        </div>
        <div className="text-left bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">حالة السجل</p>
          <p className="text-sm font-black text-indigo-700">سند مبيعات مؤرشف</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 py-8 border-y border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Hash size={14}/></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p><p className="text-sm font-black text-slate-700 select-all">#{invoice.id}</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Calendar size={14}/></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">تاريخ الأرشفة</p><p className="text-sm font-black text-slate-700">{invoice.date} | {invoice.time}</p></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase">العميل</p><p className="text-sm font-black text-slate-700">{invoice.customerName || 'عميل نقدي'}</p></div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><User size={14}/></div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase">البائع</p><p className="text-sm font-black text-slate-700">{invoice.creatorUsername || 'غير مسجل'}</p></div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><User size={14}/></div>
          </div>
        </div>
      </div>
      <div className="mb-12 overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead><tr className="bg-slate-50/50 text-slate-500 font-black text-[10px] uppercase"><th className="p-5">الصنف</th><th className="p-5 text-center">السعر</th><th className="p-5 text-center">الكمية</th><th className="p-5 text-left">الإجمالي</th></tr></thead>
          <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={idx}><td className="p-5">{item.name}</td><td className="p-5 text-center text-slate-400">{item.unitPrice.toLocaleString()}</td><td className="p-5 text-center font-black">{item.quantity}</td><td className="p-5 text-left font-black text-indigo-600">{item.subtotal.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="flex-1 w-full md:max-w-xs space-y-4">
          {invoice.notes && (<div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">ملاحظات مؤرشفة</p><p className="text-11px font-bold text-slate-600 leading-relaxed italic">{invoice.notes}</p></div>)}
        </div>
        <div className="w-full md:w-60 bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-100 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase"><span>الإجمالي:</span><span>{subtotal.toLocaleString()} ج.م</span></div>
          {discountAmt > 0 && (<div className="flex justify-between items-center text-[10px] font-black text-rose-500 pb-4 border-b border-indigo-100"><span>الخصم الممنوح:</span><span>- {discountAmt.toLocaleString()} ج.م</span></div>)}
          <div className="flex justify-between items-center pt-1"><span className="text-[11px] font-black text-slate-900">الصافي</span><div className="text-xl font-black text-indigo-600">{netTotal.toLocaleString()} <span className="text-[10px] font-bold text-indigo-400">ج.م</span></div></div>
        </div>
      </div>
    </div>
  );
};

interface ArchiveProps {
  invoices: Invoice[];
  onDeleteInvoice: (id: string, reason: string, restoreStock: boolean) => void;
  onGoToView?: (view: ViewType) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  user: UserType;
}

const Archive: React.FC<ArchiveProps> = ({ invoices, onDeleteInvoice, onGoToView, onShowToast, user }) => {
  const [search, setSearch] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{id: string, reason: string} | null>(null);
  const [restoreStock, setRestoreStock] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isAdminOrSuper = user.role === 'admin' || user.role === 'supervisor';

  const activeInvoices = useMemo(() => invoices.filter(inv => !inv.isDeleted), [invoices]);
  const filtered = activeInvoices.filter(inv => inv.id.toLowerCase().includes(search.toLowerCase()) || inv.customerName?.toLowerCase().includes(search.toLowerCase()) || inv.creatorUsername?.toLowerCase().includes(search.toLowerCase()));

  const handleDownloadPDF = async (inv: Invoice) => {
    onShowToast?.("جاري تجهيز السجل...", "success");
    const container = document.createElement('div');
    container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.top = '-9999px'; container.style.width = '210mm';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(<InvoiceTemplate invoice={inv} />);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
        const element = container.firstChild as HTMLElement;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Meeza_Archive_${inv.id}.pdf`);
    } catch (err) {} finally { root.unmount(); document.body.removeChild(container); }
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] no-print select-text" dir="rtl">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-6 items-center justify-between no-print h-auto md:h-24">
        <div className="relative flex-1"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="ابحث برقم الفاتورة أو العميل أو البائع..." className="w-full pr-14 pl-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100"><Hash size={16} className="inline mr-2" /> السجلات: {activeInvoices.length}</div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[10px] min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b">
              <tr><th className="px-6 py-5">رقم السند</th><th className="px-6 py-5">التوقيت</th><th className="px-6 py-5">العميل</th>{isAdminOrSuper && <th className="px-6 py-5">البائع</th>}<th className="px-6 py-5 text-center">الصافي</th><th className="px-6 py-5 text-left">الإجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4"><button onClick={() => {navigator.clipboard.writeText(inv.id); setCopiedId(inv.id); setTimeout(()=>setCopiedId(null),2000)}} className="flex items-center gap-2 text-indigo-600 font-black px-2 py-1 rounded hover:bg-indigo-50 transition-all">#{inv.id}{copiedId === inv.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-30" />}</button></td>
                    <td className="px-6 py-4 text-slate-400">{inv.date} | {inv.time}</td>
                    <td className="px-6 py-4 text-slate-800">{inv.customerName || 'نقدي'}</td>
                    {isAdminOrSuper && <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded-md text-slate-600 text-[9px]">{inv.creatorUsername || '---'}</span></td>}
                    <td className="px-6 py-4 text-center font-black text-slate-900">{inv.netTotal.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-left"><div className="flex gap-2 justify-end">
                        <button onClick={() => setPreviewInvoice({...inv})} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Eye size={16} /></button>
                        <button onClick={() => handleDownloadPDF(inv)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-700 hover:text-white transition-all"><DownloadCloud size={16} /></button>
                        {user.role === 'admin' && (<button onClick={() => setConfirmDelete({id: inv.id, reason: ''})} className="p-2 bg-slate-100 text-slate-300 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>)}
                    </div></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 md:p-8 animate-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4"><div className="p-2.5 bg-white/20 rounded-xl border border-white/30"><Eye size={20}/></div><div><h3 className="font-black text-base">معاينة أرشيف ميزة</h3><p className="text-[10px] font-bold opacity-70 mt-0.5">سجل رقم {previewInvoice.id}</p></div></div>
                <button onClick={() => setPreviewInvoice(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 scrollbar-hide"><div className="max-w-[210mm] mx-auto origin-top"><InvoiceTemplate invoice={previewInvoice} /></div></div>
             <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0"><button onClick={() => setPreviewInvoice(null)} className="px-10 py-3 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px]">إغلاق</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
