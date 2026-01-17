import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, User, 
  Receipt, Save, X, ShoppingBag, Phone, UserPlus, MessageSquare, Eye, Clock, Calendar, Hash, Tag, Activity, Copy, Check, DownloadCloud, Camera, Barcode, Calculator, Star
} from 'lucide-react';
import { Product, Invoice, SaleItem, User as UserType, ViewType } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Html5QrcodeScanner } from 'html5-qrcode';

// مكون الماسح الضوئي للباركود عبر الكاميرا
const BarcodeScannerModal: React.FC<{ onScan: (decodedText: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  useEffect(() => {
    // إعداد الماسح الضوئي
    const scanner = new Html5QrcodeScanner(
      "meeza-barcode-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear().then(() => {
          onClose();
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          onClose();
        });
      },
      (error) => {
        // تجاهل أخطاء المسح المستمر (تحدث عند عدم وجود كود في الإطار)
      }
    );

    // تنظيف الماسح عند إغلاق النافذة
    return () => {
      scanner.clear().catch(err => console.error("Cleanup error", err));
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="font-black text-sm flex items-center gap-3"><Camera size={20} /> مسح باركود الصنف</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
        </div>
        <div className="p-6 bg-slate-50">
          <div id="meeza-barcode-reader" className="overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-black"></div>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">ضع الباركود داخل الإطار للمسح التلقائي</p>
        </div>
        <div className="p-6 bg-white border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs">إلغاء</button>
        </div>
      </div>
    </div>
  );
};

