const REQUIRED_IN_PRODUCTION = [
  "CORE_HUB_URL",
  "CORE_HUB_WEB_URL",
  "CORE_HUB_JWKS_URL",
  "CORE_HUB_ISSUER",
  "CORE_HUB_AUDIENCE",
] as const;

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const authMode = config.AUTH_MODE ?? "gateway";
  if (authMode !== "gateway" && authMode !== "mock") {
    throw new Error("AUTH_MODE must be either gateway or mock");
  }
  if (config.NODE_ENV === "production" && authMode === "mock") {
    throw new Error("AUTH_MODE=mock is not allowed in production");
  }

  if (
    config.SKIP_DATABASE_CONNECT !== "true" &&
    (typeof config.DATABASE_URL !== "string" || !config.DATABASE_URL.trim())
  ) {
    throw new Error("DATABASE_URL is required");
  }

  if (config.NODE_ENV === "production") {
    if (String(config.CORE_HUB_URL).startsWith('http://') || String(config.CORE_HUB_JWKS_URL).startsWith('http://')) {
      throw new Error('Core Hub and JWKS must use HTTPS in production');
    }
    const missing = REQUIRED_IN_PRODUCTION.filter(
      (name) => typeof config[name] !== "string" || !config[name].trim(),
    );
    if (missing.length) {
      throw new Error(
        `Missing required production environment variables: ${missing.join(", ")}`,
      );
    }
  }

  for (const name of [
    "DATABASE_URL",
    "CORE_HUB_URL",
    "CORE_HUB_WEB_URL",
    "CORE_HUB_JWKS_URL",
    "FRONTEND_URL",
  ] as const) {
    const value = config[name];
    if (typeof value !== "string" || !value) continue;
    try {
      new URL(value);
    } catch {
      throw new Error(`${name} must be a valid URL`);
    }
  }

  return config;
}
