import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatNPR } from '../../utils/formatters';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
export const CartDrawer = ({ onProceedToCheckout }) => {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal, grandTotal, totalItemsCount, } = useCart();
    if (!isCartOpen)
        return null;
    return (<div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)}/>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-cyan-600"/>
              <h2 className="text-base font-bold text-slate-900">
                Wholesale Order Cart ({totalItemsCount})
              </h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5"/>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (<div className="text-center py-16">
                <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5]"/>
                <h3 className="mt-3 text-sm font-semibold text-slate-700">Your wholesale cart is empty</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                  Browse the pharmaceutical catalogue to add prescription and OTC medications.
                </p>
                <button onClick={() => setIsCartOpen(false)} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">
                  Browse Catalogue
                </button>
              </div>) : (items.map(item => {
            const lineTotal = item.unitPrice * item.quantity;
            return (<div key={item.product.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <img src={item.product.imageUrl} alt={item.product.name} referrerPolicy="no-referrer" className="h-16 w-16 rounded-lg object-cover border border-slate-100 shrink-0"/>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <div className="text-[10px] text-slate-500 italic truncate">
                            {item.product.genericName}
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1" title="Remove item">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>

                      {/* Batch tag */}
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="rounded bg-slate-100 px-1.5 py-0.2">
                          Batch: {item.selectedBatch?.batchNumber || 'FEFO-AUTO'}
                        </span>
                        <span>Exp: {item.selectedBatch?.expiryDate}</span>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= item.product.moq} className="h-5 w-5 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30">
                            <Minus className="h-3 w-3"/>
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-5 w-5 flex items-center justify-center text-slate-600 hover:bg-white">
                            <Plus className="h-3 w-3"/>
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">
                            {item.quantity} × {formatNPR(item.unitPrice)}
                          </div>
                          <div className="font-mono font-bold text-xs text-slate-900">
                            {formatNPR(lineTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>);
        }))}
          </div>

          {/* Footer Subtotals & Checkout */}
          {items.length > 0 && (<div className="border-t border-slate-200 p-6 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-slate-800">{formatNPR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Essential Meds VAT (0%):</span>
                  <span className="font-mono text-slate-500">Rs. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Van Dispatch Fee:</span>
                  <span className="font-mono text-emerald-600 font-semibold">FREE (Janakpur Wholesale)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Order Total:</span>
                  <span className="font-mono text-base text-cyan-800">{formatNPR(grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={clearCart} className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white transition-colors">
                  Clear
                </button>
                <button onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
            }} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow">
                  <span>Proceed to Wholesale Checkout</span>
                  <ArrowRight className="h-4 w-4"/>
                </button>
              </div>
            </div>)}

        </div>
      </div>
    </div>);
};
