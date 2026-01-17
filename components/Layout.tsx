import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  RotateCcw, 
  Wallet, 
  BarChart3, 
  Archive,
  ChevronLeft,
  Bell,
  RefreshCcw,
  Download,
  Upload,
  X,
  AlertCircle,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Trash2,
  Users,
  Menu,
  Check,
  Terminal,
  Truck,
  LogOut,
  Building2,
  UserCog,
  Copy
} from 'lucide-react';
import { ViewType, Product, User as UserType } from '../types';

interface LayoutProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  products: Product[];
  onReset: () => void;
  onRestore: (data: any) => void;
  onProductClick?: (product: Product) => void;
  children: React.ReactNode;
  toast: { message: string; type: 'success' | 'error' } | null;
  onCloseToast: () => void;
  user: UserType;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, products, onReset, onRestore, onProductClick, children, toast, onCloseToast, user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{type: 'reset' | 'restore', data?: any} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const lowStockItems = products.filter(p => p.stock < 5 && !p.isDeleted);

  const fullNavItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart, roles: ['admin', 'supervisor', 'employee'] },
    { id: 'purchases', label: 'التوريدات', icon: Truck, roles: ['admin', 'supervisor'] }, 
    { id: 'inventory', label: 'المخزن', icon: Package, roles: ['admin', 'supervisor'] },
    { id: 'customers', label: 'سجل العملاء', icon: Users, roles: ['admin', 'supervisor'] },
    { id: 'expenses', label: 'المصاريف', icon: Wallet, roles: ['admin', 'supervisor'] },
    { id: 'returns', label: 'المرتجعات', icon: RotateCcw, roles: ['admin', 'supervisor'] },
    { id: 'archive', label: 'الأرشيف', icon: Archive, roles: ['admin', 'supervisor'] },
    { id: 'staff', label: 'الموظفين', icon: UserCog, roles: ['admin', 'supervisor'] },
    { id: 'branches', label: 'الفروع', icon: Building2, roles: ['admin', 'supervisor'] },
    { id: 'recycleBin', label: 'سلة المحذوفات', icon: Trash2, roles: ['admin', 'supervisor'] },
    { id: 'reports', label: 'التقارير', icon: BarChart3, roles: ['admin', 'supervisor'] },
  ] as const;

  const navItems = fullNavItems.filter(item => item.roles.includes(user.role));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.addEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFullSystemBackup = () => {
    try {
      const backupData = {
        version: "4.5",
        system: "Meeza POS System",
        backupDate: new Date().toISOString(),
        data: {
          invoices: JSON.parse(localStorage.getItem('meeza_pos_invoices') || '[]'),
          returns: JSON.parse(localStorage.getItem('meeza_pos_returns') || '[]'),
          expenses: JSON.parse(localStorage.getItem('meeza_pos_expenses') || '[]'),
          products: JSON.parse(localStorage.getItem('meeza_pos_inventory') || '[]'),
          purchases: JSON.parse(localStorage.getItem('meeza_pos_purchases') || '[]'),
          suppliers: JSON.parse(localStorage.getItem('meeza_pos_suppliers') || '[]'),
          supplierPayments: JSON.parse(localStorage.getItem('meeza_pos_supplier_payments') || '[]'),
          users: JSON.parse(localStorage.getItem('meeza_pos_users') || '[]'),
          branches: JSON.parse(localStorage.getItem('meeza_pos_branches') || '[]')
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `نسخة_نظام_ميزة_الشاملة_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("خطأ في تصدير البيانات:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = JSON.parse(event.target?.result as string);
        const dataToRestore = result.data || result;
        setConfirmDialog({ type: 'restore', data: dataToRestore });
      } catch (err) {
        console.error("خطأ في قراءة ملف النسخة الاحتياطية:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Cairo']" dir="rtl">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border animate-in transition-all ${
          toast.type === 'success' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
        }`}>
          {toast.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
          <span className="font-black text-xs">{toast.message}</span>
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden transition-all" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 right-0 w-64 h-screen max-h-screen bg-white border-l border-slate-200 flex flex-col no-print shadow-xl z-[60] transform transition-transform duration-300 overflow-hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
              <span className="font-bold text-xl">M</span>
            </div>
            <div className="truncate">
              <h1 className="font-black text-slate-800 text-lg leading-none">ميزة POS</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">إدارة ذكية</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-hide space-y-1">
          <p className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">القائمة الرئيسية</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setView(item.id); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="font-bold text-[11px]">{item.label}</span>
                </div>
                {isActive && <ChevronLeft size={14} />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-100 shrink-0 space-y-3">
           {user.role === 'admin' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleFullSystemBackup} title="نسخ شامل" className="flex items-center justify-center gap-1.5 p-2 bg-white text-indigo-600 rounded-lg border border-slate-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <Download size={13} />
                  <span className="text-[8px] font-black">نسخ شامل</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} title="استعادة" className="flex items-center justify-center gap-1.5 p-2 bg-white text-emerald-600 rounded-lg border border-slate-200 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <Upload size={13} />
                  <span className="text-[8px] font-black">استعادة</span>
                </button>
              </div>
              <button onClick={() => setConfirmDialog({type: 'reset'})} className="flex items-center justify-center gap-2 w-full py-1.5 text-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-lg transition-all font-black text-[8px] border border-rose-100">
                <RefreshCcw size={13} />
                <span>تصفير النظام</span>
              </button>
            </>
          )}
          
          <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-2.5 text-slate-600 bg-white hover:bg-slate-100 rounded-xl transition-all font-black text-[10px] border border-slate-200 shadow-sm">
            <LogOut size={14} className="text-rose-500" />
            <span>تسجيل الخروج</span>
          </button>

          <div className="mt-3 p-2.5 bg-slate-900 rounded-xl text-white overflow-hidden relative border border-slate-800">
            <div className="relative z-10 text-right">
              <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                المستخدم الحالي <ShieldCheck size={8} />
              </p>
              <p className="text-[10px] font-black mb-1">{user.username}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase">
                {user.role === 'admin' ? 'صلاحية مدير' : user.role === 'supervisor' ? 'صلاحية مشرف' : 'صلاحية موظف'}
              </p>
            </div>
            <div className="absolute -bottom-1 -left-1 text-white/5 rotate-12">
              <Terminal size={30} />
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 min-h-[80px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <Menu size={20} />
            </button>
            <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tighter">
              {fullNavItems.find(i => i.id === currentView)?.label || 'الرئيسية'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 relative" ref={notificationRef}>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
              <Clock size={16} className="text-indigo-600" />
              <p className="text-xs font-black text-slate-700">
                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {/* إخفاء جرس الإشعارات من صلاحيات الموظف */}
            {user.role !== 'employee' && (
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${showNotifications ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}
              >
                <Bell size={18} />
                {lowStockItems.length > 0 && <span className="absolute -top-1 -left-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{lowStockItems.length}</span>}
              </button>
            )}

            {showNotifications && user.role !== 'employee' && (
              <div className="absolute top-full left-0 mt-3 w-72 sm:w-80 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in z-[60] flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-2"><Bell size={14} className="text-indigo-600" /> تنبيهات ميزة</h3>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black rounded-full">{lowStockItems.length} إشعار</span>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                  {lowStockItems.length > 0 ? (
                    <div className="p-2 space-y-1">
                      <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">تنبيهات نقص المخزون</p>
                      {lowStockItems.map((item) => (
                        <div key={item.id} className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-all group relative">
                          <div className="flex-1 flex items-start gap-3 cursor-pointer" onClick={() => { onProductClick?.(item); setShowNotifications(false); }}>
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                              <AlertTriangle size={14} />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-[11px] font-black text-slate-800">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[9px] font-bold text-rose-500">رصيد: {item.stock} قطعة</p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.code);
                                    setCopiedCode(item.code);
                                    setTimeout(() => setCopiedCode(null), 2000);
                                  }}
                                  className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 transition-all ${copiedCode === item.code ? 'bg-emerald-50 text-white' : 'bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white'}`}
                                >
                                  {copiedCode === item.code ? <Check size={8} /> : <Copy size={8} />}
                                  #{item.code}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <Check size={24} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400">لا توجد تنبيهات عاجلة حالياً</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          {children}
        </div>
      </main>

      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in">
            <div className={`p-8 text-center ${confirmDialog.type === 'reset' ? 'bg-rose-50' : 'bg-indigo-50'}`}>
              <AlertTriangle className={`mx-auto mb-4 ${confirmDialog.type === 'reset' ? 'text-rose-600' : 'text-indigo-600'}`} size={48} />
              <h3 className="text-xl font-black mb-2">{confirmDialog.type === 'reset' ? 'تصفير بيانات النظام؟' : 'تأكيد استعادة البيانات؟'}</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">
                {confirmDialog.type === 'reset' 
                  ? 'سيتم مسح كافة المبيعات، المخزن، والمصاريف نهائياً. لا يمكن التراجع عن هذا الإجراء.' 
                  : 'سيتم استبدال البيانات الحالية ببيانات النسخة الاحتياطية المختارة.'}
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-4">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black rounded-xl text-xs">إلغاء</button>
              <button 
                onClick={() => {
                  if (confirmDialog.type === 'reset') onReset();
                  else onRestore(confirmDialog.data);
                  setConfirmDialog(null);
                }} 
                className={`flex-[1.5] py-3 text-white font-black rounded-xl shadow-lg text-xs ${confirmDialog.type === 'reset' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                تأكيد العملية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;