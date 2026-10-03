export default () => {
  const url = (process.env.CORE_HUB_URL ?? 'https://csmju2030.jowave.com').replace(/\/+$/, '');
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4202),
    subsystemId: process.env.SUBSYSTEM_ID ?? 'csmju-interactive-map',
    coreHub: {
      url,
      webUrl: (process.env.CORE_HUB_WEB_URL ?? url).replace(/\/+$/, ''),
      jwksUrl: process.env.CORE_HUB_JWKS_URL ?? `${url}/api/v1/.well-known/jwks.json`,
      issuer: process.env.CORE_HUB_ISSUER ?? 'core-hub',
      audience: process.env.CORE_HUB_AUDIENCE ?? 'csmju2030',
      clockToleranceSec: Math.min(60, Math.max(0, Number(process.env.JWT_CLOCK_TOLERANCE_SEC ?? 5))),
      jwksCacheTtlMs: 600000,
      jwksMinRefreshIntervalMs: 30000,
      jwksRequestTimeoutMs: 5000,
      dataCacheTtlMs: 600000,
      dataMinRefreshIntervalMs: 30000,
      dataRequestTimeoutMs: 5000,
    },
  };
};