// قالب الفاتورة المخصص للطباعة و PDF
const InvoiceTemplate: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = Number(invoice.totalBeforeDiscount) || 0;
  const discountAmt = invoice.discountType === 'percentage' ? (subtotal * invoice.discountValue / 100) : invoice.discountValue;
  
  // حساب النسبة المئوية للخصم لعرضها في الفاتورة
  const discountPerc = invoice.discountType === 'percentage' 
    ? invoice.discountValue 
    : (subtotal > 0 ? Math.round((invoice.discountValue / subtotal) * 100) : 0);
  
  return (
    <div className="bg-white text-slate-800 w-full max-w-[210mm] mx-auto p-12 shadow-sm border border-slate-100 rounded-[1.5rem]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex justify-between items-start mb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-indigo-600 mb-1">ميزة</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mr-1">سجل مبيعات موثق</p>
        </div>
        <div className="text-left bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">حالة السند</p>
          <p className="text-sm font-black text-indigo-700">فاتورة مبيعات</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 py-8 border-y border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Hash size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p>
              <p className="text-sm font-black text-slate-700">#{invoice.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Calendar size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">التاريخ والوقت</p>
              <p className="text-sm font-black text-slate-700">{invoice.date} | {invoice.time}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">العميل</p>
              <p className="text-sm font-black text-slate-700">
                {invoice.customerName || 'عميل نقدي'}
                {invoice.customerPhone && <span className="mr-2 text-slate-400 font-bold opacity-60"> - {invoice.customerPhone}</span>}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><User size={14}/></div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">البائع</p>
              <p className="text-sm font-black text-slate-700">{invoice.creatorUsername || '---'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Star size={14}/></div>
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

      <div className="flex justify-between items-start">
        <div className="max-w-xs">
          {invoice.notes && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">ملاحظات</p>
              <p className="text-[11px] font-bold text-slate-600 italic">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="w-60 bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-100 space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
            <span>الإجمالي:</span>
            <span>{subtotal.toLocaleString()} ج.م</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between items-center text-[10px] font-black text-rose-500 pb-4 border-b border-indigo-100">
              <span>الخصم ({discountPerc}%):</span>
              <span>- {discountAmt.toLocaleString()} ج.م</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] font-black text-slate-900">الصافي</span>
            <div className="text-xl font-black text-indigo-600">
              {invoice.netTotal.toLocaleString()} <span className="text-[10px] font-bold text-indigo-400">ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SalesProps {
  products: Product[];
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => void;
  onDeductStock: (productId: string, qty: number) => void;
  onGoToView: (view: ViewType) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  user: UserType;
}

const Sales: React.FC<SalesProps> = ({ products, invoices, onSaveInvoice, onDeductStock, onGoToView, onShowToast, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const isAdminOrSuper = user.role === 'admin' || user.role === 'supervisor';

  const isReturningCustomer = useMemo(() => {
    if (!customerPhone || customerPhone.length < 5) return false;
    return invoices.some(inv => inv.customerPhone === customerPhone);
  }, [invoices, customerPhone]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products.filter(p => 
      !p.isDeleted && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.includes(searchTerm)
      )
    ).slice(0, 8);
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        onShowToast('عفواً، الكمية المطلوبة غير متوفرة في المخزن', 'error');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice } 
          : item
      ));
    } else {
      if (product.stock <= 0) {
        onShowToast('هذا المنتج نفذ من المخزن', 'error');
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.retailPrice,
        wholesalePriceAtSale: product.wholesalePrice,
        subtotal: product.retailPrice
      }]);
    }
    setSearchTerm('');
  };

  const handleBarcodeScan = (decodedText: string) => {
    const product = products.find(p => !p.isDeleted && (p.code === decodedText || p.id === decodedText));
    if (product) {
      addToCart(product);
      onShowToast(`تمت إضافة: ${product.name}`, 'success');
    } else {
      onShowToast('لم يتم العثور على منتج بهذا الباركود', 'error');
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && product && newQty > product.stock) {
          onShowToast('عفواً، تجاوزت الرصيد المتاح', 'error');
          return item;
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const totalBeforeDiscount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmountValue = discountType === 'percentage' 
    ? (totalBeforeDiscount * discountValue / 100) 
    : discountValue;
  const netTotal = Math.max(0, totalBeforeDiscount - discountAmountValue);

  // إجمالي صافي مبيعات اليوم (للفواتير المعروضة في السجل)
  const totalNetSalesToday = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + inv.netTotal, 0);
  }, [invoices]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      onShowToast('السلة فارغة حالياً', 'error');
      return;
    }

    const now = new Date();
    const invoice: Invoice = {
      id: `INV-${now.getTime().toString().slice(-6)}`,
      items: cart,
      totalBeforeDiscount,
      discountValue,
      discountType,
      netTotal,
      date: now.toLocaleDateString('ar-EG'),
      time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: notes || undefined,
      status: 'completed',
      createdBy: user.id,
      creatorUsername: user.username,
      branchId: user.branchId,
      isDeleted: false
    };

    onSaveInvoice(invoice);
    cart.forEach(item => onDeductStock(item.productId, item.quantity));
    onShowToast('تم حفظ الفاتورة بنجاح', 'success');

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setDiscountValue(0);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPDF = async (inv: Invoice) => {
    onShowToast?.("جاري تجهيز الفاتورة...", "success");
    const container = document.createElement('div');
    container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.top = '-9999px';
    container.style.width = '210mm';
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
      pdf.save(`Meeza_Sale_${inv.id}.pdf`);
      onShowToast?.("تم حفظ الفاتورة بنجاح", "success");
    } catch (err) {
      onShowToast?.("خطأ في استخراج PDF", "error");
    } finally {
      root.unmount(); document.body.removeChild(container);
    }
  };

  const sendWhatsApp = (inv: Invoice) => {
    const itemsList = inv.items.map((item, index) => 
      `${index + 1}. ${item.name}  [x${item.quantity}] - ${item.subtotal.toLocaleString()} ج.م`
    ).join('\n');

    const discountAmt = inv.discountType === 'percentage' 
      ? (inv.totalBeforeDiscount * inv.discountValue / 100) 
      : inv.discountValue;

    const discountPerc = inv.discountType === 'percentage'
      ? inv.discountValue
      : (inv.totalBeforeDiscount > 0 ? Math.round((inv.discountValue / inv.totalBeforeDiscount) * 100) : 0);

    const messageText = `🧾 *فاتورة مبيعات رقمية - ميزة POS* ✨

👤 *العميل:* ${inv.customerName || 'عميل نقدي'} ${inv.customerPhone ? `(${inv.customerPhone})` : ''}
🆔 *رقم السند:* #${inv.id}
📅 *التاريخ:* ${inv.date}

🛍️ *قائمة المشتريات:* 
${itemsList}

💵 *الإجمالي:* ${inv.totalBeforeDiscount.toLocaleString()} ج.م
🎁 *الخصم:* ${discountAmt.toLocaleString()} ج.م (${discountPerc}%)

💰 *الصافي النهائي:* *${inv.netTotal.toLocaleString()} ج.م*

✨ *شكراً لتعاملكم معنا!*`;

    const cleanPhone = inv.customerPhone?.replace(/\D/g, '');
    const finalPhone = cleanPhone?.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    
    window.open(`https://wa.me/${finalPhone || ''}?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      
      {/* 1. بيانات العميل في الأعلى */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <UserPlus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-sm">بيانات العميل</h3>
                {isReturningCustomer && (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[8px] font-black animate-pulse">
                    <Star size={10} fill="currentColor" /> عميل مميز
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold">اختياري</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="اسم العميل..." className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-indigo-500/10" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="رقم الهاتف..." className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs focus:ring-2 focus:ring-indigo-500/10" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. خانة البحث مدمج بها زر الباركود */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن منتج بالاسم أو الكود..." 
              className="w-full pr-14 pl-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-sm focus:ring-2 focus:ring-indigo-500/10 shadow-inner" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              autoFocus 
            />
            {/* أيقونة الباركود لفتح الكاميرا مباشرة */}
            <button 
              onClick={() => setShowScanner(true)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100 hover:bg-indigo-50 transition-all flex items-center justify-center active:scale-90"
              title="مسح باركود بالكاميرا"
            >
              <Camera size={20} />
            </button>

            {filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden z-50 animate-in">
                {filteredProducts.map(product => (
                  <button key={product.id} onClick={() => addToCart(product)} className="w-full p-4 flex items-center justify-between hover:bg-indigo-50 transition-all text-right border-b border-slate-50 last:border-0 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 text-indigo-600 rounded-xl flex flex-col items-center justify-center font-black shadow-sm group-hover:border-indigo-200">
                        <span className="text-[10px] opacity-50 uppercase leading-none mb-1">رصيد</span>
                        <span className="text-sm leading-none">{product.stock}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">كود: #{product.code}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-800">{product.retailPrice} ج.م</p>
                      <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black">متوفر</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. السلة وملخص الفاتورة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between shrink-0">
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-3"><Receipt size={18} className="text-indigo-600" /> أصناف الفاتورة</h3>
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full">{cart.length} صنف</span>
          </div>
          <div className="flex-1 overflow-x-auto relative">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black text-[9px] border-b uppercase">
                <tr><th className="px-5 py-4">الصنف</th><th className="px-5 py-4 text-center">السعر</th><th className="px-5 py-4 text-center">الكمية</th><th className="px-5 py-4 text-left">الإجمالي</th><th className="px-5 py-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-40">
                      <div className="flex flex-col items-center justify-center gap-4 opacity-20 w-full mx-auto text-slate-300">
                        <ShoppingBag size={80} strokeWidth={1} />
                        <p className="font-black text-sm uppercase">السلة فارغة</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map(item => (
                    <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors group align-middle">
                      <td className="px-5 py-3.5"><p className="text-slate-800 font-black text-[13px] leading-tight mb-0.5">{item.name}</p><p className="text-[9px] text-slate-400 font-bold">#{products.find(p => p.id === item.productId)?.code}</p></td>
                      <td className="px-5 py-3.5 text-center">
                        <input type="number" value={item.unitPrice} readOnly={user.role !== 'admin'} disabled={user.role !== 'admin'} onChange={(e) => setCart(prev => prev.map(i => i.productId === item.productId ? {...i, unitPrice: Number(e.target.value), subtotal: i.quantity * Number(e.target.value)} : i))} className={`w-20 px-2 py-1.5 bg-white border rounded-xl text-center font-black text-[11px] outline-none transition-all ${user.role !== 'admin' ? 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-500' : (item.unitPrice < item.wholesalePriceAtSale ? 'border-rose-500 text-rose-600 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10')}`} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center active:scale-90 border border-rose-100"><Minus size={12}/></button>
                          <span className="text-[13px] font-black w-7 text-center text-slate-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center active:scale-90 border border-indigo-100"><Plus size={12}/></button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-left font-black text-indigo-600 text-[13px] whitespace-nowrap">{item.subtotal.toLocaleString()} ج.م</td>
                      <td className="px-5 py-3.5 text-left"><button onClick={() => removeFromCart(item.productId)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase"><span>قبل الخصم:</span><span className="text-slate-600">{totalBeforeDiscount.toLocaleString()} ج.م</span></div>
              
              {/* قسم الخصم */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400">قيمة الخصم</label>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => setDiscountType('percentage')} className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${discountType === 'percentage' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>%</button>
                    <button onClick={() => setDiscountType('fixed')} className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${discountType === 'fixed' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>ثابت</button>
                  </div>
                </div>
                <input type="number" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl font-black text-sm outline-none" placeholder="0" value={discountValue || ''} onChange={(e) => setDiscountValue(Number(e.target.value))} />
              </div>

              {/* تعديل لون خانة الملاحظات */}
              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-2"><Tag size={12}/> ملاحظات الفاتورة</p>
                <textarea className="w-full bg-white border border-indigo-100 rounded-xl p-3 text-[10px] font-bold outline-none h-20 placeholder:text-slate-300 text-slate-700 focus:ring-4 focus:ring-indigo-500/5" placeholder="أدخل أي ملاحظات إضافية هنا..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الصافي النهائي</p>
                  <h2 className="text-5xl font-black text-slate-800">{netTotal.toLocaleString()} <span className="text-sm font-bold text-slate-400">ج.م</span></h2>
                </div>
                <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-4"><Save size={24} /> حفظ واعتماد الفاتورة</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. سجل المبيعات اليومي المكتمل */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Activity className="text-indigo-600" size={20} />
            <h3 className="font-black text-sm text-slate-800">سجل عمليات اليوم (تاريخي)</h3>
          </div>
          
          {/* عرض إجمالي صافي مبيعات اليوم */}
          <div className="bg-white px-6 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calculator size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">إجمالي صافي مبيعات اليوم</p>
              <p className="text-sm font-black text-emerald-600">{totalNetSalesToday.toLocaleString()} ج.م</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[11px] min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b">
              <tr>
                <th className="px-6 py-5">رقم السند</th>
                <th className="px-6 py-5">العميل</th>
                {isAdminOrSuper && <th className="px-6 py-5">البائع</th>}
                <th className="px-6 py-5">التوقيت</th>
                <th className="px-6 py-5 text-center">قبل الخصم</th>
                <th className="px-6 py-5 text-center">الخصم المطبق</th>
                <th className="px-6 py-5 text-center">الصافي النهائي</th>
                <th className="px-6 py-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {invoices.length === 0 ? (
                <tr><td colSpan={isAdminOrSuper ? 8 : 7} className="p-16 text-center text-slate-300 font-bold italic">لا توجد عمليات مسجلة لهذا اليوم حتى الآن</td></tr>
              ) : (
                invoices.slice(0, 15).map(inv => {
                  const discountAmt = inv.totalBeforeDiscount - inv.netTotal;
                  const discountPerc = inv.totalBeforeDiscount > 0 ? Math.round((discountAmt / inv.totalBeforeDiscount) * 100) : 0;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleCopy(inv.id)} 
                          className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-2 py-1 rounded transition-all group"
                          title="ضغط للنسخ"
                        >
                          #{inv.id}
                          {copiedId === inv.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="opacity-0 group-hover:opacity-30" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-800">
                        {inv.customerName || 'نقدي (عام)'}
                        {inv.customerPhone && <span className="mr-2 text-[9px] text-slate-400">({inv.customerPhone})</span>}
                      </td>
                      {isAdminOrSuper && (
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black border border-indigo-100">
                            {inv.creatorUsername || '---'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-400 flex items-center gap-2"><Clock size={12}/> {inv.time}</td>
                      <td className="px-6 py-4 text-center text-slate-400">{inv.totalBeforeDiscount.toLocaleString()} ج.م</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-rose-500">{discountAmt.toLocaleString()} ج.م</span>
                        <span className="text-[10px] text-slate-400 mr-1 opacity-70">({discountPerc}%)</span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-900">{inv.netTotal.toLocaleString()} ج.م</td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setPreviewInvoice(inv)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="معاينة الفاتورة"><Eye size={16} /></button>
                          <button onClick={() => handleDownloadPDF(inv)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-700 hover:text-white transition-all shadow-sm" title="تحميل PDF"><DownloadCloud size={16} /></button>
                          <button onClick={() => sendWhatsApp(inv)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="إرسال عبر واتساب"><MessageSquare size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة معاينة الفاتورة */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 md:p-8 animate-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4"><div className="p-2.5 bg-white/20 rounded-xl border border-white/30"><Eye size={20}/></div><div><h3 className="font-black text-base">معاينة سجل مبيعات ميزة</h3><p className="text-[10px] font-bold opacity-70 mt-0.5">سجل رقم {previewInvoice.id}</p></div></div>
                <button onClick={() => setPreviewInvoice(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 scrollbar-hide"><div className="max-w-[210mm] mx-auto origin-top"><InvoiceTemplate invoice={previewInvoice} /></div></div>
             <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0 gap-3">
                <button onClick={() => handleDownloadPDF(previewInvoice)} className="px-10 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[10px] flex items-center gap-2 shadow-lg"><DownloadCloud size={16}/> تحميل PDF</button>
                <button onClick={() => setPreviewInvoice(null)} className="px-10 py-3 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px]">إغلاق</button>
             </div>
          </div>
        </div>
      )}

      {/* نافذة ماسح الباركود بالكاميرا */}
      {showScanner && (
        <BarcodeScannerModal 
          onScan={handleBarcodeScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default Sales;