import { getDb } from '../config/db.js';
const db = () => getDb();

const Host = {
  async create(data) {
    const docRef = await db().collection('hosts').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id) {
    const doc = await db().collection('hosts').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async findByUsername(username) {
    const query = await db().collection('hosts').where('username', '==', username).get();
    return query.empty ? null : { id: query.docs[0].id, ...query.docs[0].data() };
  },

  async findAll() {
    const query = await db().collection('hosts').get();
    return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async updateById(id, updates) {
    const docRef = db().collection('hosts').doc(id);
    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });
    return this.findById(id);
  },

  async deleteById(id) {
    await db().collection('hosts').doc(id).delete();
  },
};

export default Host;

