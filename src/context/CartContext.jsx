import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_INVOICES, INITIAL_RECALLS } from '../data/seedData';
import { CartFlyAnimation } from '../components/common/CartFlyAnimation';
import { useAuth } from './AuthContext';
import { sortBatchesFEFO } from '../utils/formatters';
const CartContext = createContext(undefined);
export const CartProvider = ({ children }) => {
    const { activeCustomer, logAuditAction } = useAuth();
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('jpd_cart_items');
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch { /* ignore */ }
        }
        return [];
    });
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('jpd_products');
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch { /* ignore */ }
        }
        return INITIAL_PRODUCTS;
    });
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('jpd_orders');
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch { /* ignore */ }
        }
        return INITIAL_ORDERS;
    });
    const [invoices, setInvoices] = useState(() => {
        const saved = localStorage.getItem('jpd_invoices');
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch { /* ignore */ }
        }
        return INITIAL_INVOICES;
    });
    const INITIAL_RETURNS = [
        {
            id: 'RET-1011',
            orderNumber: 'JPD-ORD-2026-1048',
            customerName: 'ABC Medical Hall & Polyclinic',
            productId: 'PROD-001',
            productName: 'Amoxicillin Trihydrate 500mg Capsules',
            genericName: 'Amoxicillin Trihydrate',
            batchNumber: 'AMX-26A04',
            expiryDate: '2027-04',
            quantity: 5,
            unitPrice: 685,
            totalCreditValue: 3425,
            reason: 'Damaged Product',
            packagingCondition: 'Damaged Outer Carton',
            evidencePhotos: ['/src/assets/images/amoxicillin_pack_1790830676089.jpg'],
            status: 'APPROVED',
            requestedAt: '2026-09-30T11:20:00Z',
            resolutionNote: 'Approved for van pickup on Oct 1 Morning Route. Credit Note CN-2026-0902 generated.',
            pickupVan: 'Route Van #3',
            creditNoteNumber: 'CN-2026-0902',
        },
        {
            id: 'RET-1008',
            orderNumber: 'JPD-ORD-2026-1047',
            customerName: 'ABC Medical Hall & Polyclinic',
            productId: 'PROD-002',
            productName: 'Paracetamol Paediatric Oral Suspension 120mg/5ml',
            genericName: 'Paracetamol (Acetaminophen)',
            batchNumber: 'PYR-25H18',
            expiryDate: '2026-11-20',
            quantity: 10,
            unitPrice: 58,
            totalCreditValue: 580,
            reason: 'Near Expiry',
            packagingCondition: 'Unopened Original Crate',
            evidencePhotos: ['/src/assets/images/paracetamol_syrup_1790830686687.jpg'],
            status: 'CREDITED',
            requestedAt: '2026-09-27T14:10:00Z',
            resolutionNote: 'Batch returned and verified at depot. Amount Rs. 580 applied as credit to account.',
            creditNoteNumber: 'CN-2026-0889',
        },
    ];
    const [recalls] = useState(INITIAL_RECALLS);
    const [returns, setReturns] = useState(() => {
        const saved = localStorage.getItem('jpd_returns');
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch { /* ignore */ }
        }
        return INITIAL_RETURNS;
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [flyInstances, setFlyInstances] = useState([]);
    const [cartBadgePulse, setCartBadgePulse] = useState(false);
    const cartIconRef = useRef(null);
    useEffect(() => {
        localStorage.setItem('jpd_returns', JSON.stringify(returns));
    }, [returns]);
    useEffect(() => {
        localStorage.setItem('jpd_cart_items', JSON.stringify(items));
    }, [items]);
    useEffect(() => {
        localStorage.setItem('jpd_products', JSON.stringify(products));
    }, [products]);
    useEffect(() => {
        localStorage.setItem('jpd_orders', JSON.stringify(orders));
    }, [orders]);
    useEffect(() => {
        localStorage.setItem('jpd_invoices', JSON.stringify(invoices));
    }, [invoices]);
    const addToCart = (product, quantity, batch, sourceEl) => {
        // Validate MOQ
        if (quantity < product.moq) {
            return false;
        }
        // Auto-select FEFO batch if not provided
        const selectedBatch = batch || sortBatchesFEFO(product.batches)[0];
        // Trigger high-speed cart fly animation if coordinates available
        if (sourceEl && cartIconRef.current) {
            const srcRect = sourceEl.getBoundingClientRect();
            const destRect = cartIconRef.current.getBoundingClientRect();
            const newFly = {
                id: `fly-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                startX: srcRect.left + srcRect.width / 2,
                startY: srcRect.top + srcRect.height / 2,
                endX: destRect.left + destRect.width / 2,
                endY: destRect.top + destRect.height / 2,
            };
            setFlyInstances(prev => [...prev, newFly]);
        }
        setItems(prev => {
            const existingIndex = prev.findIndex(item => item.product.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                };
                return updated;
            }
            return [
                ...prev,
                {
                    product,
                    quantity,
                    selectedBatch,
                    unitPrice: product.wholesalePrice,
                },
            ];
        });
        return true;
    };
    const handleFlyComplete = (id) => {
        setFlyInstances(prev => prev.filter(f => f.id !== id));
        // Trigger bounce/pulse on the header cart
        setCartBadgePulse(true);
        setTimeout(() => setCartBadgePulse(false), 500);
    };
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                return { ...item, quantity };
            }
            return item;
        }));
    };
    const removeFromCart = (productId) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    };
    const clearCart = () => {
        setItems([]);
    };
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const taxAmount = 0; // Essential medicines zero-rated per Nepal tax laws
    const grandTotal = subtotal + taxAmount;
    const placeOrder = async (paymentMethod, notes) => {
        const orderNum = `JPD-ORD-2026-${(orders.length + 1049).toString()}`;
        const invoiceNum = `JPD-INV-${(invoices.length + 8183).toString()}-081`;
        const placedDate = new Date().toISOString();
        const orderItems = items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            genericName: item.product.genericName,
            batchNumber: item.selectedBatch?.batchNumber || 'FEFO-AUTO',
            expiryDate: item.selectedBatch?.expiryDate || '2027-12',
            packSize: item.product.packSize,
            quantityOrdered: item.quantity,
            quantityFulfilled: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
        }));
        const newOrder = {
            id: `ORD-${Date.now().toString().slice(-4)}`,
            orderNumber: orderNum,
            customerId: activeCustomer?.id || 'CUST-001',
            customerName: activeCustomer?.businessName || 'ABC Medical Hall & Polyclinic',
            customerPhone: activeCustomer?.phone || '+977 9844012345',
            deliveryAddress: activeCustomer
                ? `${activeCustomer.address.street}, ${activeCustomer.address.ward}, ${activeCustomer.address.municipality}`
                : 'Janakpurdham Main Road',
            items: orderItems,
            subtotal,
            tax: taxAmount,
            deliveryFee: 0,
            totalAmount: grandTotal,
            paymentMethod,
            paymentStatus: paymentMethod === 'Credit Account' ? 'PENDING' : 'PENDING',
            status: 'PLACED',
            placedAt: placedDate,
            estimatedDelivery: 'Next Delivery Schedule (Tomorrow Morning Route)',
            notes,
            invoiceId: `INV-${Date.now().toString().slice(-4)}`,
            statusHistory: [
                {
                    status: 'PLACED',
                    timestamp: placedDate,
                    note: `Wholesale order received for Rs. ${grandTotal.toLocaleString()} via ${paymentMethod}.`,
                    updatedBy: activeCustomer?.pharmacistName || 'Authorized Pharmacy Buyer',
                },
            ],
        };
        // Deduct stock using FEFO allocation
        setProducts(prev => prev.map(prod => {
            const cartItem = items.find(ci => ci.product.id === prod.id);
            if (!cartItem)
                return prod;
            let needed = cartItem.quantity;
            const updatedBatches = sortBatchesFEFO(prod.batches).map(b => {
                if (needed <= 0)
                    return b;
                if (b.quantity >= needed) {
                    const remaining = b.quantity - needed;
                    needed = 0;
                    return { ...b, quantity: remaining };
                }
                else {
                    needed -= b.quantity;
                    return { ...b, quantity: 0 };
                }
            });
            const newTotalStock = Math.max(0, prod.totalStock - cartItem.quantity);
            return {
                ...prod,
                totalStock: newTotalStock,
                batches: updatedBatches,
            };
        }));
        // Create Invoice
        const newInvoice = {
            id: newOrder.invoiceId,
            invoiceNumber: invoiceNum,
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            customerId: activeCustomer?.id || 'CUST-001',
            customerName: activeCustomer?.businessName || 'ABC Medical Hall',
            customerPan: activeCustomer?.panVatNumber || '601928471',
            customerAddress: newOrder.deliveryAddress,
            customerDda: activeCustomer?.ddaLicenseNumber || 'DDA-MDH-RET-1092',
            date: placedDate.split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: orderItems,
            subtotal,
            taxRate: 0,
            taxAmount: 0,
            grandTotal,
            paymentStatus: 'PENDING',
            paymentMethod: paymentMethod === 'Credit Account' ? 'Credit Terms (Net 15 Days)' : paymentMethod,
        };
        setOrders(prev => [newOrder, ...prev]);
        setInvoices(prev => [newInvoice, ...prev]);
        logAuditAction('PLACE_ORDER', 'Order', newOrder.orderNumber, 'None', `Placed by ${activeCustomer?.businessName}, Total: Rs. ${grandTotal}`);
        clearCart();
        return newOrder;
    };
    const updateOrderStatus = (orderId, status, note) => {
        setOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
                const timestamp = new Date().toISOString();
                const historyEntry = {
                    status,
                    timestamp,
                    note: note || `Order status updated to ${status}.`,
                    updatedBy: 'Operations Staff',
                };
                logAuditAction('UPDATE_ORDER_STATUS', 'Order', ord.orderNumber, ord.status, status);
                return {
                    ...ord,
                    status,
                    paymentStatus: status === 'DELIVERED' && ord.paymentMethod === 'Cash on Delivery' ? 'PAID' : ord.paymentStatus,
                    statusHistory: [...ord.statusHistory, historyEntry],
                };
            }
            return ord;
        }));
    };
    const updateProductStock = (productId, batchId, newQty) => {
        setProducts(prev => prev.map(prod => {
            if (prod.id === productId) {
                const updatedBatches = prod.batches.map(b => {
                    if (b.id === batchId) {
                        logAuditAction('ADJUST_STOCK', 'ProductBatch', b.batchNumber, `Qty: ${b.quantity}`, `Qty: ${newQty}`);
                        return { ...b, quantity: newQty };
                    }
                    return b;
                });
                const totalStock = updatedBatches.reduce((sum, b) => sum + b.quantity, 0);
                return { ...prod, batches: updatedBatches, totalStock };
            }
            return prod;
        }));
    };
    const createProduct = (productData) => {
        const newProd = {
            id: `PROD-${Date.now().toString().slice(-4)}`,
            name: productData.name || 'New Pharmaceutical Item',
            genericName: productData.genericName || '',
            brandName: productData.brandName || '',
            manufacturer: productData.manufacturer || 'Authorized Manufacturer',
            category: productData.category || 'Medicines - General',
            dosageForm: productData.dosageForm || 'Tablet',
            strength: productData.strength || '',
            packSize: productData.packSize || 'Box of 100',
            unit: productData.unit || 'Box',
            sku: productData.sku || `MED-${Date.now().toString().slice(-4)}`,
            barcode: '8901234' + Math.floor(Math.random() * 899999 + 100000),
            ddaRegReference: productData.ddaRegReference || 'DDA-REG-2026-PENDING',
            classification: productData.classification || 'PRESCRIPTION_REQUIRED',
            storageCondition: productData.storageCondition || 'Store below 25°C in a dry place',
            mrp: productData.mrp || 100,
            wholesalePrice: productData.wholesalePrice || 80,
            moq: productData.moq || 1,
            totalStock: productData.totalStock || 0,
            imageUrl: productData.imageUrl || '/src/assets/images/amoxicillin_pack_1790830676089.jpg',
            description: productData.description || '',
            requiresPrescription: productData.requiresPrescription ?? true,
            batches: productData.batches || [],
        };
        setProducts(prev => [newProd, ...prev]);
        logAuditAction('CREATE_PRODUCT', 'Product', newProd.id, 'None', newProd.name);
    };
    const createReturnRequest = (data) => {
        const newReturn = {
            id: `RET-${Date.now().toString().slice(-4)}`,
            ...data,
            status: 'PENDING_REVIEW',
            requestedAt: new Date().toISOString(),
        };
        setReturns(prev => [newReturn, ...prev]);
        logAuditAction('RETURN_REQUEST', 'ReturnRequest', newReturn.id, 'None', `${data.productName} (${data.reason})`);
    };
    const updateReturnStatus = (returnId, status, note) => {
        setReturns(prev => prev.map(r => {
            if (r.id === returnId) {
                logAuditAction('UPDATE_RETURN_STATUS', 'ReturnRequest', returnId, r.status, status);
                return { ...r, status, resolutionNote: note || r.resolutionNote };
            }
            return r;
        }));
    };
    return (<CartContext.Provider value={{
            items,
            isCartOpen,
            setIsCartOpen,
            cartIconRef,
            cartBadgePulse,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            totalItemsCount,
            subtotal,
            taxAmount,
            grandTotal,
            products,
            orders,
            invoices,
            recalls,
            returns,
            placeOrder,
            updateOrderStatus,
            updateProductStock,
            createProduct,
            createReturnRequest,
            updateReturnStatus,
        }}>
      {children}
      <CartFlyAnimation instances={flyInstances} onComplete={handleFlyComplete}/>
    </CartContext.Provider>);
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
