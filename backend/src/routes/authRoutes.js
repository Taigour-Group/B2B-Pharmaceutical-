import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { createAuthGuard } from '../middleware/authGuard.js';

const CUSTOMER_COLUMNS = 'id,email,password_hash,pharmacist_name,business_name,proprietor_name,business_type,phone,pan_vat_number,business_reg_number,dda_license_number,npc_registration_number,license_expiry_date,account_status,verification_notes,credit_limit,used_credit,payment_terms,tier,address_province,address_district,address_municipality,address_ward,address_street';
const STAFF_COLUMNS = 'id,email,password_hash,role,display_name,is_active';

const toAuthUser = (row, userType) => userType === 'customer'
    ? { ...row, role: 'pharmacy', display_name: row.pharmacist_name }
    : {
        ...row,
        business_name: null,
        proprietor_name: null,
        business_type: null,
        phone: null,
        pan_vat_number: null,
        business_reg_number: null,
        dda_license_number: null,
        npc_registration_number: null,
        license_expiry_date: null,
        account_status: null,
        verification_notes: null,
        credit_limit: 0,
        used_credit: 0,
        payment_terms: null,
        tier: null,
        address_province: null,
        address_district: null,
        address_municipality: null,
        address_ward: null,
        address_street: null,
    };

const getUserByEmail = async email => {
    const normalizedEmail = email.trim().toLowerCase();
    const [customerResult, staffResult] = await Promise.all([
        supabase.from('customers').select(CUSTOMER_COLUMNS).eq('email', normalizedEmail).maybeSingle(),
        supabase.from('staff_users').select(STAFF_COLUMNS).eq('email', normalizedEmail).eq('is_active', true).maybeSingle(),
    ]);
    if (customerResult.error) throw customerResult.error;
    if (staffResult.error) throw staffResult.error;
    if (customerResult.data) return toAuthUser(customerResult.data, 'customer');
    return staffResult.data ? toAuthUser(staffResult.data, 'staff') : null;
};

const getUserByIdentity = async (userType, id) => {
    const result = userType === 'customer'
        ? await supabase.from('customers').select(CUSTOMER_COLUMNS).eq('id', id).maybeSingle()
        : await supabase.from('staff_users').select(STAFF_COLUMNS).eq('id', id).eq('is_active', true).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return null;
    return toAuthUser(result.data, userType);
};

const toPublicUser = row => ({
    id: row.id,
    role: row.role,
    email: row.email,
    displayName: row.display_name,
    customerId: row.role === 'pharmacy' ? row.id : null,
    businessName: row.business_name,
    proprietorName: row.proprietor_name,
    businessType: row.business_type,
    phone: row.phone,
    panVatNumber: row.pan_vat_number,
    businessRegNumber: row.business_reg_number,
    ddaLicenseNumber: row.dda_license_number,
    pharmacistName: row.role === 'pharmacy' ? row.display_name : null,
    npcRegistrationNumber: row.npc_registration_number,
    licenseExpiryDate: row.license_expiry_date,
    accountStatus: row.account_status,
    verificationNotes: row.verification_notes,
    creditLimit: row.credit_limit,
    usedCredit: row.used_credit,
    paymentTerms: row.payment_terms,
    tier: row.tier,
    address: row.role === 'pharmacy' ? {
        province: row.address_province,
        district: row.address_district,
        municipality: row.address_municipality,
        ward: row.address_ward,
        street: row.address_street,
    } : null,
});

const tokenHash = token => createHash('sha256').update(token).digest('hex');

const createAccessToken = (user, secret, expiresIn) => jwt.sign({
    role: user.role,
    userType: user.role === 'pharmacy' ? 'customer' : 'staff',
}, secret, {
    subject: user.id,
    expiresIn,
    algorithm: 'HS256',
});

const setRefreshCookie = (res, token, isProduction, maxAge) => {
    res.cookie('jpd_refresh_token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge,
    });
};

const clearRefreshCookie = res => {
    res.clearCookie('jpd_refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth',
    });
};

