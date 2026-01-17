
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Search, Users, Phone, ShoppingBag, Calendar, Eye, DownloadCloud, MessageCircle, ArrowRight, UserCheck, Info, X, Printer, Hash, User } from 'lucide-react';
import { Invoice } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceTemplate: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  if (!invoice) return <div className="p-10 text-center text-rose-500 font-bold">خطأ في تحميل بيانات السند</div>;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = Number(invoice.totalBeforeDiscount) || 0;
  const isPercentage = invoice.discountType === 'percentage';
  const discountVal = Number(invoice.discountValue) || 0;
  const discountAmt = isPercentage ? (subtotal * discountVal / 100) : discountVal;
  const discountPerc = isPercentage ? discountVal : (subtotal > 0 ? ((discountVal / subtotal) * 100).toFixed(0) : 0);
  const netTotal = Number(invoice.netTotal) || 0;

  return (
    <div className="bg-white text-slate-800 w-full max-w-[210mm] mx-auto p-6 md:p-12 shadow-sm border border-slate-100 rounded-[1.5rem] select-text" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex justify-between items-start mb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-indigo-600 mb-1">ميزة</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mr-1">سجل مشتريات العميل</p>
        </div>
        <div className="text-left bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">نوع السند</p>
          <p className="text-sm font-black text-emerald-700">سجل مشتريات موثق</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 py-8 border-y border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Hash size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p>
              <p className="text-sm font-black text-slate-700 select-all">#{invoice.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Calendar size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">تاريخ السند</p>
              <p className="text-sm font-black text-slate-700">{invoice.date}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">العميل</p>
              <p className="text-sm font-black text-slate-700">{invoice.customerName}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><User size={14}/></div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">رقم الهاتف</p>
              <p className="text-sm font-black text-slate-700 select-all">{invoice.customerPhone || '---'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Phone size={14}/></div>
          </div>
        </div>
      </div>

      <div className="mb-12 overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm">
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
          {invoice.notes && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">ملاحظات السجل</p>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="w-full md:w-60 bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-100 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
            <span>إجمالي السند:</span>
            <span className="text-slate-600">{subtotal.toLocaleString()} ج.م</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between items-center text-[10px] font-black text-rose-500 pb-4 border-b border-indigo-100">
              <span>الخصم الممنوح:</span>
              <span>- {discountAmt.toLocaleString()} ج.م</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] font-black text-slate-900 uppercase">صافي السند</span>
            <div className="text-xl font-black text-indigo-600">
              {netTotal.toLocaleString()} <span className="text-[10px] font-bold text-indigo-400">ج.م</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-dashed border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">شكراً لولائكم الدائم لـ ميزة</p>
        <p className="text-[9px] font-bold text-slate-300 italic">تم إصدار السجل عبر نظام ميزة المتكامل</p>
      </div>
    </div>
  );
};

