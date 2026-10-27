# TalentSphere — CODE_STYLE.md v6.0

## 1. TypeScript

- strict mode;
- explicit public types;
- avoid `any`;
- prefer discriminated unions for domain states;
- no implicit `undefined` assumptions;
- validate external input.

## 2. Naming

- `camelCase`: variables/functions.
- `PascalCase`: components/classes/types.
- `UPPER_SNAKE_CASE`: true constants only.
- IDs use stable prefixes (`F-`, `J-`, `BR-`, etc.).
- filenames use `kebab-case` or repository-standard convention consistently.

## 3. Structure

- Routes are thin.
- Use cases contain application orchestration.
- Domain contains business rules.
- Repositories hide persistence.
- Adapters hide providers.

## 4. React

- functional components;
- hooks for behavior;
- no business rules buried in JSX;
- accessible semantics;
- explicit loading/error/empty states.

## 5. Errors

Use typed/canonical error codes. Do not throw strings. Preserve request IDs through error paths.

## 6. Async

- timeout external calls;
- bounded retries;
- idempotency for retriable side effects;
- abort/cancel when relevant.

## 7. Database

- migrations are reviewed;
- constraints preferred over application-only assumptions;
- no ad hoc production schema edits;
- RLS policy tests accompany policy migrations.

## 8. Security

Never:
- commit secrets;
- log tokens/passwords;
- trust client role flags;
- expose raw DB errors;
- pass unrestricted user content to external providers.

## 9. Abstraction Rule

Do not create an abstraction before a real reuse or boundary need exists. Shared abstractions require ownership and tests.

## 10. PR Rule

A PR changing behavior must update affected:
- tests;
- analytics;
- docs;
- migration;
- feature status;
- ADR/decision record where material.
