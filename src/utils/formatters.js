export function formatNPR(amount) {
    return `Rs. ${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}
export function formatDate(dateStr) {
    if (!dateStr)
        return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime()))
            return dateStr;
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }
    catch {
        return dateStr;
    }
}
export function formatDateTime(dateStr) {
    if (!dateStr)
        return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime()))
            return dateStr;
        return d.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    catch {
        return dateStr;
    }
}
export function getExpiryStatus(expiryDateStr) {
    if (!expiryDateStr) {
        return { status: 'HEALTHY', daysLeft: 999, label: 'Valid' };
    }
    // Support YYYY-MM or YYYY-MM-DD
    const parts = expiryDateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parts[2] ? parseInt(parts[2], 10) : 28;
    const expiry = new Date(year, month, day);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) {
        return { status: 'EXPIRED', daysLeft, label: 'Expired' };
    }
    else if (daysLeft <= 15) {
        return { status: 'CRITICAL', daysLeft, label: `Expires in ${daysLeft} days` };
    }
    else if (daysLeft <= 60) {
        return { status: 'WARNING', daysLeft, label: `Near expiry (${daysLeft}d)` };
    }
    else {
        return { status: 'HEALTHY', daysLeft, label: `Valid (${daysLeft}d left)` };
    }
}
/**
 * FEFO (First Expiry, First Out) helper
 * Returns batches sorted with the earliest non-expired batch first
 */
export function sortBatchesFEFO(batches) {
    return [...batches].sort((a, b) => {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
}
