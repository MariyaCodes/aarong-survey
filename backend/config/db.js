import admin from 'firebase-admin';

let db;

const connectDB = async () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined in environment variables');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  db = admin.firestore();
  console.log('Firestore connected');
  return db;
};

export default connectDB;
export { db };
export const getDb = () => db;
