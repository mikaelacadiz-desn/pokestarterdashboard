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
        const allResponses = await collection.find({}).toArray();

        const stats = {
            totalResponses: allResponses.length,
            starterStats: {
                fire: {},
                water: {},
                grass: {}
            },
            typeStats: {},
            generationStats: {},
            countryStats: {},
            ageRangeStats: {},
            choiceMethodStats: {},
            firstGameStats: {}
        };

        allResponses.forEach(response => {
            if (response.fireStarter) {
                stats.starterStats.fire[response.fireStarter] =
                    (stats.starterStats.fire[response.fireStarter] || 0) + 1;
            }
            if (response.waterStarter) {
                stats.starterStats.water[response.waterStarter] =
                    (stats.starterStats.water[response.waterStarter] || 0) + 1;
            }
            if (response.grassStarter) {
                stats.starterStats.grass[response.grassStarter] =
                    (stats.starterStats.grass[response.grassStarter] || 0) + 1;
            }

            if (response.favouriteTypes) {
                const types = response.favouriteTypes.split(',').map(t => t.trim());
                types.forEach(type => {
                    if (type) {
                        stats.typeStats[type] =
                            (stats.typeStats[type] || 0) + 1;
                    }
                });
            }

            if (response.favouriteGeneration) {
                stats.generationStats[response.favouriteGeneration] =
                    (stats.generationStats[response.favouriteGeneration] || 0) + 1;
            }

            if (response.country) {
                stats.countryStats[response.country] =
                    (stats.countryStats[response.country] || 0) + 1;
            }

            if (response.ageRange) {
                stats.ageRangeStats[response.ageRange] =
                    (stats.ageRangeStats[response.ageRange] || 0) + 1;
            }

            if (response.choiceMethod) {
                stats.choiceMethodStats[response.choiceMethod] =
                    (stats.choiceMethodStats[response.choiceMethod] || 0) + 1;
            }

            if (response.firstGame) {
                stats.firstGameStats[response.firstGame] =
                    (stats.firstGameStats[response.firstGame] || 0) + 1;
            }
        });

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
}
