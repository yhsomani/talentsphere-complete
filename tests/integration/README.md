# Integration Tests

This directory contains integration tests for TalentSphere — tests that verify multiple components working together, including database operations.

## What belongs here

- Database query tests (real Supabase connection)
- Service layer integration tests
- API route tests
- Auth flow integration tests

## Files

| File | Tests |
|------|-------|
| `../schema-audit.test.mjs` | Verifies 46 DB tables + column schemas |
| `../services-schema-query.test.mjs` | Verifies all service queries work against live DB |
| `../candidate-profile.test.mjs` | Candidate profile DB operations |

> **Note**: The current integration tests (`schema-audit.test.mjs`, etc.) live in `tests/` directly for compatibility with the Node.js built-in test runner. Move them here as the project grows.

## Running Integration Tests

```bash
# Requires .env.local with valid Supabase credentials
npm test
```

Expected: **14/14 integration tests pass** (verifying all 46 DB tables and joins)

## Prerequisites

Set up `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
