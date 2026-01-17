
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('meeza_pos_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Meeza: Failed to load inventory from storage", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('meeza_pos_inventory', JSON.stringify(products));
    } catch (err) {
      console.error("Meeza: Failed to save inventory", err);
    }
  }, [products]);

  const generateCode = useCallback(() => {
    let code: string;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (products.some(p => p.code === code));
    return code;
  }, [products]);

  const addProduct = (name: string, description: string, wholesale: number, retail: number, initialStock: number) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      code: generateCode(),
      name: name || 'منتج غير مسمى',
      description,
      wholesalePrice: wholesale || 0,
      retailPrice: retail || 0,
      stock: initialStock || 0,
      isDeleted: false
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct; // نعود بالمنتج لاستخدامه في الفاتورة فوراً
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
  };

  const deleteProduct = (productId: string, reason: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isDeleted: true, deletionReason: reason, deletionTimestamp: Date.now() } : p
    ));
  };

  const restoreProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isDeleted: false, deletionReason: undefined, deletionTimestamp: undefined } : p
    ));
  };

  const permanentlyDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateStockWAC = (productId: string, addedQty: number, newPurchasePrice: number, updatedRetailPrice?: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      
      const currentStock = Number(p.stock) || 0;
      const currentWPrice = Number(p.wholesalePrice) || 0;
      const addedQuantity = Number(addedQty) || 0;
      const purchasePrice = Number(newPurchasePrice) || 0;
      
      const totalCostOfCurrent = currentStock * currentWPrice;
      const totalCostOfNew = addedQuantity * purchasePrice;
      const totalStock = currentStock + addedQuantity;
      
      const newWAC = totalStock > 0 
        ? (totalCostOfCurrent + totalCostOfNew) / totalStock 
        : purchasePrice;

      return {
        ...p,
        stock: totalStock,
        wholesalePrice: Number(newWAC.toFixed(2)),
        retailPrice: updatedRetailPrice !== undefined ? Number(updatedRetailPrice) : p.retailPrice
      };
    }));
  };

  const deductStock = (productId: string, qty: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: Math.max(0, p.stock - (Number(qty) || 0)) } : p
    ));
  };

  const restockItem = (productId: string, qty: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: p.stock + (Number(qty) || 0) } : p
    ));
  };

  // إضافة وظيفة لتفريغ سلة محذوفات المنتجات
  const emptyProductBin = () => {
    setProducts(prev => prev.filter(p => !p.isDeleted));
  };

  const restoreProducts = (newProducts: Product[]) => {
    setProducts(Array.isArray(newProducts) ? newProducts : []);
  };

  return { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    restoreProduct, 
    permanentlyDeleteProduct, 
    updateStockWAC, 
    deductStock, 
    restockItem, 
    restoreProducts,
    emptyProductBin
  };
};
