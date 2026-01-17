
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  LayoutDashboard,
  Gem,
  Wallet,
  BarChart3,
  ShoppingCart,
  AlertCircle,
  Activity,
  History,
  RotateCcw,
  Receipt,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Award,
  ZapOff
} from 'lucide-react';
import { Invoice, ReturnRecord, Expense, Product, PurchaseRecord, SupplierPayment, Supplier, User as UserType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  invoices: Invoice[];
  returns: ReturnRecord[];
  expenses: Expense[];
  products: Product[];
  purchases: PurchaseRecord[];
  payments: SupplierPayment[];
  suppliers: Supplier[];
  onProductClick?: (product: Product) => void;
  user: UserType;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, returns, expenses, products, purchases, payments, suppliers, onProductClick, user }) => {
  const isAdmin = user.role === 'admin';
  const nonDeletedInvoices = useMemo(() => invoices.filter(i => !i.isDeleted), [invoices]);
  const nonDeletedReturns = useMemo(() => returns.filter(r => !r.isDeleted), [returns]);
  const nonDeletedPayments = useMemo(() => payments || [], [payments]);
  const nonDeletedPurchases = useMemo(() => purchases || [], [purchases]);
  
  const todayStr = new Date().toLocaleDateString('ar-EG');

  const todayStats = useMemo(() => {
    const todayInvs = nonDeletedInvoices.filter(i => i.date === todayStr);
    const todayRets = nonDeletedReturns.filter(r => r.date === todayStr);
    const todayExps = expenses.filter(e => e.date === todayStr);
    const todayPays = nonDeletedPayments.filter(p => p.date === todayStr);
    const todayPurchs = nonDeletedPurchases.filter(p => p.date === todayStr && !p.isDeleted);

    const revenue = todayInvs.reduce((acc, inv) => acc + inv.netTotal, 0);
    const refunds = todayRets.reduce((acc, ret) => acc + ret.totalRefund, 0);
    const salesCOGS = todayInvs.reduce((acc, inv) => 
      acc + inv.items.reduce((sum, item) => sum + (item.quantity * (item.wholesalePriceAtSale || 0)), 0), 0);
    const returnsCOGS = todayRets.reduce((acc, ret) => 
      acc + ret.items.reduce((sum, item) => sum + (item.quantity * (item.wholesalePriceAtSale || 0)), 0), 0);
    const expensesTotal = todayExps.reduce((acc, exp) => acc + exp.amount, 0);
    
    const netProfit = (revenue - refunds) - (salesCOGS - returnsCOGS) - expensesTotal;
    const supplierPaymentsTotal = todayPays.reduce((acc, p) => acc + p.amount, 0);
    const netCash = (revenue - refunds) - expensesTotal - supplierPaymentsTotal;
    const suppliesTotal = todayPurchs.reduce((acc, p) => acc + p.totalAmount, 0);

    return { 
      netProfit, 
      netCash, 
      revenue, 
      expensesTotal, 
      invCount: todayInvs.length,
      retCount: todayRets.length,
      retValue: refunds,
      suppliesTotal,
      supplierPaymentsTotal
    };
  }, [nonDeletedInvoices, nonDeletedReturns, expenses, nonDeletedPayments, nonDeletedPurchases, todayStr]);

  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toLocaleDateString('ar-EG');
      
      const dayInvs = nonDeletedInvoices.filter(inv => inv.date === dStr);
      const dayRets = nonDeletedReturns.filter(ret => ret.date === dStr);
      const dayExps = expenses.filter(exp => exp.date === dStr);
      const dayPays = nonDeletedPayments.filter(p => p.date === dStr);

      const rev = dayInvs.reduce((a, b) => a + b.netTotal, 0) - dayRets.reduce((a, b) => a + b.totalRefund, 0);
      const sCOGS = dayInvs.reduce((a, b) => a + b.items.reduce((s, it) => s + (it.quantity * (it.wholesalePriceAtSale || 0)), 0), 0);
      const rCOGS = dayRets.reduce((a, b) => a + b.items.reduce((s, it) => s + (it.quantity * (it.wholesalePriceAtSale || 0)), 0), 0);
      const exp = dayExps.reduce((a, b) => a + b.amount, 0);
      const pay = dayPays.reduce((a, b) => a + b.amount, 0);

      const profit = rev - (sCOGS - rCOGS) - exp;
      const cash = rev - exp - pay;

      data.push({
        name: i === 0 ? 'اليوم' : d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        profit: Number(profit.toFixed(2)),
        cash: Number(cash.toFixed(2))
      });
    }
    return data;
  }, [nonDeletedInvoices, nonDeletedReturns, expenses, nonDeletedPayments]);

  const productSalesStats = useMemo(() => {
    const stats: Record<string, number> = {};
    nonDeletedInvoices.forEach(inv => {
      inv.items.forEach(item => {
        stats[item.productId] = (stats[item.productId] || 0) + item.quantity;
      });
    });

    const salesArray = products
      .filter(p => !p.isDeleted)
      .map(p => ({
        ...p,
        salesQty: stats[p.id] || 0
      }));

    const topSellers = [...salesArray].sort((a, b) => b.salesQty - a.salesQty).slice(0, 5);
    const bottomSellers = [...salesArray].sort((a, b) => a.salesQty - b.salesQty).slice(0, 5);

    return { topSellers, bottomSellers };
  }, [nonDeletedInvoices, products]);

  const inventoryValue = products.filter(p => !p.isDeleted).reduce((acc, p) => acc + (p.stock * p.wholesalePrice), 0);

  return (
    <div className="space-y-8 animate-in font-['Cairo'] select-text pb-10" dir="rtl">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">لوحة المتابعة الشاملة</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">مركز العمليات الموحد - ميزة POS</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-3">
              <History size={16} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-600">آخر مزامنة: {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700">النظام متصل</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Gem size={22} /></div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 uppercase">الربحية</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1 relative z-10">صافي أرباح اليوم</p>
            <h3 className="text-2xl font-black text-slate-800 relative z-10">{todayStats.netProfit.toLocaleString()} <span className="text-sm">ج.م</span></h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg"><Wallet size={22} /></div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-100 uppercase">السيولة</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1 relative z-10">صافي السيولة النقدية</p>
          <h3 className="text-2xl font-black text-slate-800 relative z-10">{todayStats.netCash.toLocaleString()} <span className="text-sm">ج.م</span></h3>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        </div>

        {isAdmin && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg"><Package size={22} /></div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black border border-amber-100 uppercase">الأصول</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1 relative z-10">قيمة البضاعة (WAC)</p>
            <h3 className="text-2xl font-black text-slate-800 relative z-10">{inventoryValue.toLocaleString()} <span className="text-sm">ج.م</span></h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg"><ShoppingCart size={22} /></div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black border border-slate-200 uppercase">المبيعات</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1 relative z-10">فواتير اليوم</p>
          <h3 className="text-2xl font-black text-slate-800 relative z-10">{todayStats.invCount} <span className="text-sm">فاتورة</span></h3>
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shadow-sm"><RotateCcw size={18}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">مرتجعات اليوم</p>
              <p className="text-sm font-black text-slate-800">{todayStats.retCount} مرتجع <span className="text-[10px] text-rose-500 mr-1">({todayStats.retValue.toLocaleString()} ج.م)</span></p>
            </div>
          </div>
        )}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm"><Receipt size={18}/></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">مصاريف اليوم</p>
            <p className="text-sm font-black text-slate-800">{todayStats.expensesTotal.toLocaleString()} ج.م</p>
          </div>
        </div>
        {isAdmin && (
          <>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm"><Truck size={18}/></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">توريدات اليوم</p>
                <p className="text-sm font-black text-slate-800">{todayStats.suppliesTotal.toLocaleString()} ج.م</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm"><CreditCard size={18}/></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">مدفوعات الموردين</p>
                <p className="text-sm font-black text-slate-800">{todayStats.supplierPaymentsTotal.toLocaleString()} ج.م</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-lg font-black text-slate-800">أداء السيولة والربحية</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">مقارنة التدفقات النقدية بالأرباح الصافية (7 أيام)</p>
              </div>
              <BarChart3 className="text-slate-200" size={32} />
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', textAlign: 'right', fontFamily: 'Cairo'}} />
                  {isAdmin && <Area type="monotone" dataKey="profit" name="الأرباح" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />}
                  <Area type="monotone" dataKey="cash" name="السيولة" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* الأصناف الأعلى مبيعاً */}
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Award size={18}/></div>
                 <h4 className="font-black text-sm text-slate-800">الأصناف الأعلى مبيعاً</h4>
              </div>
              <div className="space-y-4">
                 {productSalesStats.topSellers.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-indigo-50 transition-all cursor-pointer" onClick={() => onProductClick?.(item)}>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">#{idx + 1}</div>
                          <div className="min-w-0">
                             <p className="text-[11px] font-black text-slate-700 truncate">{item.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold">كود: {item.code}</p>
                          </div>
                       </div>
                       <div className="text-left shrink-0">
                          <div className="flex items-center gap-1 text-emerald-600">
                             <ChevronUp size={12} strokeWidth={3} />
                             <span className="text-[11px] font-black">{item.salesQty}</span>
                          </div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">وحدة</p>
                       </div>
                    </div>
                 ))}
                 {productSalesStats.topSellers.length === 0 && <p className="text-center py-6 text-[10px] font-bold text-slate-400 italic">لا توجد بيانات مبيعات كافية</p>}
              </div>
           </div>

           {/* الأصناف الأقل مبيعاً */}
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ZapOff size={18}/></div>
                 <h4 className="font-black text-sm text-slate-800">الأصناف الأقل مبيعاً</h4>
              </div>
              <div className="space-y-4">
                 {productSalesStats.bottomSellers.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-rose-50 transition-all cursor-pointer" onClick={() => onProductClick?.(item)}>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-rose-600 group-hover:border-rose-200 transition-all">
                             <Package size={14} />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[11px] font-black text-slate-700 truncate">{item.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold">مخزون: {item.stock}</p>
                          </div>
                       </div>
                       <div className="text-left shrink-0">
                          <div className="flex items-center gap-1 text-rose-400">
                             <ChevronDown size={12} strokeWidth={3} />
                             <span className="text-[11px] font-black">{item.salesQty}</span>
                          </div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">مبيعات</p>
                       </div>
                    </div>
                 ))}
                 {productSalesStats.bottomSellers.length === 0 && <p className="text-center py-6 text-[10px] font-bold text-slate-400 italic">لا توجد أصناف في المخزن</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
