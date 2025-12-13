import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import admin from 'firebase-admin';
import serviceAccount from 'serviceAccountKey.json';


@Module({
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            inject: [ConfigService],
            useFactory: async () => {
                if (!admin.apps.length) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
                    });
                }

                if (admin.apps.length === 0) {
                    console.log('Firebase Admin SDK가 초기화되지 않았습니다.');
                } else {
                    console.log('Firebase Admin SDK 초기화 완료.')
                }

                return admin;
            },
        },
    ],

    exports: ['FIREBASE_ADMIN'],
        
})

export class FirebaseModule {}