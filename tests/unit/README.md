# Unit Tests

This directory contains unit tests for TalentSphere utility functions and individual modules.

## What belongs here

- Pure function tests (no database, no network)
- Component logic tests
- Service method tests with mocked dependencies

## Files

| File | Tests |
|------|-------|
| `../utils.test.mjs` | 14 utility function tests (formatDate, getInitials, validateEmail, etc.) |

> **Note**: The current unit tests (`utils.test.mjs`, `candidate-profile.test.mjs`) live in `tests/` directly for compatibility with the Node.js built-in test runner (`node --test`). Move them here as the project grows.

## Running Unit Tests

```bash
npm test
```

Expected: **29/29 pass** (15 utility function tests + 14 database integration tests)
