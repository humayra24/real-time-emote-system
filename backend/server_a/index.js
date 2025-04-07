const { Kafka, Partitioners } = require('kafkajs');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const port = process.env.PORT || 3003;

// Add health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Kafka configuration
const kafka = new Kafka({
  clientId: 'server_a',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({ 
  createPartitioner: Partitioners.LegacyPartitioner 
});
const consumer = kafka.consumer({ groupId: 'server_a-group' });

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'
});

// Store connected WebSocket clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  // Send a welcome message with server info
  ws.send(JSON.stringify({ 
    type: 'welcome', 
    message: 'Connected to emote data server',
    server: 'server_a'
  }));

  // Handle client disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message from client:', data);
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });
});

// Process Kafka messages
const processMessage = async ({ topic, partition, message }) => {
  try {
    if (topic === 'video-stream') {
      // Handle video chunks
      const chunk = message.value;
      const index = message.headers.index ? message.headers.index.toString() : '0';
      
      // Send video chunk to all connected WebSocket clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'video',
            chunk: chunk.toString('base64'),
            index: parseInt(index)
          }));
        }
      });
    } else {
      // Handle emote data
      const data = JSON.parse(message.value.toString());
      console.log('Received emote data:', data);

      // Send to all connected WebSocket clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'emote',
            ...data
          }));
        }
      });
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

// Start the server
const run = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    
    // Subscribe to topics
    await consumer.subscribe({ topics: ['video-stream', 'aggregated-emote-data'], fromBeginning: true });
    
    console.log('Connected to Kafka');

    // Start consuming messages
    await consumer.run({
      eachMessage: processMessage
    });

    // Start the HTTP server
    server.listen(port, () => {
      console.log(`Server A listening on port ${port}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down...');
      await consumer.disconnect();
      wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Error in run function:', error);
    // Add delay before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    await run();
  }
};

run().catch(console.error);