import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_DISPLAY_NAME) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_DISPLAY_NAME in the environment to provision an administrator.');
}
if (Buffer.byteLength(ADMIN_PASSWORD) < 12 || Buffer.byteLength(ADMIN_PASSWORD) > 72) {
    throw new Error('ADMIN_PASSWORD must contain between 12 and 72 bytes.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
const { error } = await supabase.from('staff_users').insert({
    id: randomUUID(),
    email: ADMIN_EMAIL.trim().toLowerCase(),
    password_hash: passwordHash,
    display_name: ADMIN_DISPLAY_NAME.trim(),
    role: 'admin',
});
if (error?.code === '23505') {
    throw new Error('A staff account already exists with that email address.');
}
if (error) throw error;
console.log(`Provisioned administrator account for ${ADMIN_EMAIL.trim()}.`);
