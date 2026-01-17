
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Search, Eye, X, Package, Boxes, Edit3, Copy, Check, FileSpreadsheet, 
  AlertTriangle, Briefcase, Layers, ShoppingBag, TrendingDown, RefreshCw, Trash2,
  Barcode, Printer, Activity
} from 'lucide-react';
import { Product, User as UserType } from '../types';

declare const XLSX: any;
declare const JsBarcode: any;

const BarcodeGeneratorModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, product.code, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 80,
        displayValue: true,
        font: "Cairo",
        fontSize: 14,
        textMargin: 4
      });
    }
  }, [product]);

  const handlePrintBarcode = () => {
    const printArea = document.getElementById('barcode-print-area');
    if (!printArea) return;

    printArea.innerHTML = `
      <div class="barcode-sticker-mode" style="font-family: 'Cairo', sans-serif; text-align: center;">
        <div style="font-weight: 900; font-size: 12px; margin-bottom: 2px;">ميزة POS</div>
        <div style="font-weight: 700; font-size: 10px; margin-bottom: 2px; white-space: nowrap; overflow: hidden;">${product.name}</div>
        <svg id="print-barcode-svg"></svg>
        <div style="font-weight: 900; font-size: 12px; margin-top: 2px;">${product.retailPrice} ج.م</div>
      </div>
    `;

    JsBarcode("#print-barcode-svg", product.code, {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: true,
      fontSize: 10
    });

    setTimeout(() => {
      window.print();
      printArea.innerHTML = '';
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <h3 className="font-black text-sm flex items-center gap-3"><Barcode size={20} /> باركود ميزة</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8 flex flex-col items-center bg-slate-50">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center w-full overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest truncate w-full text-center">{product.name}</p>
            <svg ref={barcodeRef} className="max-w-full"></svg>
            <p className="text-lg font-black text-indigo-600 mt-4">{product.retailPrice} ج.م</p>
          </div>
        </div>
        <div className="p-6 bg-white flex flex-col gap-3 shrink-0">
          <button 
            onClick={handlePrintBarcode}
            className="w-full py-3 bg-slate-900 text-white font-black rounded-xl shadow-xl flex items-center justify-center gap-3 hover:bg-black transition-all text-[11px]"
          >
            <Printer size={18} /> طباعة الملصق
          </button>
          <button onClick={onClose} className="w-full py-2 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px]">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailsModal: React.FC<{ product: Product; onClose: () => void; user: UserType }> = ({ product, onClose, user }) => {
  const isAdmin = user.role === 'admin';
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in border border-indigo-100">
        <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-md"><Package size={22} /></div>
            <div><h3 className="font-black text-sm">تفاصيل صنف ميزة</h3><p className="text-[10px] opacity-70 font-bold uppercase mt-0.5">#{product.code}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
        </div>
        <div className="p-8 space-y-8 bg-slate-50/50">
          <div className="text-center"><h4 className="text-2xl font-black text-slate-800 mb-2">{product.name}</h4><p className="text-xs font-bold text-slate-400 italic">"{product.description || 'لا يوجد وصف متوفر'}"</p></div>
          <div className="grid grid-cols-2 gap-4">
            {isAdmin && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">متوسط التكلفة (WAC)</p>
                <p className="text-lg font-black text-indigo-600">{(product.wholesalePrice || 0).toLocaleString()} <span className="text-[10px]">ج.م</span></p>
              </div>
            )}
            <div className={`bg-white p-5 rounded-3xl border border-slate-100 text-center shadow-sm ${!isAdmin ? 'col-span-2' : ''}`}>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">سعر البيع الحالي</p>
              <p className="text-lg font-black text-emerald-600">{(product.retailPrice || 0).toLocaleString()} <span className="text-[10px]">ج.م</span></p>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-xl">
             <div><p className="text-[9px] font-black text-indigo-400 uppercase mb-1">المخزون المتوفر</p><p className="text-2xl font-black">{product.stock} <span className="text-xs font-bold">قطعة</span></p></div>
             <Boxes size={32} className="text-white/10" />
          </div>
        </div>
        <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-10 py-3 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs">إغلاق النافذة</button>
        </div>
      </div>
    </div>
  );
};

interface InventoryProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onUpdateStock: (id: string, qty: number, price: number) => void;
  onDeleteProduct: (id: string, reason: string) => void;
  onProductClick?: (product: Product) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  user: UserType;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdateProduct, onUpdateStock, onDeleteProduct, onProductClick, onShowToast, user }) => {
  const isAdmin = user.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<{id: string, reason: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => !p.isDeleted && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm)));

  const inventoryValue = useMemo(() => products.filter(p => !p.isDeleted).reduce((acc, p) => acc + (p.stock * p.wholesalePrice), 0), [products]);

  const handleExportExcel = () => {
    const data = filteredProducts.map(p => ({
      "كود المنتج": p.code,
      "الاسم": p.name,
      "الوصف": p.description || '',
      "سعر التكلفة": isAdmin ? p.wholesalePrice : '---',
      "سعر البيع": p.retailPrice,
      "الرصيد": p.stock
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزن");
    XLSX.writeFile(wb, `Meeza_Inventory_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] select-text pb-12" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><Package size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي الأصناف</p><h3 className="text-xl font-black text-slate-800">{products.filter(p => !p.isDeleted).length} صنف</h3></div>
            <Package className="absolute -bottom-4 -left-4 text-slate-50 w-24 h-24" />
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden group">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm"><Layers size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي الوحدات</p><h3 className="text-xl font-black text-slate-800">{products.filter(p => !p.isDeleted).reduce((a,b)=>a+b.stock,0).toLocaleString()} قطعة</h3></div>
            <Layers className="absolute -bottom-4 -left-4 text-slate-50 w-24 h-24" />
         </div>
         {isAdmin && (
           <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl flex items-center gap-5 relative overflow-hidden group">
              <div className="p-3 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-md"><Briefcase size={24}/></div>
              <div><p className="text-[10px] font-black opacity-60 uppercase mb-1">قيمة المخزون (WAC)</p><h3 className="text-xl font-black">{inventoryValue.toLocaleString()} ج.م</h3></div>
              <Activity className="absolute -bottom-4 -left-4 text-white/5 w-24 h-24" />
           </div>
         )}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-6 no-print h-auto md:h-24">
        <div className="relative flex-1">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="ابحث عن صنف بالاسم أو الكود..." className="w-full pr-14 pl-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg transition-all text-xs flex items-center gap-2"><FileSpreadsheet size={18}/> تصدير</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[11px] min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b">
              <tr>
                <th className="px-8 py-5">الصنف</th>
                <th className="px-8 py-5">الكود</th>
                <th className="px-8 py-5 text-center">الرصيد</th>
                {isAdmin && <th className="px-8 py-5 text-center">التكلفة (WAC)</th>}
                <th className="px-8 py-5 text-center">سعر البيع</th>
                <th className="px-8 py-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-4"><p className="text-slate-800 font-black text-sm">{p.name}</p><p className="text-[9px] text-slate-400 italic">{p.description || 'بدون وصف'}</p></td>
                  <td className="px-8 py-4">
                    <button onClick={() => { navigator.clipboard.writeText(p.code); setCopiedId(p.code); setTimeout(()=>setCopiedId(null),2000); }} className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-all">
                      #{p.code} {copiedId === p.code ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-30" />}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${p.stock < 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-700'}`}>
                      {p.stock} قطعة
                    </span>
                  </td>
                  {isAdmin && <td className="px-8 py-4 text-center text-indigo-600 font-black">{(p.wholesalePrice || 0).toLocaleString()}</td>}
                  <td className="px-8 py-4 text-center text-slate-900 font-black">{(p.retailPrice || 0).toLocaleString()}</td>
                  <td className="px-8 py-4 text-left">
                    <div className="flex gap-2 justify-end">
                      {isAdmin && (
                        <button onClick={() => setEditingProduct(p)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
                      )}
                      <button onClick={() => setBarcodeProduct(p)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Barcode size={16}/></button>
                      {isAdmin && (
                        <button onClick={() => setDeleteProduct({id: p.id, reason: ''})} className="p-2.5 bg-slate-100 text-slate-300 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-black text-sm flex items-center gap-3"><Edit3 size={20}/> تحديث بيانات الصنف</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الأساسي</label><input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">وصف الصنف</label><input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">سعر البيع</label><input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" value={editingProduct.retailPrice} onChange={e => setEditingProduct({...editingProduct, retailPrice: Number(e.target.value)})} /></div>
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المخزون الحالي</label><input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-sm" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} /></div>
                </div>
             </div>
             <div className="p-6 bg-slate-50 border-t flex gap-4">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl text-xs">إلغاء</button>
                <button onClick={() => { onUpdateProduct(editingProduct.id, { name: editingProduct.name, description: editingProduct.description, retailPrice: editingProduct.retailPrice, stock: editingProduct.stock }); setEditingProduct(null); onShowToast?.("تم تحديث البيانات بنجاح", "success"); }} className="flex-[1.5] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl text-xs hover:bg-indigo-700 transition-all">حفظ التعديلات</button>
             </div>
          </div>
        </div>
      )}

      {deleteProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-8 text-center bg-rose-50"><AlertTriangle className="mx-auto mb-4 text-rose-600" size={40}/><h3 className="text-xl font-black mb-2 text-slate-800">حذف الصنف؟</h3><textarea autoFocus value={deleteProduct.reason} onChange={e => setDeleteProduct({...deleteProduct, reason: e.target.value})} className="w-full p-3 rounded-xl border border-rose-200 outline-none font-bold text-xs min-h-[80px]" placeholder="سبب الحذف الإلزامي..." /></div>
            <div className="p-5 flex gap-3 border-t border-slate-50"><button onClick={() => setDeleteProduct(null)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-500 font-black rounded-xl text-[10px]">تراجع</button><button onClick={() => { onDeleteProduct(deleteProduct.id, deleteProduct.reason); setDeleteProduct(null); onShowToast?.("تم نقل الصنف للمحذوفات", "success"); }} disabled={!deleteProduct.reason.trim()} className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] active:scale-95 transition-all">حذف نهائي</button></div>
          </div>
        </div>
      )}

      {barcodeProduct && <BarcodeGeneratorModal product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />}
    </div>
  );
};

export default Inventory;
