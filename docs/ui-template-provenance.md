# Shared UI template provenance

- Upstream repository: https://github.com/CSMJU2030/csmju2030-standards
- Source commit: `00fedda3855e7bd4c6ab419c48333bfcd0bf7e6c`
- Template: `templates/csmju-subsystem-web`
- UI document version: **1.3.2**
- Shared components match the v1.7.4 template, except the existing `min-w-0` map overflow fix in `CsmjuAppShell`. `src/app/globals.css` and `public/csmju-logo.png` are unchanged.
- The application now pins standards **1.7.4** / submodule commit `00fedda3855e7bd4c6ab419c48333bfcd0bf7e6c`. The template is included in this tag. Next.js and eslint-config-next are pinned to **16.3.6**.
- Local adapters supply real session/nav values, Core Hub URL from the server layout, focus rings, 44px button targets, drawer keyboard/focus/inert behavior, and confirmation-dialog focus/inert behavior. They live outside `src/csmju/`; the portal link is supplied by the v1.7.4 shared shell; the existing map overflow fix is retained.
- Runtime entry point is root layout -> local AppShell adapter -> shared CsmjuAppShell. There is one shell instance.

## Required follow-up with the UI maintainers

The imported template has placeholder footer links (`href="#"`), a header search without an action, notifications without an action, and a user button without a menu. Its inactive sidebar text uses opacity over a gradient and still needs measured contrast. These are not fixed by passing the subsystem's UI-01 check, which excludes the shared folder. Do not claim full UI conformance until maintainers provide the supported destinations/actions and accessibility checks pass.

The local shell accessibility adapter relies on the current shared sidebar structure, state classes and Thai menu button labels. Review/retest the adapter whenever the central template changes. Drawer and deletion focus behavior should ultimately be provided by the central components.

The latest UI checklist mentions validation HTTP 422, while the selected v1.7.4 API contract explicitly requires HTTP 400. This app keeps **400 VALIDATION_ERROR**, preserves `details.field`, and maps it to Thai inline feedback. The team must resolve this document conflict before claiming every checklist item passes.
