import React, { useState } from 'react';
import { ShoppingCart, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
export const Navbar = ({ currentTab, setCurrentTab, onOpenRegisterModal, onOpenLoginModal }) => {
    const { role, user, activeCustomer, logout } = useAuth();
    const { totalItemsCount, setIsCartOpen, cartIconRef, cartBadgePulse } = useCart();
    const [logoutError, setLogoutError] = useState('');
    return (<header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-[#091d30] text-white shadow-sm transition-colors">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentTab(role === 'public' ? 'home' : 'portal-catalogue')} className="group flex shrink-0 items-center gap-2 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-400 text-[#092137] transition-colors group-hover:bg-cyan-300">
              <span className="font-bold text-lg tracking-tight">JP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight text-white transition-colors group-hover:text-cyan-200 sm:text-sm">
                Janakpur<br className="sm:hidden"/> PharmaDistro
              </span>
              <span className="hidden text-[9px] font-medium text-slate-400 sm:inline">
                Authorized Medical Wholesale · Janakpur
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden h-full items-center gap-5 text-[11px] font-semibold text-slate-300 md:flex">
          {role === 'public' ? (<>
              <button onClick={() => setCurrentTab('home')} className={`transition-colors hover:text-slate-900 ${currentTab === 'home' ? 'text-slate-900 font-semibold' : ''}`}>
                Overview
              </button>
              <button onClick={() => setCurrentTab('public-catalogue')} className={`transition-colors hover:text-slate-900 ${currentTab === 'public-catalogue' ? 'text-slate-900 font-semibold' : ''}`}>
                Catalogue
              </button>
              <button onClick={() => setCurrentTab('how-it-works')} className={`transition-colors hover:text-slate-900 ${currentTab === 'how-it-works' ? 'text-slate-900 font-semibold' : ''}`}>
                How It Works
              </button>
              <button onClick={() => setCurrentTab('distribution-network')} className={`transition-colors hover:text-slate-900 ${currentTab === 'distribution-network' ? 'text-slate-900 font-semibold' : ''}`}>
                Coverage
              </button>
              <button onClick={() => setCurrentTab('contact')} className={`transition-colors hover:text-slate-900 ${currentTab === 'contact' ? 'text-slate-900 font-semibold' : ''}`}>
                Contact
              </button>
            </>) : role === 'pharmacy' ? (<>
              <button onClick={() => setCurrentTab('portal-catalogue')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-catalogue' ? 'text-slate-900 font-semibold' : ''}`}>
                Wholesale Order
              </button>
              <button onClick={() => setCurrentTab('portal-reorder')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-reorder' ? 'text-slate-900 font-semibold' : ''}`}>
                Smart Reorder
              </button>
              <button onClick={() => setCurrentTab('portal-trends')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-trends' ? 'text-slate-900 font-semibold' : ''}`}>
                Regional Trends
              </button>
              <button onClick={() => setCurrentTab('portal-orders')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-orders' ? 'text-slate-900 font-semibold' : ''}`}>
                Orders & Tracking
              </button>
              <button onClick={() => setCurrentTab('portal-batches')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-batches' ? 'text-slate-900 font-semibold' : ''}`}>
                Expiry & Batches
              </button>
              <button onClick={() => setCurrentTab('portal-returns')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-returns' ? 'text-slate-900 font-semibold' : ''}`}>
                Returns
              </button>
              <button onClick={() => setCurrentTab('portal-invoices')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-invoices' ? 'text-slate-900 font-semibold' : ''}`}>
                Invoices
              </button>
              <button onClick={() => setCurrentTab('portal-credit')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-credit' ? 'text-slate-900 font-semibold' : ''}`}>
                Credit Ledger
              </button>
              <button onClick={() => setCurrentTab('portal-docs')} className={`transition-colors hover:text-slate-900 ${currentTab === 'portal-docs' ? 'text-slate-900 font-semibold' : ''}`}>
                Compliance
              </button>
            </>) : (<>
              <button onClick={() => setCurrentTab('admin-dashboard')} className={`transition-colors hover:text-slate-900 ${currentTab === 'admin-dashboard' ? 'text-slate-900 font-semibold' : ''}`}>
                Dashboard
              </button>
              <button onClick={() => setCurrentTab('admin-verification')} className={`transition-colors hover:text-slate-900 ${currentTab === 'admin-verification' ? 'text-slate-900 font-semibold' : ''}`}>
                Verification Queue
              </button>
              <button onClick={() => setCurrentTab('admin-orders')} className={`transition-colors hover:text-slate-900 ${currentTab === 'admin-orders' ? 'text-slate-900 font-semibold' : ''}`}>
                Orders
              </button>
              <button onClick={() => setCurrentTab('admin-inventory')} className={`transition-colors hover:text-slate-900 ${currentTab === 'admin-inventory' ? 'text-slate-900 font-semibold' : ''}`}>
                Inventory & Batches
              </button>
              <button onClick={() => setCurrentTab('admin-recalls')} className={`transition-colors hover:text-slate-900 ${currentTab === 'admin-recalls' ? 'text-slate-900 font-semibold' : ''}`}>
                Recalls
              </button>
              <button onClick={() => setCurrentTab('admin-audit')} className={`transition-colors hover:text-slate-900 ${currentTab === 'admin-audit' ? 'text-slate-900 font-semibold' : ''}`}>
                Audit Log
              </button>
            </>)}
        </nav>

        {/* Zone 3: account actions */}
        <div className="flex items-center gap-3">
          {/* Cart button if in Pharmacy mode or testing */}
          {role === 'pharmacy' && (<button ref={cartIconRef} onClick={() => setIsCartOpen(true)} className={`relative flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 ${cartBadgePulse ? 'ring-2 ring-cyan-400 scale-105 bg-cyan-900' : ''}`} title="Open wholesale cart">
              <ShoppingCart className="h-4 w-4 text-slate-700"/>
              <span className="hidden sm:inline">Order Cart</span>
              <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-bold text-[#092137] transition-transform ${cartBadgePulse ? 'scale-125 bg-cyan-300' : 'bg-cyan-400'}`}>
                {totalItemsCount}
              </span>
            </button>)}

          {role === 'public' ? (
            <>
              <button onClick={onOpenLoginModal} className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800">
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </button>
              <button onClick={onOpenRegisterModal} className="whitespace-nowrap rounded-md bg-cyan-400 px-3 py-2 text-xs font-bold text-[#092137] shadow-sm transition-colors hover:bg-cyan-300">
                Become a Partner
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {logoutError && <span role="alert" className="max-w-40 text-[10px] text-rose-300">{logoutError}</span>}
              <span className="hidden max-w-40 truncate text-xs font-semibold text-slate-200 sm:inline">
                {activeCustomer?.businessName || user?.displayName || user?.email}
              </span>
              <button onClick={async () => {
                  setLogoutError('');
                  try {
                      await logout();
                      setCurrentTab('home');
                  }
                  catch (error) {
                      setLogoutError(error.message);
                  }
              }} title="Sign out" aria-label="Sign out" className="rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                <LogOut className="h-4 w-4"/>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>);
};
