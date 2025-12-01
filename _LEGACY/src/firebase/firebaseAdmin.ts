import admin from 'firebase-admin';
import serviceAccount from 'serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}


if (admin.apps.length === 0) {
  console.log('Firebase Admin SDK가 초기화되지 않았습니다.');
} else {
  console.log('✅ Firebase Admin SDK 초기화 완료!');
}

export default admin;