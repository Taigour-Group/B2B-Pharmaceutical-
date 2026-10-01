console.error(
    'Supabase Data API cannot run SQL migrations. Run backend/migrations/001_auth.sql in your Supabase Dashboard SQL Editor.',
);
process.exitCode = 1;
