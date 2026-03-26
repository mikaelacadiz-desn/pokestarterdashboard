const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectDB() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
}

async function getCollection(collectionName = 'pokeresponses') {
    const client = await connectDB();
    const db = client.db('responses');
    return db.collection(collectionName);
}

module.exports = { connectDB, getCollection };
