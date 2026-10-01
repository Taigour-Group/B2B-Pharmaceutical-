import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { PortalLoginModal } from './components/common/PortalLoginModal';
import { Footer } from './components/common/Footer';
// Public pages
import { HeroSection } from './components/public/HeroSection';
import { CataloguePreview } from './components/public/CataloguePreview';
import { HowItWorks } from './components/public/HowItWorks';
import { DistributionNetwork } from './components/public/DistributionNetwork';
import { ContactSection } from './components/public/ContactSection';
import { BecomePartnerModal } from './components/public/BecomePartnerModal';
// Pharmacy portal
import { ProductCatalogue } from './components/portal/ProductCatalogue';
import { SmartReorder } from './components/portal/SmartReorder';
import { RegionalDemandTrends } from './components/portal/RegionalDemandTrends';
import { OrdersList } from './components/portal/OrdersList';
import { ExpiryBatchTracker } from './components/portal/ExpiryBatchTracker';
import { ReturnsManager } from './components/portal/ReturnsManager';
import { CreditLedger } from './components/portal/CreditLedger';
import { DocumentsUpload } from './components/portal/DocumentsUpload';
import { CartDrawer } from './components/portal/CartDrawer';
import { CheckoutModal } from './components/portal/CheckoutModal';
import { InvoiceViewModal } from './components/portal/InvoiceViewModal';
// Admin portal
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VerificationQueue } from './components/admin/VerificationQueue';
import { InventoryManager } from './components/admin/InventoryManager';
import { OrderProcessing } from './components/admin/OrderProcessing';
import { RecallManager } from './components/admin/RecallManager';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
const MainAppContent = () => {
    const { role, activeCustomer, isAuthLoading } = useAuth();
    const { invoices } = useCart();
    const [currentTab, setCurrentTab] = useState(() => {
        return role === 'public' ? 'home' : role === 'pharmacy' ? 'portal-catalogue' : 'admin-dashboard';
    });
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [registrationNotice, setRegistrationNotice] = useState('');
    const [completedOrder, setCompletedOrder] = useState(null);
    const [viewInvoice, setViewInvoice] = useState(null);
    useEffect(() => {
        setCurrentTab(role === 'public' ? 'home' : role === 'pharmacy' ? 'portal-catalogue' : 'admin-dashboard');
    }, [role]);
    const handleOrderSuccess = (order) => {
        setIsCheckoutModalOpen(false);
        setCompletedOrder(order);
        const invoice = invoices.find(inv => inv.id === order.invoiceId);
        if (invoice) {
            setViewInvoice(invoice);
        }
    };
    return (<div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} onOpenRegisterModal={() => setIsRegisterModalOpen(true)} onOpenLoginModal={() => setIsLoginModalOpen(true)}/>

      {/* Main View Router */}
      <main className="flex-1">
        {/* PUBLIC VIEWS */}
        {isAuthLoading ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500" role="status">Checking your secure session…</div>
        ) : role === 'public' && (<>
            {registrationNotice && <div role="status" className="mx-auto mt-5 max-w-7xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{registrationNotice}</div>}
            {currentTab === 'home' && (<>
                <HeroSection onOpenRegister={() => setIsRegisterModalOpen(true)} onGoToPortal={() => setIsLoginModalOpen(true)}/>
                <CataloguePreview onGoToPortal={() => setIsLoginModalOpen(true)} onOpenRegister={() => setIsRegisterModalOpen(true)}/>
              </>)}

                {currentTab === 'public-catalogue' && (<CataloguePreview onGoToPortal={() => setIsLoginModalOpen(true)} onOpenRegister={() => setIsRegisterModalOpen(true)}/>)}

            {currentTab === 'how-it-works' && (<HowItWorks onOpenRegister={() => setIsRegisterModalOpen(true)} onGoToPortal={() => setIsLoginModalOpen(true)}/>)}

            {currentTab === 'distribution-network' && <DistributionNetwork />}
            {currentTab === 'contact' && <ContactSection />}
          </>)}

        {/* PHARMACY PORTAL VIEWS */}
        {role === 'pharmacy' && (<div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
            {/* Account Status Restriction Warning if not approved */}
            {activeCustomer?.accountStatus !== 'APPROVED' && (<div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"/>
                <div>
                  <div className="font-bold text-sm">Account Status: {activeCustomer?.accountStatus}</div>
                  <p className="mt-0.5">
                    {activeCustomer?.verificationNotes || 'Your pharmacy documents are being reviewed by the Janakpur compliance officer. You can inspect wholesale rates in preview mode.'}
                  </p>
                </div>
              </div>)}

            {completedOrder && (<div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0"/>
                  <div>
                    <span className="font-bold">Order #{completedOrder.orderNumber} successfully confirmed!</span>
                    <span className="text-emerald-700 ml-2">FEFO batch allocation locked. Preparing van route dispatch.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {viewInvoice && (<button onClick={() => setViewInvoice(viewInvoice)} className="rounded bg-slate-900 px-3 py-1 font-bold text-white text-xs hover:bg-slate-800">
                      Print Tax Invoice
                    </button>)}
                  <button onClick={() => setCompletedOrder(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
                    Dismiss
                  </button>
                </div>
              </div>)}

            {currentTab === 'portal-catalogue' && (<ProductCatalogue onNavigateToReorder={() => setCurrentTab('portal-reorder')}/>)}
            {currentTab === 'portal-reorder' && <SmartReorder />}
            {currentTab === 'portal-trends' && <RegionalDemandTrends />}
            {currentTab === 'portal-orders' && <OrdersList />}
            {currentTab === 'portal-batches' && <ExpiryBatchTracker />}
            {currentTab === 'portal-returns' && <ReturnsManager />}
            {currentTab === 'portal-invoices' && <OrdersList />}
            {currentTab === 'portal-credit' && <CreditLedger />}
            {currentTab === 'portal-docs' && <DocumentsUpload />}
          </div>)}

        {/* OPERATIONS & ADMIN PORTAL VIEWS */}
        {(role === 'admin' || role === 'verification_officer' || role === 'inventory_staff' || role === 'accountant' || role === 'sales_staff' || role === 'delivery_staff') && (<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {currentTab === 'admin-dashboard' && (<AdminDashboard onNavigate={tab => setCurrentTab(tab)}/>)}
            {currentTab === 'admin-verification' && <VerificationQueue />}
            {currentTab === 'admin-orders' && <OrderProcessing />}
            {currentTab === 'admin-inventory' && <InventoryManager />}
            {currentTab === 'admin-recalls' && <RecallManager />}
            {currentTab === 'admin-audit' && <AuditLogViewer />}
          </div>)}
      </main>

      {/* Cart Drawer & Checkout Modals */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutModalOpen(true)}/>
      
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} onOrderSuccess={handleOrderSuccess}/>

      {/* Registration Modal */}
      <BecomePartnerModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onSuccess={() => {
            setIsRegisterModalOpen(false);
            setRegistrationNotice('Your pharmacy application was submitted for review. Once approved, sign in with the email and password you registered.');
        }}/>

      <PortalLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}/>

      {/* Printable Invoice Modal */}
      {viewInvoice && (<InvoiceViewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)}/>)}

      {/* Footer */}
      <Footer />

    </div>);
};
export default function App() {
    return (<AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>);
}
