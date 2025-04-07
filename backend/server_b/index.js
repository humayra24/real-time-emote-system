const { Kafka, Partitioners } = require('kafkajs');
const express = require('express');
const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'server_b',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});
const consumer = kafka.consumer({ groupId: 'server_b-group' });
const producer = kafka.producer({ 
  createPartitioner: Partitioners.LegacyPartitioner 
});

// Default settings
let settings = {
  interval: 100, // Buffer 100 messages before analysis
  threshold: 0.5, // 50% threshold for significance
  allowedEmotes: ['❤️', '👍', '😢', '😡']
};
let emoteBuffer = [];

// Provided analyzeEmotes function from README
const analyzeEmotes = async emoteData => {
  const significantMoments = [];
  const emoteCounts = {};

  emoteData.forEach(record => {
    const timestamp = record.timestamp.slice(0, 16); // Minute-level granularity
    const emote = record.emote;

    if (!emoteCounts[timestamp]) {
      emoteCounts[timestamp] = { total: 0 };
    }
    if (!emoteCounts[timestamp][emote]) {
      emoteCounts[timestamp][emote] = 0;
    }

    emoteCounts[timestamp][emote]++;
    emoteCounts[timestamp].total++;
  });

  for (const timestamp in emoteCounts) {
    const counts = emoteCounts[timestamp];
    const totalEmotes = counts.total;

    for (const emote in counts) {
      if (emote !== 'total' && counts[emote] / totalEmotes > settings.threshold) {
        significantMoments.push({
          timestamp,
          emote,
          count: counts[emote],
          totalEmotes
        });
      }
    }
  }

  return significantMoments;
};

const run = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    
    // Subscribe to topics
    await consumer.subscribe({ topics: ['raw-emote-data'], fromBeginning: true });
    
    console.log('Connected to Kafka');

    // Consume raw emote data
    consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          if (settings.allowedEmotes.includes(data.emote)) {
            emoteBuffer.push(data);
          }

          // When buffer reaches interval, analyze and send significant moments
          if (emoteBuffer.length >= settings.interval) {
            const significantMoments = await analyzeEmotes(emoteBuffer);
            if (significantMoments.length > 0) {
              await producer.send({
                topic: 'aggregated-emote-data',
                messages: significantMoments.map(moment => ({
                  value: JSON.stringify(moment)
                }))
              });
              console.log('Significant moments sent:', significantMoments);
            }
            emoteBuffer = []; // Clear buffer after processing
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    // REST API endpoints
    app.get('/settings', (req, res) => {
      res.json(settings);
    });

    app.get('/settings/interval', (req, res) => {
      res.json({ interval: settings.interval });
    });

    app.put('/settings/interval', (req, res) => {
      const { interval } = req.body;
      if (typeof interval === 'number' && interval > 0) {
        settings.interval = interval;
        res.json({ interval: settings.interval });
      } else {
        res.status(400).json({ error: 'Invalid interval value' });
      }
    });

    app.get('/settings/threshold', (req, res) => {
      res.json({ threshold: settings.threshold });
    });

    app.put('/settings/threshold', (req, res) => {
      const { threshold } = req.body;
      if (typeof threshold === 'number' && threshold > 0 && threshold < 1) {
        settings.threshold = threshold;
        res.json({ threshold: settings.threshold });
      } else {
        res.status(400).json({ error: 'Invalid threshold value' });
      }
    });

    app.get('/settings/allowed-emotes', (req, res) => {
      res.json({ allowedEmotes: settings.allowedEmotes });
    });

    app.put('/settings/allowed-emotes', (req, res) => {
      const { allowedEmotes } = req.body;
      if (Array.isArray(allowedEmotes)) {
        settings.allowedEmotes = allowedEmotes;
        res.json({ allowedEmotes: settings.allowedEmotes });
      } else {
        res.status(400).json({ error: 'Invalid allowed emotes value' });
      }
    });

    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`Server B running on port ${port}`));
  } catch (error) {
    console.error('Error in run function:', error);
    // Add delay before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    await run();
  }
};

run().catch(console.error);