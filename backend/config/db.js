import { MongoClient } from 'mongodb';

let mongoClient;
let mongoDb;

const createDocSnapshot = (collectionName, doc) => ({
  id: String(doc?._id || ''),
  exists: !!doc,
  data: () => {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest;
  },
  ref: {
    async update(updates) {
      await mongoDb.collection(collectionName).updateOne(
        { _id: doc._id },
        { $set: updates }
      );
    },
    async delete() {
      await mongoDb.collection(collectionName).deleteOne({ _id: doc._id });
    },
  },
});

const createQuerySnapshot = (collectionName, docs) => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map((doc) => createDocSnapshot(collectionName, doc)),
});

const createCollection = (name) => {
  const col = mongoDb.collection(name);

  const makeQuery = (filters = {}) => ({
    where(field, op, value) {
      if (op !== '==') {
        throw new Error(`Unsupported query operator: ${op}`);
      }

      return makeQuery({
        ...filters,
        [field]: value,
      });
    },

    async get() {
      const docs = await col.find(filters).toArray();
      return createQuerySnapshot(name, docs);
    },
  });

  return {
    doc(id) {
      return {
        id,

        async set(data) {
          await col.updateOne(
            { _id: id },
            { $set: { ...data } },
            { upsert: true }
          );
        },

        async get() {
          const doc = await col.findOne({ _id: id });
          return createDocSnapshot(name, doc);
        },

        async update(updates) {
          await col.updateOne(
            { _id: id },
            { $set: { ...updates } }
          );
        },

        async delete() {
          await col.deleteOne({ _id: id });
        },
      };
    },

    async add(data) {
      const result = await col.insertOne(data);
      return {
        id: String(result.insertedId),
      };
    },

    where(field, op, value) {
      if (op !== '==') {
        throw new Error(`Unsupported query operator: ${op}`);
      }

      return makeQuery({
        [field]: value,
      });
    },

    async get() {
      const docs = await col.find({}).toArray();
      return createQuerySnapshot(name, docs);
    },
  };
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();

  mongoDb = mongoClient.db('aarong-survey');

  console.log('MongoDB connected');
};

export const getDb = () => {
  if (!mongoDb) {
    throw new Error('Database not connected. Call connectDB first.');
  }

  return {
    collection: createCollection,
  };
};

export default connectDB;
