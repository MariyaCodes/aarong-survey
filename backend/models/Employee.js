import { getDb } from '../config/db.js';
import admin from 'firebase-admin';

const db = () => getDb();

const Employee = {
  async create(data) {
    const docRef = db().collection('employees').doc(data.employeeId);
    const docData = {
      ...data,
      isActive: data.isActive !== false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(docData);
    return { id: docRef.id, ...docData };
  },

  async findById(employeeId) {
    const doc = await db().collection('employees').doc(employeeId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async findByEmployeeId(employeeId) {
    const query = await db().collection('employees').where('employeeId', '==', employeeId).get();
    return query.empty ? null : { id: query.docs[0].id, ...query.docs[0].data() };
  },

  async findAll() {
    const query = await db().collection('employees').get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findActive() {
    const query = await db().collection('employees').where('isActive', '==', true).get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async countActive() {
    const query = await db().collection('employees').where('isActive', '==', true).get();
    return query.size;
  },

  async updateById(employeeId, updates) {
    const docRef = db().collection('employees').doc(employeeId);
    await docRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.findById(employeeId);
  },

  async deleteById(employeeId) {
    await db().collection('employees').doc(employeeId).delete();
  },
};

export default Employee;
