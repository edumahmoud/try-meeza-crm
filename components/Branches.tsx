
import React, { useState, useMemo } from 'react';
import { 
  Building2, Plus, Search, MapPin, Users, Activity, 
  ChevronRight, ArrowLeft, X, TrendingUp, UserCheck, 
  ShieldCheck, MoreHorizontal, Calendar, Hash
} from 'lucide-react';
import { User as UserType, Branch } from '../types';

interface BranchesProps {
  user: UserType;
  branches: Branch[];
  users: UserType[];
  onAddBranch: (name: string, location?: string) => void;
  onShowToast: (m: string, t: 'success' | 'error') => void;
}

const Branches: React.FC<BranchesProps> = ({ user, branches, users, onAddBranch, onShowToast }) => {
  const isAdmin = user.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');

  const visibleBranches = useMemo(() => {
    let list = branches.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!isAdmin) {
      // المشرف يرى فرعه فقط
      list = list.filter(b => b.id === user.branchId);
    }
    return list;
  }, [branches, searchTerm, isAdmin, user]);

  const handleAddBranch = () => {
    if (!newName.trim()) return onShowToast("يرجى إدخال اسم الفرع", "error");
    onAddBranch(newName, newLoc);
    onShowToast("تم إنشاء الفرع بنجاح", "success");
    setIsAddBranchOpen(false);
    setNewName('');
    setNewLoc('');
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">إدارة شبكة الفروع</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">تتبع الأداء والتوزيع الجغرافي</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="بحث عن فرع..." className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          {isAdmin && (
            <button onClick={() => setIsAddBranchOpen(true)} className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] flex items-center gap-2 shadow-lg shrink-0 hover:bg-indigo-700 transition-all"><Plus size={14} /> فرع جديد</button>
          )}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleBranches.map(b => {
          const branchUsers = users.filter(u => u.branchId === b.id);
          const supervisor = branchUsers.find(u => u.role === 'supervisor');
          return (
            <div key={b.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b bg-slate-50/50 flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{b.name}</h4>
                    <p className="text-slate-400 font-bold text-[10px] flex items-center gap-1 mt-1 uppercase"><MapPin size={12} className="text-rose-500" /> {b.location || 'غير محدد'}</p>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400">
                  <MoreHorizontal size={18} />
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase">مشرف الفرع</p>
                      <p className="text-xs font-black text-slate-800">{supervisor?.username || 'لا يوجد مشرف معين'}</p>
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-indigo-600 px-3 py-1 bg-white rounded-lg shadow-sm">نشط</div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} /> فريق العمل ({branchUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {branchUsers.map(u => (
                      <span key={u.id} className={`px-4 py-1.5 rounded-xl text-[10px] font-black shadow-sm border ${u.role === 'supervisor' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-600 border-slate-100'}`}>
                        {u.username}
                      </span>
                    ))}
                    {branchUsers.length === 0 && <p className="text-[10px] font-bold text-slate-300 italic">لا يوجد موظفين حالياً في هذا الفرع</p>}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                  <Calendar size={12} /> تأسس في {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                  <Hash size={12} /> ID: {b.id.slice(0, 8)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black text-sm flex items-center gap-2"><Building2 size={18}/> إضافة فرع جديد</h3>
              <button onClick={() => setIsAddBranchOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم الفرع</label>
                <input type="text" autoFocus value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/10" placeholder="مثال: فرع وسط المدينة..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الموقع الجغرافي</label>
                <input type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/10" placeholder="مثال: حي الرياض، شارع 10..." />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100 shrink-0">
              <button onClick={() => setIsAddBranchOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black rounded-xl text-xs">إلغاء</button>
              <button onClick={handleAddBranch} className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl text-xs hover:bg-indigo-700 transition-all active:scale-95">تثبيت الفرع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
