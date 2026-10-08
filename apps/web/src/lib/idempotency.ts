/**
 * Stable idempotency keys for retried submissions.
 *
 * A key is minted from the non-key payload ("parts"): as long as the payload
 * is unchanged, every retry of the same logical submission reuses the same
 * key, so the server can return the original result instead of creating a
 * duplicate (server replay guards: work-history/reference `clientRequestId`,
 * checkout `idempotencyKey`). Editing the payload mints a new key, because an
 * edited form is a new submission, not a retry.
 *
 * ponytail: single-instance closure state, one per form. If key lifetimes ever
 * need to survive page reloads, persist them per form draft.
 */
export type StableKeyer = (parts: unknown) => string;

export function createStableKeyer(): StableKeyer {
  let lastPartsJson: string | null = null;
  let key: string | null = null;
  return (parts: unknown) => {
    const json = JSON.stringify(parts);
    if (json !== lastPartsJson) {
      lastPartsJson = json;
      key = crypto.randomUUID();
    }
    return key!;
  };
}
