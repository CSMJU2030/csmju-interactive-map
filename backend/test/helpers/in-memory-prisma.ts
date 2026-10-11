// Only the authenticated list route used by SSO tests needs local business data.
export class InMemoryPrisma {
  place = { findMany: () => Promise.resolve([]), count: () => Promise.resolve(0) };
  $transaction(items: Promise<unknown>[]) { return Promise.all(items); }
  reset(): void {}
}
