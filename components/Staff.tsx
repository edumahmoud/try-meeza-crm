
import React, { useState, useMemo } from 'react';
import { 
  UserCog, UserPlus, ShieldCheck, Shield, User, Search, X, 
  ArrowUpCircle, Activity, Trash2, Building2, Calendar, Clock, TrendingUp, HandCoins, Phone
} from 'lucide-react';
import { User as UserType, Branch, Invoice, ReturnRecord, Expense } from '../types';

interface StaffProps {
  user: UserType;
  users: UserType[];
  branches: Branch[];
  invoices: Invoice[];
  returns: ReturnRecord[];
  expenses: Expense[];
  onAddUser: (role: UserType['role'], fullName: string, phoneNumber: string, branchId?: string) => UserType;
  onUpdateRole: (id: string, role: UserType['role']) => void;
  onDeleteUser: (id: string) => void;
  onShowToast: (m: string, t: 'success' | 'error') => void;
}

const Staff: React.FC<StaffProps> = ({ user, users, branches, invoices, returns, expenses, onAddUser, onUpdateRole, onDeleteUser, onShowToast }) => {
  const isAdmin = user.role === 'admin';
  const isSupervisor = user.role === 'supervisor';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [newRole, setNewRole] = useState<UserType['role']>('employee');
  const [newFullName, setNewFullName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newBranchId, setNewBranchId] = useState('');

  const visibleUsers = useMemo(() => {
    let list = users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (isSupervisor) {
      list = list.filter(u => u.role === 'employee' && u.branchId === user.branchId);
    }
    return list;
  }, [users, searchTerm, user, isSupervisor]);

  const handleAddUser = () => {
    if (!newFullName.trim()) return onShowToast("الاسم الكامل مطلوب", "error");
    if (!newPhoneNumber.trim()) return onShowToast("رقم الموبايل مطلوب", "error");
    
    onAddUser(newRole, newFullName, newPhoneNumber, newBranchId || undefined);
    onShowToast("تم إنشاء الحساب ببيانات تلقائية وكلمة مرور: pass", "success");
    setIsAddUserOpen(false);
    setNewFullName('');
    setNewPhoneNumber('');
  };

  const getDetailedStats = (userId: string) => {
    const userInvs = invoices.filter(i => i.createdBy === userId && !i.isDeleted);
    const now = new Date();
    const todayStr = now.toLocaleDateString('ar-EG');
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const daily = userInvs.filter(i => i.date === todayStr);
    const monthly = userInvs.filter(i => {
      const d = new Date(i.timestamp);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const yearly = userInvs.filter(i => {
      const d = new Date(i.timestamp);
      return d.getFullYear() === currentYear;
    });

    return {
      today: { count: daily.length, total: daily.reduce((a, b) => a + b.netTotal, 0) },
      month: { count: monthly.length, total: monthly.reduce((a, b) => a + b.netTotal, 0) },
      year: { count: yearly.length, total: yearly.reduce((a, b) => a + b.netTotal, 0) }
    };
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><UserCog size={24} /></div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">إدارة شؤون الموظفين</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">توليد الحسابات ومراقبة الأداء</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="بحث بالاسم أو اسم المستخدم..." className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsAddUserOpen(true)} className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"><UserPlus size={14} /> إضافة حساب</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleUsers.map(u => {
          const stats = getDetailedStats(u.id);
          const branch = branches.find(b => b.id === u.branchId);
          return (
            <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><User size={24} /></div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm select-all">{u.fullName || u.username}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${u.role === 'admin' ? 'bg-indigo-600 text-white' : u.role === 'supervisor' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{u.role === 'admin' ? 'مدير' : u.role === 'supervisor' ? 'مشرف' : 'موظف'}</span>
                      {u.phoneNumber && <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Phone size={10} /> {u.phoneNumber}</span>}
                    </div>
                    <p className="text-[9px] text-slate-300 font-bold mt-1">ID: {u.username}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => onUpdateRole(u.id, 'admin')} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="ترقية لمدير"><ShieldCheck size={16}/></button>
                    <button onClick={() => onDeleteUser(u.id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-slate-400 uppercase">مبيعات اليوم</span><span className="text-[10px] font-black text-emerald-600">{stats.today.total.toLocaleString()} ج.م</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: `${Math.min(100, stats.today.count * 10)}%`}}></div></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100"><p className="text-[8px] font-black text-indigo-400 uppercase">عمليات الشهر</p><p className="text-xs font-black text-slate-800">{stats.month.count} فاتورة</p></div>
                    <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100"><p className="text-[8px] font-black text-amber-400 uppercase">إنجاز السنة</p><p className="text-xs font-black text-slate-800">{stats.year.count} فاتورة</p></div>
                 </div>
              </div>

              <button onClick={() => setSelectedUser(u)} className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl"><Activity size={16} /> لوحة بيانات الأداء</button>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-black text-sm flex items-center gap-2"><UserPlus size={18}/> إنشاء حساب ذكي</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setNewRole('employee')} className={`py-3 rounded-xl border font-black text-xs transition-all ${newRole === 'employee' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>موظف (E)</button>
                   {isAdmin && <button onClick={() => setNewRole('supervisor')} className={`py-3 rounded-xl border font-black text-xs transition-all ${newRole === 'supervisor' ? 'bg-amber-500 text-white border-amber-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>مشرف (S)</button>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
                <input type="text" value={newFullName} onChange={e => setNewFullName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none" placeholder="أدخل اسم الموظف..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الموبايل</label>
                <input type="text" value={newPhoneNumber} onChange={e => setNewPhoneNumber(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none" placeholder="01xxxxxxxxx" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">تعيين الفرع</label>
                <select value={newBranchId} onChange={e => setNewBranchId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none">
                  <option value="">اختر الفرع...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                 <p className="text-[9px] font-black text-amber-600 leading-relaxed italic">ملاحظة: اسم المستخدم سيتولد تلقائياً وكلمة المرور ستكون "pass" بشكل افتراضي.</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button onClick={() => setIsAddUserOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black rounded-xl text-xs">إلغاء</button>
              <button onClick={handleAddUser} className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl text-xs">توليد الحساب</button>
            </div>
          </div>
        </div>
      )}

      {/* User Dashboard Modal (Detailed Performance) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[1200] flex items-center justify-center p-4 animate-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-indigo-100">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner"><User size={32} /></div>
                <div>
                  <h2 className="text-2xl font-black">{selectedUser.fullName || selectedUser.username}</h2>
                  <p className="text-indigo-400 font-bold opacity-80 uppercase tracking-widest text-[10px]">لوحة متابعة الأداء والعمليات</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/20"><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 {[['اليوم', 'today', 'bg-emerald-500'], ['الشهر', 'month', 'bg-indigo-600'], ['السنة', 'year', 'bg-amber-500']].map(([title, key, color]) => {
                   const s = getDetailedStats(selectedUser.id)[key as 'today' | 'month' | 'year'];
                   return (
                     <div key={key} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-1.5 h-full ${color}`}></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إجمالي مبيعات {title}</p>
                        <h4 className="text-2xl font-black text-slate-800 mb-4">{s.total.toLocaleString()} <span className="text-xs">ج.م</span></h4>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-fit"><TrendingUp size={12} className="text-emerald-500" /><span className="text-[10px] font-black">{s.count} عملية بيع</span></div>
                     </div>
                   );
                 })}
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 bg-slate-50 border-b flex items-center gap-3"><Activity size={18} className="text-indigo-600"/><h3 className="font-black text-sm text-slate-800">آخر العمليات المسجلة</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/50 text-slate-400 font-black text-[9px] border-b uppercase"><tr><th className="p-4">الفاتورة</th><th className="p-4">التوقيت</th><th className="p-4 text-center">الصافي</th><th className="p-4">العميل</th></tr></thead>
                    <tbody className="divide-y divide-slate-50 font-bold">
                      {invoices.filter(i => i.createdBy === selectedUser.id && !i.isDeleted).slice(0, 10).map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors"><td className="p-4 text-indigo-600 font-black">#{inv.id}</td><td className="p-4 text-slate-400"><span className="flex items-center gap-1"><Calendar size={10}/> {inv.date}</span></td><td className="p-4 text-center text-slate-900">{inv.netTotal.toLocaleString()} ج.م</td><td className="p-4 text-slate-500">{inv.customerName || 'نقدي'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white border-t flex justify-end shrink-0 shadow-sm"><button onClick={() => setSelectedUser(null)} className="px-10 py-3 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs hover:bg-slate-200 transition-all">إغلاق اللوحة</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
