const { Kafka, Partitioners } = require('kafkajs');
const fs = require('fs');
const path = require('path');

const kafka = new Kafka({
  clientId: 'video_producer',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({ 
  createPartitioner: Partitioners.LegacyPartitioner 
});
const admin = kafka.admin();

const CHUNK_SIZE = 50000; // 50KB chunks

const createTopicIfNeeded = async () => {
  try {
    const topics = await admin.listTopics();
    if (!topics.includes('video-stream')) {
      await admin.createTopics({
        topics: [{
          topic: 'video-stream',
          numPartitions: 1,
          replicationFactor: 1
        }]
      });
      console.log('Created video-stream topic');
    }
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

const streamVideo = async () => {
  const videoPath = process.env.VIDEO_PATH || '/app/videos/video.mp4';
  console.log('Reading video from:', videoPath);

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found at ${videoPath}`);
  }

  const videoStream = fs.createReadStream(videoPath, { highWaterMark: CHUNK_SIZE });
  let chunkIndex = 0;

  for await (const chunk of videoStream) {
    try {
      // Convert chunk to base64
      const base64Chunk = chunk.toString('base64');
      
      await producer.send({
        topic: 'video-stream',
        messages: [{
          value: JSON.stringify({
            type: 'video',
            chunk: base64Chunk,
            index: chunkIndex
          })
        }]
      });
      
      chunkIndex++;
      // Add a small delay between chunks 
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('Error sending chunk:', error);
      if (error.type === 'MESSAGE_TOO_LARGE') {
        console.error('Chunk size was too large, trying to reduce size');
        continue;
      }
      throw error;
    }
  }
  console.log('Video streaming completed, restarting...');
  // Reset chunk index and start over
  return streamVideo();
};

const run = async () => {
  try {
    await admin.connect();
    await createTopicIfNeeded();
    await producer.connect();
    console.log('Connected to Kafka');
    await streamVideo();
  } catch (error) {
    console.error('Error in video producer:', error);
    // Add delay before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    await run();
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  try {
    console.log('Shutting down...');
    await producer.disconnect();
    await admin.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

run().catch(console.error);