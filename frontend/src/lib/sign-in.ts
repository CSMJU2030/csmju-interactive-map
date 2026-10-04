export function loginHref(next: string): string {
  return `/auth/login?next=${encodeURIComponent(next)}`;
}

let redirecting = false;
export function renewSignIn(): void {
  if (redirecting || typeof window === 'undefined') return;
  redirecting = true;
  const lastAttempt = Number(sessionStorage.getItem('csmju_sso_attempt') ?? 0);
  const next = window.location.pathname + window.location.search;
  if (Date.now() - lastAttempt < 60000) {
    window.location.assign(`/signin-again?next=${encodeURIComponent(next)}`);
    return;
  }
  sessionStorage.setItem('csmju_sso_attempt', String(Date.now()));
  window.location.assign(loginHref(next));
}
