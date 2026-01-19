import { AndroidConfig } from 'firebase-admin/messaging';

export const ANDROID_BASE_POLICY: AndroidConfig = {
  priority: 'high',
  notification: undefined, // ❗ data-only 강제
};

import { ApnsConfig } from 'firebase-admin/messaging';

export const APNS_BASE_POLICY: ApnsConfig = {
  headers: {
    'apns-push-type': 'alert',
    'apns-priority': '10',
  },
  payload: {
    aps: {
      'mutable-content': 1,
    },
  },
};