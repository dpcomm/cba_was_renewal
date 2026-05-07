export const getEnvFilePath = (): string =>
  ['prod', 'production'].includes(process.env.NODE_ENV || 'dev')
    ? '.env.prod'
    : '.env.dev';
