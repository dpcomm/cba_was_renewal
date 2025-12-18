import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import admin from "firebase-admin";
import { readFileSync } from "fs";

@Module({
  providers: [
    {
      provide: "FIREBASE_ADMIN",
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const credPath =
          configService.get<string>("GOOGLE_APPLICATION_CREDENTIALS") ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (!credPath) {
          throw new Error(
            "GOOGLE_APPLICATION_CREDENTIALS is not set. " +
              "Set it to the path of serviceAccountKey.json (e.g. /app/serviceAccountKey.json)."
          );
        }

        let serviceAccount: admin.ServiceAccount;
        try {
          const raw = readFileSync(credPath, "utf8");
          serviceAccount = JSON.parse(raw) as admin.ServiceAccount;
        } catch (e: any) {
          throw new Error(
            `Failed to read Firebase service account file at "${credPath}": ${e?.message || e}`
          );
        }

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log("Firebase Admin SDK 초기화 완료.");
        } else {
          console.log("Firebase Admin SDK 이미 초기화되어 있음.");
        }

        return admin;
      },
    },
  ],
  exports: ["FIREBASE_ADMIN"],
})
export class FirebaseModule {}
