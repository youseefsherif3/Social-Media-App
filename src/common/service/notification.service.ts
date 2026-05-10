//* Importing necessary modules and types
import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

//* NotificationService class to handle sending notifications using Firebase Cloud Messaging (FCM)
class NotificationService {
  private readonly client: admin.app.App;

  //* Initializing the Firebase Admin SDK with the service account credentials to authenticate and authorize the application
  constructor() {
    const serviceAccount = JSON.parse(
      readFileSync(
        resolve(
          __dirname,
          "../../config/social-media-app-5979c-firebase-adminsdk-fbsvc-6d74d62835.json",
        ),
      ) as unknown as string,
    );

    this.client = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  //* The method to send a notification using FCM
  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    const message = { token, data };

    return await this.client.messaging().send(message);
  }

  //* The method to send notifications to multiple tokens using FCM
  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: { title: string; body: string };
  }) {
    await Promise.allSettled(
      tokens.map((token) => {
        return this.sendNotification({ token, data });
      }),
    );
  }
}

//* Exporting an instance of the NotificationService class to be used in other parts of the application
export default new NotificationService();
