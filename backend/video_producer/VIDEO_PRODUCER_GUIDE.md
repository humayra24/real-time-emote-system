# Video Producer - Real-time Video Streaming Service

The Video Producer is a service that streams video content in real-time through Kafka, enabling efficient video distribution in a microservices architecture.

## System Architecture

The Video Producer is part of a streaming system that includes:
- Video Producer: Streams video chunks
- Kafka: Message broker for video data
- Server A: Consumes and broadcasts video to clients

### Data Flow
1. Video file → Chunked into pieces
2. Chunks → Kafka topic (`video-stream`)
3. Server A → Consumes and broadcasts to clients

## Features

### 1. Video Processing
- Chunks video files into 50KB pieces
- Converts chunks to base64 for transmission
- Maintains chunk order with index tracking
- Automatic topic creation if not exists

### 2. Kafka Integration
- Producer for `video-stream` topic
- Automatic reconnection and retry logic
- Configurable broker settings
- Graceful shutdown handling

### 3. Error Handling
- Automatic retry on failures
- Chunk size management
- Connection recovery
- Graceful shutdown

## Prerequisites

- Node.js (v18 or higher)
- Kafka server
- Docker (For containerized deployment)
- Video file to stream

## Installation

1. Navigate to video_producer directory:
```bash
cd backend/video_producer
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables

| Variable     | Description          | Default               |
|-----------   |--------------------- | ------------------ 
| KAFKA_BROKER | Kafka broker address | kafka:9092            |
| VIDEO_PATH   | Path to video file   | /app/videos/video.mp4 |


## Running the Producer

### Option 1: Local Development
```bash
npm start
```

### Option 2: Docker Deployment
```bash
# Build the image
docker build -t video_producer .


## Video Processing Details

### Chunking Process
1. **File Reading**:
   - Reads video file in 50KB chunks
   - Uses Node.js streams for efficient memory usage
   - Maintains chunk order with index

2. **Data Preparation**:
   - Converts chunks to base64
   - Adds metadata (type, index)
   - Prepares for Kafka transmission

3. **Streaming**:
   - Sends chunks to Kafka
   - Maintains 50ms delay between chunks
   - Handles errors and retries

### Kafka Topic Configuration
```javascript
{
  topic: 'video-stream',
  numPartitions: 1,
  replicationFactor: 1
}
```

## Error Handling

### Common Scenarios
1. **Message Too Large**:
   - Automatically retries with smaller chunks
   - Logs error for monitoring

2. **Connection Issues**:
   - Implements retry logic
   - 5-second delay between retries
   - Automatic reconnection

3. **File Access**:
   - Validates video file existence
   - Provides clear error messages
   - Graceful failure handling


### Stopping and Removing Containers

1. **Find the Container ID**:
```bash
docker ps | grep video_producer
```

2. **Stop the Container**:
```bash
docker stop <container_id>
```

3. **Remove the Container**:
```bash
docker rm <container_id>
```

4. **Remove the Docker Image**:
```bash
docker rmi video_producer
```

## Troubleshooting

### Common Issues

1. **Video File Not Found**
   - Verify VIDEO_PATH environment variable
   - Check file permissions
   - Ensure file exists in container

2. **Kafka Connection Issues**
   - Verify Kafka broker is running
   - Check KAFKA_BROKER environment variable
   - Review Kafka logs

3. **Performance Issues**
   - Adjust CHUNK_SIZE if needed
   



