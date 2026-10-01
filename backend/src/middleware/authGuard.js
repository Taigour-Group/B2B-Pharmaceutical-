import jwt from 'jsonwebtoken';

export const createAuthGuard = jwtSecret => (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentication is required.' });
    }

    try {
        req.auth = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
    }
};

export const allowRoles = (...roles) => (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
        return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    return next();
};
