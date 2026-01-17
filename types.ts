
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  wholesalePriceAtSale: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  items: SaleItem[];
  totalBeforeDiscount: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  netTotal: number;
  date: string;
  time: string;
  timestamp: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  status: 'completed' | 'returned';
  createdBy: string; 
  creatorUsername?: string; // أضيف هنا لتتبع اسم الموظف
  branchId?: string;
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  time: string;
  timestamp: number;
  createdBy: string;
  branchId?: string;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
  retailPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  taxNumber?: string; 
  totalDebt: number; 
  totalPaid: number; 
  totalSupplied: number; 
  isDeleted?: boolean;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  purchaseId?: string;
  amount: number;
  date: string;
  time: string;
  timestamp: number;
  notes?: string;
  createdBy: string;
}

export interface PurchaseRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  taxNumber?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number; 
  remainingAmount: number; 
  paymentStatus: 'cash' | 'credit';
  date: string;
  time: string;
  timestamp: number;
  createdBy: string;
  branchId?: string;
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  refundAmount: number;
  wholesalePriceAtSale: number;
}

export interface ReturnRecord {
  id: string;
  invoiceId: string;
  items: ReturnItem[];
  totalRefund: number;
  date: string;
  time: string;
  timestamp: number;
  createdBy: string;
  branchId?: string;
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export interface Branch {
  id: string;
  name: string;
  location?: string;
  managerId?: string;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  fullName?: string; // أضيف لتسجيل اسم الموظف
  phoneNumber?: string; // أضيف لتسجيل رقم الموبايل
  role: 'admin' | 'supervisor' | 'employee';
  branchId?: string;
  password?: string;
  createdAt: number;
}

export type ViewType = 'dashboard' | 'sales' | 'inventory' | 'returns' | 'expenses' | 'reports' | 'archive' | 'recycleBin' | 'customers' | 'purchases' | 'staff' | 'branches';
