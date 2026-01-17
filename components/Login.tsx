
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, LogIn, AlertCircle, Info, Key, UserCircle, Shield } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // بيانات تجريبية: مدير (admin/admin123) ، مشرف (supervisor/super123)، موظف (user/user123)
    if (username === 'admin' && password === 'admin123') {
      onLogin({ id: '1', username: 'المدير العام', role: 'admin' });
    } else if (username === 'supervisor' && password === 'super123') {
      onLogin({ id: '3', username: 'مشرف العمليات', role: 'supervisor' });
    } else if (username === 'user' && password === 'user123') {
      onLogin({ id: '2', username: 'موظف مبيعات', role: 'employee' });
    } else {
      setError('خطأ في اسم المستخدم أو كلمة المرور');
    }
  };

  const setDemoLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Cairo']" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-10 text-center text-white relative">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">ميزة POS</h1>
          <p className="text-indigo-100 text-sm font-bold opacity-80">نظام الإدارة المتكامل</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black border border-rose-100 animate-in">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-1">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold transition-all text-sm"
                placeholder="أدخل اسم المستخدم..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <LogIn size={20} />
            دخول للنظام
          </button>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Key size={14} />
              <span className="text-[10px] font-black uppercase">بيانات الدخول التجريبية (Quick Access)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => setDemoLogin('admin', 'admin123')}
                className="p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all text-right group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-black">مدير</span>
                </div>
                <p className="text-[8px] font-bold opacity-60">admin / admin123</p>
              </button>

              <button 
                type="button"
                onClick={() => setDemoLogin('supervisor', 'super123')}
                className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 hover:bg-amber-100 transition-all text-right group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={12} />
                  <span className="text-[10px] font-black">مشرف</span>
                </div>
                <p className="text-[8px] font-bold opacity-60">supervisor / super123</p>
              </button>

              <button 
                type="button"
                onClick={() => setDemoLogin('user', 'user123')}
                className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all text-right group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCircle size={12} />
                  <span className="text-[10px] font-black">موظف</span>
                </div>
                <p className="text-[8px] font-bold opacity-60">user / user123</p>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-2">
              <Info size={12} />
              هذه البيانات مخصصة للتجربة فقط
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
