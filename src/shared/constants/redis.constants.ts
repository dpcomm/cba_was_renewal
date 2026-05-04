export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT';

export const REDIS_KEYS = {
  AUTH_REFRESH_TOKEN: (userId: number): string =>
    `auth:refresh-token:${userId}`,
  AUTH_EMAIL_VERIFICATION_CODE: (email: string): string =>
    `auth:email-verification:${email}`,
  PUSH_RESERVATION_ID_SEQUENCE: 'push:reservation:id:seq',
  PUSH_RESERVATION_ZSET: 'push:reservation:zset',
  PUSH_RESERVATION_DATA: (id: number): string => `push:reservation:data:${id}`,
  PUSH_RESERVATION_MEMBER: (id: number): string => `push:reservation:${id}`,
} as const;

export const REDIS_TTL_SECONDS = {
  EMAIL_VERIFICATION_CODE: 180,
} as const;
