# Branch Policy

## Scope
This document defines which branches are active and what kinds of changes are allowed.

## Active Development
- `main` is the active development line (`v2+`).
- New features, API design changes, and experiments should target `main`.

## Legacy Line
- `v1.2.x` is a legacy maintenance line.
- The `v1.2.0` tag is the stable legacy reference.
- Branches based on that line (for example `legacy-formulas-v1.2.0-work`) should only accept critical fixes.
- No planned feature expansion on `1.2`.

## Release Guidance
- Use tags for immutable releases (`v1.2.0`, `v2.x.x`, ...).
- Keep README/CHANGELOG messaging aligned with branch intent.
- If a legacy fix is required, keep the patch minimal and evaluate whether it should also be ported to `main`.

## PR Targeting
- Feature PRs: target `main`.
- Critical legacy fixes: target the `1.2` legacy line and document why the fix is needed.
