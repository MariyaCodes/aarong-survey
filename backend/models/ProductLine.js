import { getDb } from '../config/db.js';
import admin from 'firebase-admin';

const db = () => getDb();

const ProductLine = {
  async create(data) {
    const docRef = await db().collection('productLines').add({
      ...data,
      isActive: data.isActive !== false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id) {
    const doc = await db().collection('productLines').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async findByLineId(lineId) {
    const query = await db().collection('productLines').where('lineId', '==', lineId).get();
    return query.empty ? null : { id: query.docs[0].id, ...query.docs[0].data() };
  },

  async findAll() {
    const query = await db().collection('productLines').get();
    return query.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((line) => line.isActive !== false);
  },

  async countActive() {
    const query = await db().collection('productLines').get();
    return query.docs.filter((doc) => doc.data().isActive !== false).length;
  },

  async updateById(id, updates) {
    await db().collection('productLines').doc(id).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(id);
  },

  async deleteById(id) {
    await db().collection('productLines').doc(id).delete();
  },
};

export default ProductLine;
