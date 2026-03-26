const { getCollection } = require('./db');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const collection = await getCollection();

        if (req.method === 'GET') {
            const responses = await collection.find({}).toArray();
            res.status(200).json(responses);
        } else if (req.method === 'POST') {
            const result = await collection.insertOne(req.body);
            res.status(201).json({
                message: 'Response submitted successfully!',
                id: result.insertedId
            });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}
