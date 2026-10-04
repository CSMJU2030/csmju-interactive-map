# Shared UI template provenance

- Upstream repository: https://github.com/CSMJU2030/csmju2030-standards
- Source commit: `02ed4503d15b80103efcecf67c99a3e4621d36f7`
- Template: `templates/csmju-subsystem-web`
- UI document version: **1.3.1**
- Copied unchanged: `src/csmju/*`, `src/app/globals.css`, `public/csmju-logo.png`.
- The application continues to pin standards **1.7.0** / submodule commit `88c4ce86271df943da1ffd1fde80633dfdd16a47`. The template exists on newer main but not in tag v1.7.0. Template import is recorded separately; it is not a standards version upgrade.
- Local adapters supply real session/nav values, Core Hub return link, focus rings, 44px button targets, drawer keyboard/focus/inert behavior, and confirmation-dialog focus/inert behavior. They live outside `src/csmju/`; the upstream source and globals remain unchanged.
- Runtime entry point is root layout -> local AppShell adapter -> shared CsmjuAppShell. There is one shell instance.

## Required follow-up with the UI maintainers

The imported template has placeholder footer links (`href="#"`), a header search without an action, notifications without an action, and a user button without a menu. Its inactive sidebar text uses opacity over a gradient and still needs measured contrast. These are not fixed by passing the subsystem's UI-01 check, which excludes the shared folder. Do not claim full UI conformance until maintainers provide the supported destinations/actions and accessibility checks pass.

The local shell accessibility adapter relies on the current shared sidebar structure, state classes and Thai menu button labels. Review/retest the adapter whenever the central template changes. Drawer and deletion focus behavior should ultimately be provided by the central components.

The latest UI checklist mentions validation HTTP 422, while the selected v1.7.0 API contract explicitly requires HTTP 400. This app keeps **400 VALIDATION_ERROR**, preserves `details.field`, and maps it to Thai inline feedback. The team must resolve this document conflict before claiming every checklist item passes.
