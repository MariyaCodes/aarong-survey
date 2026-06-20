import { getDb } from '../config/db.js';
import admin from 'firebase-admin';

const db = () => getDb();

const SurveyResponse = {
  async create(data) {
    const docRef = await db().collection('surveyResponses').add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id) {
    const doc = await db().collection('surveyResponses').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async findByEmployeeAndProduct(employeeId, productId) {
    const query = await db()
      .collection('surveyResponses')
      .where('employeeId', '==', employeeId)
      .where('productId', '==', productId)
      .get();
    return query.empty ? null : { id: query.docs[0].id, ...query.docs[0].data() };
  },

  async findByEmployeeId(employeeId) {
    const query = await db().collection('surveyResponses').where('employeeId', '==', employeeId).get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findByProductId(productId) {
    const query = await db().collection('surveyResponses').where('productId', '==', productId).get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findAll() {
    const query = await db().collection('surveyResponses').get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async updateById(id, updates) {
    await db().collection('surveyResponses').doc(id).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(id);
  },

  async updateMany(updates) {
    const snapshot = await db().collection('surveyResponses').get();
    const results = [];
    for (const doc of snapshot.docs) {
      await doc.ref.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      results.push({ id: doc.id, ...doc.data(), ...updates });
    }
    return results;
  },

  async countAll() {
    const snapshot = await db().collection('surveyResponses').get();
    return snapshot.size;
  },

  async updateMany(updates) {
    const snapshot = await db().collection('surveyResponses').get();
    const results = [];
    for (const doc of snapshot.docs) {
      await doc.ref.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      results.push({ id: doc.id, ...doc.data(), ...updates });
    }
    return results;
  },

  async deleteById(id) {
    await db().collection('surveyResponses').doc(id).delete();
  },
};

export default SurveyResponse;
