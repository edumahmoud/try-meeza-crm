
import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  FileSpreadsheet,
  Wallet,
  BarChart as BarChartIcon,
  RotateCcw,
  Receipt,
  ShoppingCart,
  Truck,
  CreditCard,
  Gem,
  DownloadCloud,
  Award,
  ZapOff,
  ChevronUp,
  ChevronDown,
  Package
} from 'lucide-react';
import { Invoice, ReturnRecord, Expense, PurchaseRecord, SupplierPayment, User as UserType } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

declare const XLSX: any;

interface ReportsProps {
  invoices: Invoice[];
  returns: ReturnRecord[];
  expenses: Expense[];
  purchases: PurchaseRecord[];
  supplierPayments: SupplierPayment[];
  user: UserType;
}

const Reports: React.FC<ReportsProps> = ({ invoices, returns, expenses, purchases, supplierPayments, user }) => {
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedSelectedDate = selectedDate.toLocaleDateString('ar-EG');
  
  const dateDisplayLabel = useMemo(() => {
    if (activeTab === 'daily') return formattedSelectedDate;
    if (activeTab === 'monthly') return selectedDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    return selectedDate.toLocaleDateString('ar-EG', { year: 'numeric' });
  }, [activeTab, selectedDate, formattedSelectedDate]);

  const changePeriod = (delta: number) => {
    const newDate = new Date(selectedDate);
    if (activeTab === 'daily') newDate.setDate(selectedDate.getDate() + delta);
    else if (activeTab === 'monthly') newDate.setMonth(selectedDate.getMonth() + delta);
    else newDate.setFullYear(selectedDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  const filteredData = useMemo(() => {
    return {
      invoices: invoices.filter(inv => {
        const d = new Date(inv.timestamp);
        if (activeTab === 'daily') return inv.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      }),
      returns: returns.filter(ret => {
        const d = new Date(ret.timestamp);
        if (activeTab === 'daily') return ret.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      }),
      expenses: expenses.filter(exp => {
        const d = new Date(exp.timestamp);
        if (activeTab === 'daily') return exp.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      }),
      payments: (supplierPayments || []).filter(pay => {
        const d = new Date(pay.timestamp);
        if (activeTab === 'daily') return pay.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      }),
      purchases: (purchases || []).filter(p => {
        const d = new Date(p.timestamp);
        if (activeTab === 'daily') return p.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      })
    };
  }, [invoices, returns, expenses, supplierPayments, purchases, activeTab, formattedSelectedDate, selectedDate]);

  const stats = useMemo(() => {
    const invs = filteredData.invoices; 
    const rets = filteredData.returns; 
    const exps = filteredData.expenses;
    const pays = filteredData.payments;
    const purchs = filteredData.purchases;

    const netRevenue = invs.reduce((a, b) => a + b.netTotal, 0) - rets.reduce((a, b) => a + b.totalRefund, 0);
    const totalExpenses = exps.reduce((a, b) => a + b.amount, 0);
    const totalSupplierPayments = pays.reduce((a, b) => a + b.amount, 0);
    
    const salesCOGS = invs.reduce((acc, inv) => acc + inv.items.reduce((sum, item) => sum + (item.quantity * (item.wholesalePriceAtSale || 0)), 0), 0);
    const returnsCOGS = rets.reduce((acc, ret) => acc + ret.items.reduce((sum, item) => sum + (item.quantity * (item.wholesalePriceAtSale || 0)), 0), 0);
    const netCOGS = salesCOGS - returnsCOGS;
    
    const netProfit = netRevenue - netCOGS - totalExpenses;
    const netCash = netRevenue - totalExpenses - totalSupplierPayments;

    const returnsValue = rets.reduce((a, b) => a + b.totalRefund, 0);
    const suppliesTotal = purchs.filter(p => !p.isDeleted).reduce((a, b) => a + b.totalAmount, 0);

    return { 
      netRevenue, totalExpenses, netProfit, netCash, netCOGS,
      invCount: invs.length,
      retCount: rets.length,
      retValue: returnsValue,
      suppliesTotal,
      supplierPaymentsTotal: totalSupplierPayments
    };
  }, [filteredData]);

  // حساب أداء المنتجات خلال الفترة المختارة
  const productPerformance = useMemo(() => {
    const performanceMap: Record<string, { name: string, qty: number }> = {};

    filteredData.invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!performanceMap[item.productId]) {
          performanceMap[item.productId] = { name: item.name, qty: 0 };
        }
        performanceMap[item.productId].qty += item.quantity;
      });
    });

    filteredData.returns.forEach(ret => {
      ret.items.forEach(item => {
        if (performanceMap[item.productId]) {
          performanceMap[item.productId].qty -= item.quantity;
        }
      });
    });

    const sortedList = Object.entries(performanceMap)
      .map(([id, data]) => ({ id, ...data }))
      .filter(item => item.qty !== 0) // تجاهل الأصناف التي لم تتحرك
      .sort((a, b) => b.qty - a.qty);

    return {
      topSellers: sortedList.slice(0, 5),
      bottomSellers: [...sortedList].reverse().slice(0, 5)
    };
  }, [filteredData]);

  const chartsData = useMemo(() => {
    const trend: any[] = [];
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    if (activeTab === 'daily') {
      for (let i = 0; i < 24; i++) {
        const hInvs = filteredData.invoices.filter(inv => new Date(inv.timestamp).getHours() === i);
        trend.push({ name: `${i}:00`, revenue: hInvs.reduce((a, b) => a + b.netTotal, 0) });
      }
    } else if (activeTab === 'monthly') {
      const days = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= days; i++) {
        const dInvs = filteredData.invoices.filter(inv => new Date(inv.timestamp).getDate() === i);
        trend.push({ name: i.toString(), revenue: dInvs.reduce((a, b) => a + b.netTotal, 0) });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const mInvs = filteredData.invoices.filter(inv => new Date(inv.timestamp).getMonth() === i);
        trend.push({ name: monthNames[i], revenue: mInvs.reduce((a, b) => a + b.netTotal, 0) });
      }
    }
    return trend;
  }, [filteredData, activeTab, selectedDate]);

  const handleExportExcel = () => {
    const data: any[] = [];
    data.push({ "البيان": "إجمالي المبيعات (صافي)", "القيمة": stats.netRevenue });
    if (isAdmin) {
      data.push({ "البيان": "تكلفة البضاعة المباعة", "القيمة": stats.netCOGS });
      data.push({ "البيان": "صافي الربح التشغيلي", "القيمة": stats.netProfit });
      data.push({ "البيان": "عدد المرتجعات", "القيمة": stats.retCount });
      data.push({ "البيان": "قيمة المرتجعات", "القيمة": stats.retValue });
      data.push({ "البيان": "إجمالي التوريدات", "القيمة": stats.suppliesTotal });
    }
    data.push({ "البيان": "إجمالي المصاريف", "القيمة": stats.totalExpenses });
    data.push({ "البيان": "صافي التدفق النقدي", "القيمة": stats.netCash });
    data.push({ "البيان": "عدد الفواتير", "القيمة": stats.invCount });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير ميزة");
    XLSX.writeFile(wb, `Meeza_Report_${dateDisplayLabel.replace(/\s/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 no-print">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl flex-1 overflow-x-auto">
          {['daily', 'monthly', 'yearly'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab as any); setSelectedDate(new Date()); }} className={`flex-1 min-w-[100px] px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}>
              {tab === 'daily' ? 'تقرير يومي' : tab === 'monthly' ? 'تقرير شهري' : 'تقرير سنوي'}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between lg:justify-center gap-6 bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100 flex-1">
           <button onClick={() => changePeriod(-1)} className="p-1 hover:bg-white rounded-lg text-indigo-600 transition-colors"><ChevronRight size={22}/></button>
           <span className="text-[12px] font-black text-slate-700 min-w-[140px] text-center">{dateDisplayLabel}</span>
           <button onClick={() => changePeriod(1)} className="p-1 hover:bg-white rounded-lg text-indigo-600 transition-colors"><ChevronLeft size={22}/></button>
        </div>
        <button onClick={handleExportExcel} className="flex items-center justify-center gap-3 px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg transition-all text-xs shrink-0"><FileSpreadsheet size={18} />تصدير Excel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Gem size={22} /></div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 uppercase">الربحية</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1">صافي الربح التشغيلي</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.netProfit.toLocaleString()} <span className="text-sm">ج.م</span></h3>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg"><Wallet size={22} /></div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-100 uppercase">السيولة</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1">صافي التدفق النقدي</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.netCash.toLocaleString()} <span className="text-sm">ج.م</span></h3>
        </div>

        {isAdmin && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg"><RotateCcw size={22} /></div>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black border border-rose-100 uppercase">المرتجعات</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1">قيمة مرتجعات المبيعات</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.retValue.toLocaleString()} <span className="text-sm">ج.م</span></h3>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg"><ShoppingCart size={22} /></div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black border border-slate-200 uppercase">الحركة</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1">عدد الفواتير المصدرة</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.invCount} <span className="text-sm">عملية</span></h3>
        </div>
      </div>

      {/* قسم تحليل الأصناف الأكثر والأقل مبيعاً */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Award size={20}/></div>
               <div>
                 <h4 className="font-black text-sm text-slate-800">الأصناف الأكثر مبيعاً</h4>
                 <p className="text-[9px] text-slate-400 font-bold uppercase">خلال الفترة المختارة</p>
               </div>
            </div>
            <div className="space-y-4">
               {productPerformance.topSellers.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-indigo-50 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">#{idx + 1}</div>
                        <p className="text-xs font-black text-slate-700">{item.name}</p>
                     </div>
                     <div className="text-left">
                        <div className="flex items-center gap-1 text-emerald-600">
                           <ChevronUp size={14} strokeWidth={3} />
                           <span className="text-sm font-black">{item.qty}</span>
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">وحدة صافية</p>
                     </div>
                  </div>
               ))}
               {productPerformance.topSellers.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-slate-300 italic">لا توجد مبيعات في هذه الفترة</p>}
            </div>
         </div>

         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ZapOff size={20}/></div>
               <div>
                 <h4 className="font-black text-sm text-slate-800">الأصناف الأقل مبيعاً</h4>
                 <p className="text-[9px] text-slate-400 font-bold uppercase">خلال الفترة المختارة</p>
               </div>
            </div>
            <div className="space-y-4">
               {productPerformance.bottomSellers.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-rose-50 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-rose-600 group-hover:border-rose-200 transition-all">
                           <Package size={14} />
                        </div>
                        <p className="text-xs font-black text-slate-700">{item.name}</p>
                     </div>
                     <div className="text-left">
                        <div className="flex items-center gap-1 text-rose-400">
                           <ChevronDown size={14} strokeWidth={3} />
                           <span className="text-sm font-black">{item.qty}</span>
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">وحدة صافية</p>
                     </div>
                  </div>
               ))}
               {productPerformance.bottomSellers.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-slate-300 italic">لا توجد مبيعات في هذه الفترة</p>}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm"><Receipt size={18}/></div>
           <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">إجمالي المصاريف</p><p className="text-sm font-black text-slate-800">{stats.totalExpenses.toLocaleString()} ج.م</p></div>
        </div>
        {isAdmin && (
          <>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm"><Truck size={18}/></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">إجمالي التوريدات</p><p className="text-sm font-black text-slate-800">{stats.suppliesTotal.toLocaleString()} ج.م</p></div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm"><CreditCard size={18}/></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">مدفوعات الموردين</p><p className="text-sm font-black text-slate-800">{stats.supplierPaymentsTotal.toLocaleString()} ج.م</p></div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm"><Gem size={18}/></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">تكلفة المباع (COGS)</p><p className="text-sm font-black text-slate-800">{stats.netCOGS.toLocaleString()} ج.م</p></div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm">
         <div className="flex justify-between items-start mb-12">
            <div><h3 className="text-xl font-black text-slate-800">منحنى أداء المبيعات</h3><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">تحليل الإيرادات المسجلة خلال الفترة المختارة</p></div>
            <BarChartIcon className="text-slate-200" size={40} />
         </div>
         <div className="h-[400px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartsData}>
                <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', textAlign: 'right', fontFamily: 'Cairo'}} />
                <Area type="monotone" dataKey="revenue" name="المبيعات" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Reports;
