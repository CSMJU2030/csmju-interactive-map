import { validateEnvironment } from './env.validation';

describe('Production configuration', () => {
  const config = { NODE_ENV:'production', DATABASE_URL:'postgresql://localhost/test', CORE_HUB_URL:'https://core.example', CORE_HUB_WEB_URL:'https://core.example', CORE_HUB_JWKS_URL:'https://core.example/jwks', CORE_HUB_ISSUER:'core-hub', CORE_HUB_AUDIENCE:'csmju-subsystem' };
  it('requires explicitly configured Core Hub values', () => {
    expect(() => validateEnvironment({...config, CORE_HUB_AUDIENCE:undefined})).toThrow('Missing required');
  });
  it('rejects mock authentication in production', () => {
    expect(() => validateEnvironment({...config, AUTH_MODE:'mock'})).toThrow('not allowed');
  });
  it('rejects unencrypted Core and JWKS endpoints', () => {
    expect(() => validateEnvironment({...config, CORE_HUB_URL:'http://core.example'})).toThrow('HTTPS');
    expect(() => validateEnvironment({...config, CORE_HUB_JWKS_URL:'http://core.example/jwks'})).toThrow('HTTPS');
  });
});
