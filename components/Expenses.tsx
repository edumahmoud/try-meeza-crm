
import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, ChevronLeft, Wallet, ReceiptText, X, Calendar, DollarSign, Clock, ChevronDown, Activity, BarChart3, Receipt } from 'lucide-react';
import { Expense } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);

  const formattedSelectedDate = selectedDate.toLocaleDateString('ar-EG');
  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  const changePeriod = (delta: number) => {
    const newDate = new Date(selectedDate);
    if (activeTab === 'daily') newDate.setDate(selectedDate.getDate() + delta);
    else if (activeTab === 'monthly') newDate.setMonth(selectedDate.getMonth() + delta);
    else newDate.setFullYear(selectedDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  const aggregatedData = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => b.timestamp - a.timestamp);
    if (activeTab === 'daily') return sorted.filter(exp => exp.date === formattedSelectedDate);
    else if (activeTab === 'monthly') {
      const month = selectedDate.getMonth();
      const year = selectedDate.getFullYear();
      const monthExpenses = sorted.filter(exp => {
        const d = new Date(exp.timestamp);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const dayGroups: Record<string, { total: number, date: string, count: number }> = {};
      monthExpenses.forEach(exp => {
        if (!dayGroups[exp.date]) dayGroups[exp.date] = { total: 0, date: exp.date, count: 0 };
        dayGroups[exp.date].total += exp.amount;
        dayGroups[exp.date].count += 1;
      });
      return Object.values(dayGroups).sort((a,b) => b.date.localeCompare(a.date));
    } else {
      const year = selectedDate.getFullYear();
      const yearExpenses = sorted.filter(exp => new Date(exp.timestamp).getFullYear() === year);
      const monthGroups: Record<string, { total: number, month: number, year: number, count: number }> = {};
      yearExpenses.forEach(exp => {
        const d = new Date(exp.timestamp);
        const m = d.getMonth();
        const key = `${m}-${year}`;
        if (!monthGroups[key]) monthGroups[key] = { total: 0, month: m, year, count: 0 };
        monthGroups[key].total += exp.amount;
        monthGroups[key].count += 1;
      });
      return Object.values(monthGroups).sort((a,b) => b.month - a.month);
    }
  }, [expenses, activeTab, formattedSelectedDate, selectedDate]);

  const chartTrendData = useMemo(() => {
    if (activeTab === 'monthly') {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const data = [];
      for (let i = 1; i <= days; i++) {
        const dStr = new Date(year, month, i).toLocaleDateString('ar-EG');
        const dayExps = expenses.filter(e => e.date === dStr);
        data.push({
          name: i.toString(),
          amount: dayExps.reduce((s, e) => s + e.amount, 0)
        });
      }
      return data;
    } else if (activeTab === 'yearly') {
      const year = selectedDate.getFullYear();
      return monthNamesAr.map((name, i) => {
        const monthExps = expenses.filter(e => {
          const d = new Date(e.timestamp);
          return d.getMonth() === i && d.getFullYear() === year;
        });
        return {
          name: name,
          amount: monthExps.reduce((s, e) => s + e.amount, 0)
        };
      });
    }
    return [];
  }, [expenses, activeTab, selectedDate]);

  const totalPeriodExpenses = useMemo(() => {
    if (activeTab === 'daily') return (aggregatedData as Expense[]).reduce((sum, exp) => sum + exp.amount, 0);
    return (aggregatedData as any[]).reduce((sum, group) => sum + group.total, 0);
  }, [aggregatedData, activeTab]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 md:gap-6 no-print">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl flex-1 w-full overflow-x-auto">
          {['daily', 'monthly', 'yearly'].map(tab => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab as any); setSelectedDate(new Date()); }} 
              className={`flex-1 min-w-[80px] px-2 md:px-8 py-2 md:py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              {tab === 'daily' ? 'يومي' : tab === 'monthly' ? 'شهري' : 'سنوي'}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between lg:justify-center gap-4 bg-slate-50 px-4 md:px-5 py-2 md:py-2.5 rounded-xl border border-slate-100 flex-1">
           <button onClick={() => changePeriod(-1)} className="p-1 hover:bg-white rounded-lg text-indigo-600 transition-colors"><ChevronRight size={20}/></button>
           <span className="text-[11px] md:text-xs font-black text-slate-700 min-w-[100px] md:min-w-[120px] text-center truncate">{activeTab === 'daily' ? formattedSelectedDate : activeTab === 'monthly' ? `${monthNamesAr[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : selectedDate.getFullYear()}</span>
           <button onClick={() => changePeriod(1)} className="p-1 hover:bg-white rounded-lg text-indigo-600 transition-colors"><ChevronLeft size={20}/></button>
        </div>
        <button 
          onClick={() => setIsOpen(true)} 
          className="flex items-center justify-center gap-3 px-6 md:px-8 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-900 shadow-md transition-all text-xs shrink-0 cursor-pointer"
        >
          <Plus size={18} />مصروف جديد
        </button>
      </div>

      {(activeTab === 'monthly' || activeTab === 'yearly') && (
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-5xl mx-auto w-full">
            <div className="text-center mb-10">
              <h3 className="text-lg font-black text-slate-800">منحنى توجه المصروفات</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">تحليل بياني لنفقات {activeTab === 'monthly' ? 'الشهر' : 'السنة'}</p>
            </div>
            <div className="min-h-[300px] w-full">
               <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartTrendData}>
                     <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                     <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Cairo'}} />
                     <Area type="monotone" dataKey="amount" name="المبلغ" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm w-full max-w-sm">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-md shrink-0"><Wallet size={20} /></div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest truncate">إجمالي مصروفات الفترة</p>
                <p className="text-xl font-black text-rose-700 truncate">{totalPeriodExpenses.toLocaleString()} ج.م</p>
              </div>
           </div>
           <div className="text-rose-200 shrink-0"><ReceiptText size={32} strokeWidth={1.5} /></div>
        </div>
      </div>

      <div className={`${activeTab === 'daily' ? 'bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden' : ''}`}>
          {activeTab === 'daily' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[500px]">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[9px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 md:px-8 py-5">البيان</th>
                    <th className="px-6 md:px-8 py-5">الوقت</th>
                    <th className="px-6 md:px-8 py-5 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(aggregatedData as Expense[]).map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 md:px-8 py-5 font-black text-slate-700 text-xs truncate max-w-[200px]">{exp.description}</td>
                      <td className="px-6 md:px-8 py-5 text-slate-400 font-bold">{exp.time}</td>
                      <td className="px-6 md:px-8 py-5 text-left font-black text-rose-600">{exp.amount.toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                  {aggregatedData.length === 0 && (
                    <tr><td colSpan={3} className="px-10 py-16 text-center text-slate-300 font-bold italic text-sm">لا توجد مصروفات مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {aggregatedData.map((group: any, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-48">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                      {activeTab === 'monthly' ? <Calendar size={20} /> : <Receipt size={20} />}
                    </div>
                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400">{group.count} عملية</span>
                    </div>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                      {activeTab === 'monthly' ? 'تاريخ العمليات' : 'شهر التسجيل'}
                    </p>
                    <h3 className="text-sm font-black text-slate-800 truncate">
                      {activeTab === 'monthly' ? group.date : monthNamesAr[group.month]}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center gap-2">
                    <span className="text-[11px] font-black text-slate-400 shrink-0">إجمالي المبلغ</span>
                    <span className="text-lg font-black text-rose-600 truncate">{group.total.toLocaleString()} ج.م</span>
                  </div>
                </div>
              ))}
              {aggregatedData.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <ReceiptText size={48} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-300 font-bold italic text-sm">لا توجد بيانات لهذا النطاق الزمني</p>
                </div>
              )}
            </div>
          )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-800 text-white shrink-0">
              <h3 className="text-lg font-black">إضافة مصروف جديد</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وصف المصروف</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs" placeholder="مثال: فاتورة كهرباء، إيجار..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ (ج.م)</label>
                <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm" placeholder="0.00" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-4 shrink-0">
              <button onClick={() => setIsOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-xl text-xs">إلغاء</button>
              <button onClick={() => {if(!desc.trim() || !amount) return; const now = new Date(); onAddExpense({ id: crypto.randomUUID(), description: desc, amount: amount, category: 'general', date: formattedSelectedDate, time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), timestamp: now.getTime() }); setIsOpen(false); setDesc(''); setAmount(0); }} className="flex-[1.5] py-4 bg-indigo-600 text-white font-black rounded-xl shadow-md text-xs hover:bg-indigo-700 transition-all">تأكيد الإضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
