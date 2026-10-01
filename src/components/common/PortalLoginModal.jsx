import React, { useState } from 'react';
import { AlertCircle, LockKeyhole, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PortalLoginModal = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async event => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            setPassword('');
            onClose();
        }
        catch (requestError) {
            setError(requestError.message);
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs" onMouseDown={event => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section role="dialog" aria-modal="true" aria-labelledby="portal-login-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <button type="button" onClick={onClose} aria-label="Close sign in" className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X className="h-5 w-5" />
                </button>
                <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-cyan-400">
                        <LockKeyhole className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 id="portal-login-title" className="text-lg font-bold text-slate-900">Sign in to your portal</h2>
                        <p className="text-xs text-slate-500">Your account permissions are assigned securely.</p>
                    </div>
                </div>
                {error && <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-slate-700">Email address</label>
                        <input id="login-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
                        <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
                <p className="mt-4 text-center text-[11px] text-slate-500">Portal access is based on your account role. Contact your administrator if you need staff access.</p>
            </section>
        </div>
    );
};
