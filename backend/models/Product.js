import { getDb } from '../config/db.js';
import admin from 'firebase-admin';

const db = () => getDb();

const Product = {
  async create(data) {
    const docRef = await db().collection('products').add({
      ...data,
      isActive: data.isActive !== false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id) {
    const doc = await db().collection('products').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async findByProductId(productId) {
    const query = await db().collection('products').where('productId', '==', productId).get();
    return query.empty ? null : { id: query.docs[0].id, ...query.docs[0].data() };
  },

  async findByProductLineId(productLineId) {
    const query = await db().collection('products').where('productLineId', '==', productLineId).get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findAll() {
    const query = await db().collection('products').get();
    return query.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => product.isActive !== false);
  },

  async countActive() {
    const query = await db().collection('products').get();
    return query.docs.filter((doc) => doc.data().isActive !== false).length;
  },

  async updateById(id, updates) {
    await db().collection('products').doc(id).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(id);
  },

  async deleteById(id) {
    await db().collection('products').doc(id).delete();
  },
};

export default Product;
