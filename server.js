require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
   db = client.db('pokeresponses');
    console.log('Connected to MongoDB');
  }
  return db.collection('responses');
}

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all responses
app.get('/api/responses', async (req, res) => {
  try {
    const col = await connectDB();
    const responses = await col.find({}).toArray();
    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Submit a new response
app.post('/api/responses', async (req, res) => {
  try {
    const col = await connectDB();
    const response = req.body;
    const result = await col.insertOne(response);
    res.status(201).json({
      message: 'Response submitted successfully!',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get response statistics (for dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    const col = await connectDB();
    const allResponses = await col.find({}).toArray();

    const stats = {
      totalResponses: allResponses.length,
      starterStats: { fire: {}, water: {}, grass: {} },
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
            stats.typeStats[type] = (stats.typeStats[type] || 0) + 1;
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

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Get map data
app.get('/api/map-data', async (req, res) => {
  try {
    const col = await connectDB();
    const allResponses = await col.find({}).toArray();
    console.log(`✓ Found ${allResponses.length} responses in MongoDB`);

    const starterIds = {
      bulbasaur:1, charmander:4, squirtle:7,
      chikorita:152, cyndaquil:155, totodile:158,
      treecko:252, torchic:255, mudkip:258,
      turtwig:387, chimchar:390, piplup:393,
      snivy:495, tepig:498, oshawott:501,
      chespin:650, fennekin:653, froakie:656,
      rowlet:722, litten:725, popplio:728,
      grookey:810, scorbunny:813, sobble:816,
      sprigatito:906, fuecoco:909, quaxly:912
    };

    const starterTypes = {
      bulbasaur:'grass', charmander:'fire', squirtle:'water',
      chikorita:'grass', cyndaquil:'fire', totodile:'water',
      treecko:'grass', torchic:'fire', mudkip:'water',
      turtwig:'grass', chimchar:'fire', piplup:'water',
      snivy:'grass', tepig:'fire', oshawott:'water',
      chespin:'grass', fennekin:'fire', froakie:'water',
      rowlet:'grass', litten:'fire', popplio:'water',
      grookey:'grass', scorbunny:'fire', sobble:'water',
      sprigatito:'grass', fuecoco:'fire', quaxly:'water'
    };

    const countryIsoCodes = {
      'Canada': 124, 'United States': 840, 'Mexico': 484, 'Brazil': 76, 'Argentina': 32,
      'Colombia': 170, 'Peru': 604, 'Chile': 152, 'Ecuador': 218, 'Venezuela': 862,
      'Bolivia': 68, 'Paraguay': 600, 'Uruguay': 858, 'Guatemala': 320, 'Honduras': 340,
      'United Kingdom': 826, 'France': 250, 'Germany': 276, 'Spain': 724, 'Italy': 380,
      'Poland': 616, 'Netherlands': 528, 'Belgium': 56, 'Sweden': 752, 'Norway': 578,
      'Denmark': 208, 'Finland': 246, 'Austria': 40, 'Switzerland': 756, 'Portugal': 620,
      'Greece': 300, 'Czech Republic': 203, 'Ukraine': 804, 'Russia': 643, 'Bulgaria': 100,
      'Romania': 642, 'Hungary': 348, 'Slovakia': 703, 'Slovenia': 705, 'Croatia': 191,
      'Serbia': 688, 'Bosnia': 57, 'North Macedonia': 807, 'Albania': 8, 'Montenegro': 499,
      'Kosovo': 688, 'Estonia': 233, 'Latvia': 428, 'Lithuania': 440, 'Belarus': 112,
      'Moldova': 498, 'Ireland': 372, 'Japan': 392, 'China': 156, 'South Korea': 410,
      'India': 356, 'Bangladesh': 50, 'Pakistan': 586, 'Thailand': 764, 'Vietnam': 704,
      'Indonesia': 360, 'Malaysia': 458, 'Philippines': 608, 'Singapore': 702, 'Myanmar': 104,
      'Cambodia': 116, 'Laos': 418, 'Sri Lanka': 144, 'Nepal': 524, 'Bhutan': 64,
      'Mongolia': 496, 'Kazakhstan': 398, 'Uzbekistan': 860, 'Turkey': 792, 'Iraq': 368,
      'Iran': 364, 'Saudi Arabia': 682, 'UAE': 784, 'Jordan': 400, 'Lebanon': 422,
      'Syria': 760, 'Israel': 376, 'Egypt': 818, 'South Africa': 710, 'Nigeria': 566,
      'Kenya': 404, 'Morocco': 504, 'Algeria': 12, 'Tunisia': 788, 'Libya': 434,
      'Sudan': 729, 'Ethiopia': 231, 'Uganda': 800, 'Tanzania': 834, 'Mozambique': 508,
      'Zimbabwe': 716, 'Malawi': 454, 'Zambia': 894, 'DR Congo': 180, 'Angola': 24,
      'Senegal': 686, 'Ghana': 288, 'Ivory Coast': 384, 'Burkina Faso': 854, 'Mali': 466,
      'Niger': 562, 'Australia': 36, 'New Zealand': 554, 'Papua New Guinea': 598
    };

    const countryStarters = {};
    const globalStarterVotes = {};

    allResponses.forEach(response => {
      const country = response.country;
      if (!country) return;
      const isoCode = countryIsoCodes[country];
      if (!isoCode) return;
      if (!countryStarters[country]) countryStarters[country] = {};

      [response.fireStarter, response.waterStarter, response.grassStarter].forEach(starter => {
        if (starter) {
          const starterName = starter.toLowerCase();
          countryStarters[country][starterName] = (countryStarters[country][starterName] || 0) + 1;
          globalStarterVotes[starterName] = (globalStarterVotes[starterName] || 0) + 1;
        }
      });
    });

    const countryData = {};
    Object.entries(countryStarters).forEach(([country, starters]) => {
      const isoCode = countryIsoCodes[country];
      const dominantStarter = Object.entries(starters).reduce((a, b) => b[1] > a[1] ? b : a)[0];
      const totalCountryVotes = Object.values(starters).reduce((sum, v) => sum + v, 0);
      const type = starterTypes[dominantStarter] || 'fire';
      const starterId = starterIds[dominantStarter] || 4;
      const pct = Math.round((starters[dominantStarter] / totalCountryVotes) * 100);
      countryData[isoCode] = {
        type,
        name: country,
        starter: dominantStarter.charAt(0).toUpperCase() + dominantStarter.slice(1),
        id: starterId,
        votes: starters[dominantStarter],
        pct
      };
    });

    const top10 = Object.entries(globalStarterVotes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, votes]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        id: starterIds[name] || 4,
        type: starterTypes[name] || 'fire',
        votes
      }));

    res.json({ countryData, top10MapData: top10, totalVotes: allResponses.length });
  } catch (error) {
    console.error('Error calculating map data:', error);
    res.status(500).json({ error: 'Failed to calculate map data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});