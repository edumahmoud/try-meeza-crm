
import { useState, useEffect } from 'react';
import { User, Branch } from '../types';

export const useStaffData = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('meeza_pos_users');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', username: 'admin', role: 'admin', password: 'admin123', createdAt: Date.now() },
      { id: '2', username: 'user', role: 'employee', password: 'user123', branchId: 'b1', createdAt: Date.now() },
      { id: '3', username: 'supervisor', role: 'supervisor', password: 'super123', branchId: 'b1', createdAt: Date.now() }
    ];
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('meeza_pos_branches');
    if (saved) return JSON.parse(saved);
    return [{ id: 'b1', name: 'الفرع الرئيسي', location: 'القاهرة', createdAt: Date.now() }];
  });

  useEffect(() => {
    localStorage.setItem('meeza_pos_users', JSON.stringify(users));
    localStorage.setItem('meeza_pos_branches', JSON.stringify(branches));
  }, [users, branches]);

  const generateStaffUsername = (role: 'supervisor' | 'employee' | 'admin') => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const prefix = role === 'supervisor' ? 'S-' : role === 'admin' ? 'A-' : 'E-';
    return `${prefix}${randomDigits}`;
  };

  const addUser = (role: User['role'], fullName: string, phoneNumber: string, branchId?: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      username: generateStaffUsername(role),
      fullName,
      phoneNumber,
      role,
      password: 'pass',
      branchId,
      createdAt: Date.now()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUserRole = (userId: string, newRole: User['role']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addBranch = (name: string, location?: string) => {
    const newBranch: Branch = {
      id: crypto.randomUUID(),
      name,
      location,
      createdAt: Date.now()
    };
    setBranches(prev => [...prev, newBranch]);
    return newBranch;
  };

  const restoreStaffData = (usersData: User[], branchesData: Branch[]) => {
    if (Array.isArray(usersData)) setUsers(usersData);
    if (Array.isArray(branchesData)) setBranches(branchesData);
  };

  return { users, branches, addUser, updateUserRole, deleteUser, addBranch, restoreStaffData };
};
