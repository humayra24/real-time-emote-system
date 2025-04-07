# Server A - Real-time Data Processing Server

Server A is a Node.js application that acts as a real-time data processing server, handling video streams and emote data through WebSocket connections and Kafka messaging.

## Features

- Real-time WebSocket communication
- Kafka message processing
- Health check endpoint
- Containerized deployment support
- Video stream processing
- Emote data aggregation

## Prerequisites

- Node.js (v18 or higher)
- Kafka server
- Docker (for containerized deployment)

## Installation

1. Clone the repository and navigate to the server_a directory:
```bash
cd backend/server_a
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables

| Variable     | Description           | Default    |
|------------- | ----------------------|------------|
| PORT         | Server port number    | 3003       |
| KAFKA_BROKER | Kafka broker address  | kafka:9092 |


## Running the Server

### Option 1: Local Development

```bash
npm start
```

### Option 2: Docker Deployment

1. Build the Docker image (make sure you're in the server_a directory):
```bash
# The dot (.) at the end specifies the build context (current directory)
docker build -t server_a .
```

2. Verify the container is running:
```bash
docker ps
```

4. Check container logs:
```bash
docker logs <container_id>
```

## API Endpoints

### Health Check
- **Endpoint**: `/health`
- **Method**: GET
- **Response**: 
```json
{
    "status": "healthy"
}
```

### WebSocket
- **Endpoint**: `/ws`
- **Protocol**: WebSocket
- **Connection URL**: `ws://localhost:3003/ws`

## Kafka Topics

The server consumes the following Kafka topics:
- `video-stream`: For video data processing
- `aggregated-emote-data`: For emote data processing

## Architecture

### Components
1. **Express Server**: Handles HTTP requests and WebSocket connections
2. **WebSocket Server**: Manages real-time client connections
3. **Kafka Consumer**: Processes messages from Kafka topics
4. **Health Check**: Monitors server availability

### Data Flow
1. Kafka messages are received and processed
2. Processed data is sent to connected WebSocket clients
3. Clients receive real-time updates through WebSocket connections

## Testing

### Health Check
```bash
curl http://localhost:3003/health
```

### WebSocket Connection
Use any WebSocket client to connect to:
```
ws://localhost:3003/ws
```

## Troubleshooting

### Common Issues

1. **Server Fails to Start**
   - Check Kafka broker connection
   - Verify port availability
   - Ensure environment variables are set

2. **WebSocket Connection Issues**
   - Verify server is running
   - Check network connectivity
   - Ensure proper WebSocket client implementation

3. **Container Issues**
   - Check Docker is running
   - Review container logs
   - Verify port mapping