const requiredString = (value, maxLength = 255) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
const emailIsValid = value => requiredString(value, 255) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validateRegistration = body => {
    const required = [
        ['businessName', 255], ['proprietorName', 255], ['businessType', 100],
        ['phone', 30], ['email', 255], ['password', 128], ['panVatNumber', 50],
        ['businessRegNumber', 100], ['ddaLicenseNumber', 100], ['pharmacistName', 255],
        ['npcRegistrationNumber', 100], ['licenseExpiryDate', 10],
    ];
    for (const [field, maxLength] of required) {
        if (!requiredString(body[field], maxLength)) return `${field} is required.`;
    }
    if (!emailIsValid(body.email)) return 'Enter a valid email address.';
    if (Buffer.byteLength(body.password) < 12 || Buffer.byteLength(body.password) > 72) {
        return 'Password must contain between 12 and 72 bytes.';
    }
    const licenseExpiry = new Date(`${body.licenseExpiryDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.licenseExpiryDate)
        || Number.isNaN(licenseExpiry.getTime())
        || licenseExpiry.toISOString().slice(0, 10) !== body.licenseExpiryDate) {
        return 'Enter a valid pharmacy license expiry date.';
    }
    if (!body.address || typeof body.address !== 'object') return 'A pharmacy address is required.';
    for (const field of ['province', 'district', 'municipality', 'ward', 'street']) {
        if (!requiredString(body.address[field], 255)) return `address.${field} is required.`;
    }
    return null;
};

export const createAuthRouter = ({ jwtSecret, accessTokenExpiresIn, refreshTokenDays, isProduction }) => {
    const router = Router();
    const requireAuth = createAuthGuard(jwtSecret);
    const refreshMaxAge = refreshTokenDays * 24 * 60 * 60 * 1000;

    router.post('/register-pharmacy', async (req, res, next) => {
        const error = validateRegistration(req.body);
        if (error) return res.status(400).json({ error });

        try {
            const body = req.body;
            const passwordHash = await bcrypt.hash(body.password, 12);
            const id = randomUUID();
            const address = body.address;
            const { data, error: insertError } = await supabase.from('customers').insert({
                id,
                business_name: body.businessName.trim(),
                proprietor_name: body.proprietorName.trim(),
                business_type: body.businessType.trim(),
                phone: body.phone.trim(),
                email: body.email.trim().toLowerCase(),
                password_hash: passwordHash,
                pan_vat_number: body.panVatNumber.trim(),
                business_reg_number: body.businessRegNumber.trim(),
                dda_license_number: body.ddaLicenseNumber.trim(),
                pharmacist_name: body.pharmacistName.trim(),
                npc_registration_number: body.npcRegistrationNumber.trim(),
                license_expiry_date: body.licenseExpiryDate,
                address_province: address.province.trim(),
                address_district: address.district.trim(),
                address_municipality: address.municipality.trim(),
                address_ward: address.ward.trim(),
                address_street: address.street.trim(),
                account_status: 'UNDER_REVIEW',
            }).select('id,email,account_status').single();
            if (insertError) throw insertError;
            return res.status(201).json({
                message: 'Pharmacy application submitted for compliance review.',
                user: { id: data.id, email: data.email, accountStatus: data.account_status },
            });
        }
        catch (registrationError) {
            if (registrationError.code === '23505' || registrationError.code === 'unique_violation') {
                return res.status(409).json({ error: 'An account already uses one of these email, phone, PAN/VAT, or DDA license values.' });
            }
            return next(registrationError);
        }
    });

    router.post('/login', async (req, res, next) => {
        const { email, password } = req.body || {};
        if (!emailIsValid(email) || typeof password !== 'string' || password.length === 0 || Buffer.byteLength(password) > 72) {
            return res.status(400).json({ error: 'Enter a valid email address and password.' });
        }
        try {
            const user = await getUserByEmail(email.trim());
            if (!user || !await bcrypt.compare(password, user.password_hash)) {
                return res.status(401).json({ error: 'Email or password is incorrect.' });
            }

            const refreshToken = randomBytes(48).toString('base64url');
            const { error: tokenError } = await supabase.from('auth_refresh_tokens').insert({
                token_hash: tokenHash(refreshToken),
                user_id: user.id,
                user_type: user.role === 'pharmacy' ? 'customer' : 'staff',
                expires_at: new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000).toISOString(),
            });
            if (tokenError) throw tokenError;
            setRefreshCookie(res, refreshToken, isProduction, refreshMaxAge);
            return res.json({
                accessToken: createAccessToken(user, jwtSecret, accessTokenExpiresIn),
                user: toPublicUser(user),
            });
        }
        catch (error) {
            return next(error);
        }
    });

    router.get('/me', requireAuth, async (req, res, next) => {
        try {
            const user = await getUserByIdentity(req.auth.userType, req.auth.sub);
            if (!user) return res.status(401).json({ error: 'The account for this session is no longer active.' });
            return res.json({ user: toPublicUser(user) });
        }
        catch (error) {
            return next(error);
        }
    });

    router.post('/refresh-token', async (req, res, next) => {
        const previousToken = req.cookies?.jpd_refresh_token;
        if (!previousToken) return res.status(401).json({ error: 'A refresh session is required.' });

        try {
            const nextToken = randomBytes(48).toString('base64url');
            const { data: rotatedTokens, error: rotationError } = await supabase.rpc('rotate_auth_refresh_token', {
                p_previous_token_hash: tokenHash(previousToken),
                p_next_token_hash: tokenHash(nextToken),
                p_expires_at: new Date(Date.now() + refreshMaxAge).toISOString(),
            });
            if (rotationError) throw rotationError;
            const rotatedToken = rotatedTokens?.[0];
            if (!rotatedToken) {
                clearRefreshCookie(res);
                return res.status(401).json({ error: 'Your refresh session has expired. Please sign in again.' });
            }

            const user = await getUserByIdentity(rotatedToken.user_type, rotatedToken.user_id);
            if (!user) {
                const { error: deleteError } = await supabase.from('auth_refresh_tokens').delete().eq('token_hash', tokenHash(nextToken));
                if (deleteError) throw deleteError;
                clearRefreshCookie(res);
                return res.status(401).json({ error: 'The account for this session is no longer active.' });
            }

            setRefreshCookie(res, nextToken, isProduction, refreshMaxAge);
            return res.json({
                accessToken: createAccessToken(user, jwtSecret, accessTokenExpiresIn),
                user: toPublicUser(user),
            });
        }
        catch (error) {
            return next(error);
        }
    });

    router.post('/logout', async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.jpd_refresh_token;
            if (refreshToken) {
                const { error } = await supabase.from('auth_refresh_tokens').delete().eq('token_hash', tokenHash(refreshToken));
                if (error) throw error;
            }
            clearRefreshCookie(res);
            return res.status(204).end();
        }
        catch (error) {
            return next(error);
        }
    });

    return router;
};
