export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT';
export const REDIS_KEY_PREFIX = 'cba';

const namespaced = (...parts: Array<string | number>): string =>
  [REDIS_KEY_PREFIX, ...parts].join(':');

export const REDIS_KEYS = {
  AUTH_REFRESH_TOKEN: (userId: number): string =>
    namespaced('auth', 'refresh-token', userId),
  AUTH_EMAIL_VERIFICATION_CODE: (email: string): string =>
    namespaced('auth', 'email-verification', 'code', email),
  EMAIL_JOB_LOCK: (jobId: string): string =>
    namespaced('email', 'job', 'lock', jobId),
  EMAIL_JOB_DONE: (jobId: string): string =>
    namespaced('email', 'job', 'done', jobId),
  EMAIL_JOB_RETRY: (jobId: string): string =>
    namespaced('email', 'job', 'retry', jobId),
  EMAIL_JOB_STATUS: (jobId: string): string =>
    namespaced('email', 'job', 'status', jobId),
  PUSH_JOB_LOCK: (jobId: string): string =>
    namespaced('push', 'job', 'lock', jobId),
  PUSH_JOB_DONE: (jobId: string): string =>
    namespaced('push', 'job', 'done', jobId),
  PUSH_JOB_RETRY: (jobId: string): string =>
    namespaced('push', 'job', 'retry', jobId),
  PUSH_JOB_STATUS: (jobId: string): string =>
    namespaced('push', 'job', 'status', jobId),
  PUSH_RESERVATION_ID_SEQUENCE: namespaced('push', 'reservation', 'id', 'seq'),
  PUSH_RESERVATION_ZSET: namespaced('push', 'reservation', 'zset'),
  PUSH_RESERVATION_DATA: (id: number): string =>
    namespaced('push', 'reservation', 'data', id),
  PUSH_RESERVATION_MEMBER: (id: number): string =>
    namespaced('push', 'reservation', 'member', id),
} as const;

export const REDIS_TTL_SECONDS = {
  EMAIL_VERIFICATION_CODE: 180,
  EMAIL_JOB_LOCK: 60 * 10,
  EMAIL_JOB_DONE: 60 * 60 * 24,
  EMAIL_JOB_RETRY: 60 * 60 * 24,
  EMAIL_JOB_STATUS: 60 * 60 * 24,
  PUSH_JOB_LOCK: 60 * 10,
  PUSH_JOB_DONE: 60 * 60 * 24,
  PUSH_JOB_RETRY: 60 * 60 * 24,
  PUSH_JOB_STATUS: 60 * 60 * 24,
} as const;
