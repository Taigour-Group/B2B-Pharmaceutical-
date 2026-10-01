import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_AUDIT_LOGS, INITIAL_CUSTOMERS } from '../data/seedData';

const AuthContext = createContext(undefined);

const request = async (path, options = {}, accessToken) => {
    const response = await fetch(`/api/v1${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...options.headers,
        },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(body.error || 'The request could not be completed.');
    }
    return body;
};

const toCustomer = user => {
    if (user.role !== 'pharmacy') return null;
    return {
        id: user.customerId,
        businessName: user.businessName,
        proprietorName: user.proprietorName,
        businessType: user.businessType,
        phone: user.phone,
        email: user.email,
        panVatNumber: user.panVatNumber,
        businessRegNumber: user.businessRegNumber,
        ddaLicenseNumber: user.ddaLicenseNumber,
        pharmacistName: user.pharmacistName,
        npcRegistrationNumber: user.npcRegistrationNumber,
        licenseExpiryDate: user.licenseExpiryDate,
        address: user.address,
        accountStatus: user.accountStatus === 'VERIFIED' ? 'APPROVED' : user.accountStatus,
        verificationNotes: user.verificationNotes,
        creditLimit: Number(user.creditLimit || 0),
        usedCredit: Number(user.usedCredit || 0),
        paymentTerms: user.paymentTerms,
        tier: user.tier,
        documents: [],
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
    const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
    const role = user?.role || 'public';
    const activeCustomer = toCustomer(user || {});

    useEffect(() => {
        let mounted = true;
        request('/auth/refresh-token', { method: 'POST' })
            .then(({ accessToken: token, user: sessionUser }) => {
                if (mounted) {
                    setAccessToken(token);
                    setUser(sessionUser);
                }
            })
            .catch(() => {
                if (mounted) {
                    setAccessToken(null);
                    setUser(null);
                }
            })
            .finally(() => {
                if (mounted) setIsAuthLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const login = async (email, password) => {
        const result = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setAccessToken(result.accessToken);
        setUser(result.user);
        return result.user;
    };

    const registerCustomer = async customerData => {
        return request('/auth/register-pharmacy', {
            method: 'POST',
            body: JSON.stringify(customerData),
        });
    };

    const updateSession = async () => {
        const result = await request('/auth/me', {}, accessToken);
        setUser(result.user);
        return result.user;
    };

    const logout = async () => {
        try {
            await request('/auth/logout', { method: 'POST' }, accessToken);
        }
        finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    const logAuditAction = (action, entity, entityId, oldValue, newValue) => {
        const entry = {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString(),
            userName: user?.displayName || activeCustomer?.pharmacistName || 'Authenticated User',
            role,
            action,
            entity,
            entityId,
            oldValue,
            newValue,
            ipAddress: 'Server recorded',
        };
        setAuditLogs(previous => [entry, ...previous]);
    };

    const updateCustomerStatus = (customerId, status, note) => {
        setCustomers(previous => previous.map(customer => {
            if (customer.id !== customerId) return customer;
            logAuditAction('UPDATE_CUSTOMER_STATUS', 'PharmacyCustomer', customerId, `Status: ${customer.accountStatus}`, `Status: ${status}${note ? ` (${note})` : ''}`);
            return {
                ...customer,
                accountStatus: status,
                verificationNotes: note || customer.verificationNotes,
                verifiedAt: status === 'APPROVED' ? new Date().toISOString() : customer.verifiedAt,
                verifiedBy: status === 'APPROVED' ? user?.displayName : customer.verifiedBy,
            };
        }));
    };

    const uploadCustomerDocument = (customerId, doc) => {
        setCustomers(previous => previous.map(customer => {
            if (customer.id !== customerId) return customer;
            const newDoc = {
                id: `DOC-${Date.now().toString().slice(-4)}`,
                type: doc.type,
                title: doc.title,
                fileName: doc.fileName,
                fileUrl: '#preview',
                fileSize: '1.2 MB',
                mimeType: 'application/pdf',
                uploadDate: new Date().toISOString().split('T')[0],
                expiryDate: doc.expiryDate,
                status: 'PENDING',
            };
            logAuditAction('UPLOAD_DOCUMENT', 'CustomerDocument', newDoc.id, 'None', `${doc.title} (${doc.fileName})`);
            return {
                ...customer,
                documents: [newDoc, ...customer.documents],
                accountStatus: customer.accountStatus === 'RESUBMISSION_REQUIRED' ? 'UNDER_REVIEW' : customer.accountStatus,
            };
        }));
    };

    return (
        <AuthContext.Provider value={{
            role,
            user,
            accessToken,
            isAuthLoading,
            login,
            logout,
            registerCustomer,
            updateSession,
            activeCustomer,
            customers,
            auditLogs,
            logAuditAction,
            updateCustomerStatus,
            uploadCustomerDocument,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
