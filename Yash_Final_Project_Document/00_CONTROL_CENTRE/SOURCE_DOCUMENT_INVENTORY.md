# Source Document Inventory (V9 control document)

Doc ID: CC-SRC · Version 1.0 · Status: Draft · Added additively; no existing file was changed to create it.

The controlling inventory is already maintained as the machine-readable [KNOWLEDGE_PRESERVATION_MANIFEST.csv](KNOWLEDGE_PRESERVATION_MANIFEST.csv) with narrative in [KNOWLEDGE_PRESERVATION_MANIFEST.md](KNOWLEDGE_PRESERVATION_MANIFEST.md) and a protected-tree baseline in [PROTECTED_DOCUMENT_TREE_BASELINE.csv](PROTECTED_DOCUMENT_TREE_BASELINE.csv). This file does not duplicate rows; it records the V9 checks and where each V9 inventory field lives.

## Verified observations (2026-10-25, this session, read-only commands)
- Repository root: `C:/Users/yashs/OneDrive/Desktop/talentsphere-complete`.
- `SSOT.md` files found: exactly one (`./SSOT.md`, repo root, excluding `node_modules`). `git status --porcelain -- SSOT.md` returned nothing (no uncommitted change).
- `git status --porcelain` outside `Yash_Final_Project_Document/` returned nothing: no uncommitted change to application source, config or external docs.
- Files in `Yash_Final_Project_Document/`: 158, all tracked by git at the time of the check.
- Markdown files outside the doc root (excluding node_modules, graphify-out, .omc): 187 found by `find`; the manifest records 204 source records (190 text docs, 1 JSON evidence file, 13 non-text utility artifacts).

## Field mapping (V9 §2.4 / §7 → where recorded)
| V9 field | Location |
|---|---|
| Path, type, size/identity | manifest CSV; baseline CSV (bytes only; a SHA-256 exists only where the manifest states one, e.g. SSOT.md) |
| Inspection / extraction status | manifest CSV status vocabulary; snapshot per manifest md (2026-10-25): 174 partially processed, 1 fully processed, 1 retained historical, 28 out of scope |
| Target references | manifest CSV destination columns; crosswalks in 06, 13, 28 |
| Disposition | manifest CSV; none eligible for cleanup |

## Not verified here
Per-source content extraction for the 174 partially processed records; hash re-computation; unreadable/uninspected lists beyond what the manifest states.
