# Database migrations
Apply `migrations/0001_production_schema.sql` after backing up your existing Supabase project. This is additive and uses `gq_` names. Do not apply blindly to a critical production database; review privileges and policies in your project first. `seed.sql` intentionally contains no records.