interface CustomersProps {
  invoices: Invoice[];
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

const Customers: React.FC<CustomersProps> = ({ invoices, onShowToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const customerList = useMemo(() => {
    const map = new Map<string, { phone: string, name: string, totalSpending: number, lastVisit: string, invoiceCount: number }>();
    invoices.filter(inv => !inv.isDeleted && inv.customerPhone).forEach(inv => {
      const phone = inv.customerPhone!;
      const current = map.get(phone) || { phone, name: inv.customerName || 'بدون اسم', totalSpending: 0, lastVisit: inv.date, invoiceCount: 0 };
      current.totalSpending += inv.netTotal;
      current.invoiceCount += 1;
      if (new Date(inv.timestamp) > new Date(current.lastVisit)) current.lastVisit = inv.date;
      map.set(phone, current);
    });
    return Array.from(map.values()).filter(c => c.name.includes(searchTerm) || c.phone.includes(searchTerm)).sort((a,b) => b.totalSpending - a.totalSpending);
  }, [invoices, searchTerm]);

  const customerInvoices = useMemo(() => {
    if (!selectedCustomerPhone) return [];
    return invoices.filter(inv => inv.customerPhone === selectedCustomerPhone && !inv.isDeleted).sort((a,b) => b.timestamp - a.timestamp);
  }, [invoices, selectedCustomerPhone]);

  const selectedCustomer = useMemo(() => customerList.find(c => c.phone === selectedCustomerPhone), [customerList, selectedCustomerPhone]);

  const handleDownloadPDF = async (inv: Invoice) => {
    if (!inv) return;
    onShowToast?.("جاري تجهيز التحميل...", "success");
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '210mm';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<InvoiceTemplate invoice={inv} />);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const element = container.firstChild as HTMLElement;
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 1200
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Meeza_Customer_${inv.id}.pdf`);
        onShowToast?.("تم تحميل سجل العميل بنجاح", "success");
    } catch (err) { 
        onShowToast?.("خطأ في تحميل PDF", "error"); 
    } finally {
        root.unmount();
        document.body.removeChild(container);
    }
  };

  const handlePrint = (inv: Invoice) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.right = '1000%'; iframe.style.bottom = '1000%';
    iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const itemsHtml = (inv.items || []).map(item => `<tr><td>${item.name}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:left;">${item.subtotal.toLocaleString()}</td></tr>`).join('');

    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap" rel="stylesheet"><style>body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1e293b; }.header { text-align: center; margin-bottom: 20px; }.brand { font-size: 32px; font-weight: 900; color: #4f46e5; }table { width: 100%; border-collapse: collapse; margin-top: 20px; }th, td { border-bottom: 1px solid #f1f5f9; padding: 12px 0; text-align: right; }</style></head><body><div class="header"><h1 class="brand">ميزة</h1><p>سجل مشتريات موثق</p></div><table><thead><tr><th>الصنف</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table></body></html>`;
    doc.open(); doc.write(html); doc.close();
    iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); };
  };

  if (selectedCustomerPhone && selectedCustomer) {
    return (
      <div className="space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
           <button onClick={() => setSelectedCustomerPhone(null)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 text-xs font-black"><ArrowRight size={18} /> العودة للقائمة</button>
           <div className="text-left"><h3 className="text-xl font-black text-indigo-600">{selectedCustomer.name}</h3><p className="text-[10px] text-slate-400 font-bold select-all">{selectedCustomer.phone}</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl"><p className="text-[9px] font-black opacity-60 uppercase mb-1">إجمالي المشتريات</p><h4 className="text-2xl font-black">{selectedCustomer.totalSpending.toLocaleString()} <span className="text-xs">ج.م</span></h4></div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">عدد الزيارات</p><h4 className="text-2xl font-black text-slate-800">{selectedCustomer.invoiceCount} مرة</h4></div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">آخر زيارة</p><h4 className="text-xl font-black text-slate-800">{selectedCustomer.lastVisit}</h4></div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b bg-slate-50/30 flex items-center gap-3"><ShoppingBag size={20} className="text-indigo-600" /><h3 className="text-lg font-black text-slate-800">سجل فواتير ميزة للعميل</h3></div>
           <div className="overflow-x-auto"><table className="w-full text-right text-[10px]"><thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b"><tr><th className="px-8 py-5">رقم الفاتورة</th><th className="px-8 py-5">التاريخ</th><th className="px-8 py-5 text-center">الصافي</th><th className="px-8 py-5 text-left">الإجراءات</th></tr></thead>
                 <tbody className="divide-y divide-slate-50 font-bold">{customerInvoices.map(inv => (
                       <tr key={inv.id} className="hover:bg-slate-50/50 transition-all"><td className="px-8 py-4 text-indigo-600 font-black select-all">#{inv.id}</td><td className="px-8 py-4 text-slate-400">{inv.date}</td><td className="px-8 py-4 text-center text-slate-900 font-black">{inv.netTotal.toLocaleString()} ج.م</td><td className="px-8 py-4 text-left"><div className="flex gap-2 justify-end"><button onClick={() => setPreviewInvoice({...inv})} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Eye size={14}/></button><button onClick={() => handleDownloadPDF(inv)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-700 hover:text-white transition-all"><DownloadCloud size={14} /></button></div></td></tr>
                    ))}</tbody></table></div>
        </div>

        {previewInvoice && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 md:p-8 animate-in transition-all">
            <div className="bg-white rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
              <div className="p-6 border-b bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/30 shadow-lg">
                    <ShoppingBag size={20}/>
                  </div>
                  <div>
                    <h3 className="font-black text-base">سجل مشتريات ميزة</h3>
                    <p className="text-[10px] font-bold opacity-70 uppercase mt-0.5 select-all">سجل العميل رقم {previewInvoice.id}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewInvoice(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                  <X size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 scrollbar-hide">
                <div className="max-w-[210mm] mx-auto origin-top">
                  <InvoiceTemplate invoice={previewInvoice} />
                </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between no-print shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button onClick={() => handleDownloadPDF(previewInvoice)} className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all">
                    <DownloadCloud size={20} /> استخراج PDF
                  </button>
                  <button onClick={() => handlePrint(previewInvoice)} className="flex-1 md:flex-none px-10 py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl text-sm flex items-center justify-center gap-3 hover:bg-black transition-all">
                    <Printer size={20} /> طباعة
                  </button>
                </div>
                <button onClick={() => setPreviewInvoice(null)} className="w-full md:w-auto px-10 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-sm hover:bg-slate-200 transition-all">إغلاق</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between h-auto md:h-24"><div className="relative flex-1"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="ابحث عن عميل بالاسم أو الهاتف..." className="w-full pr-14 pl-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black flex items-center justify-center gap-3 border border-indigo-100"><Users size={16} /> عملاء ميزة: {customerList.length}</div></div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]"><div className="overflow-x-auto"><table className="w-full text-right text-[10px]"><thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b"><tr><th className="px-8 py-5">العميل</th><th className="px-8 py-5">رقم الهاتف</th><th className="px-8 py-5 text-center">إجمالي الإنفاق</th><th className="px-8 py-5 text-center">عدد الزيارات</th><th className="px-8 py-5 text-left">التفاصيل</th></tr></thead><tbody className="divide-y divide-slate-50 font-bold">{customerList.map(c => (
                     <tr key={c.phone} className="hover:bg-indigo-50/10 transition-colors group"><td className="px-8 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><Users size={14}/></div><span className="text-slate-800 font-black text-xs">{c.name}</span></div></td><td className="px-8 py-4 font-mono text-slate-400 select-all">{c.phone}</td><td className="px-8 py-4 text-center font-black text-slate-900">{c.totalSpending.toLocaleString()} ج.م</td><td className="px-8 py-4 text-center"><span className="px-3 py-1 bg-slate-50 rounded-lg text-slate-600">{c.invoiceCount}</span></td><td className="px-8 py-4 text-left"><button onClick={() => setSelectedCustomerPhone(c.phone)} className="p-2 bg-white text-slate-400 border border-slate-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={16} /></button></td></tr>
                  ))}</tbody></table></div></div>
    </div>
  );
};

export default Customers;
