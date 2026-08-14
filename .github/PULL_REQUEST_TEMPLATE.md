## Summary

<!-- What changed and why? -->

## Scope

- [ ] UI / copy
- [ ] Worker / API contract
- [ ] Wrangler / deployment
- [ ] Agent or documentation workflow

## Safety checks

- [ ] No secrets, `.dev.vars`, lead data, or PII-bearing logs added
- [ ] CRM calls remain server-side
- [ ] Routing behavior is preserved or documented

## Verification

- [ ] `pnpm typecheck`
- [ ] `pnpm test` (required for Worker/API changes)
- [ ] `pnpm build`
- [ ] Screenshot/accessibility review (required for visual changes)

## Notes for reviewers

<!-- Contract changes, assumptions, risks, screenshots, or follow-up work. -->
