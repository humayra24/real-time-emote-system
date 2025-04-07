# Server B - Emote Analysis Service

Server B is a real-time emote analysis service that processes and aggregates emote data from streaming platform. It acts as a middleware between raw emote data and the final presentation layer.

## System Architecture

Server B is part of a system that includes:
- Server A: Handles WebSocket connections and video streaming
- Kafka: Message broker for data flow
- Server B: Processes and analyzes emote data

### Data Flow
1. Raw emote data → Kafka topic (`raw-emote-data`)
2. Server B consumes and analyzes the data
3. Analyzed data → Kafka topic (`aggregated-emote-data`)
4. Server A consumes and broadcasts to clients

## Features

### 1. Emote Analysis
- Buffers and analyzes emote data in batches
- Identifies significant moments based on emote frequency
- Configurable analysis parameters:
  - Buffer size (interval)
  - Significance threshold
  - Allowed emotes list

### 2. REST API
- Settings management endpoints:
  - GET/PUT `/settings/interval`
  - GET/PUT `/settings/threshold`
  - GET/PUT `/settings/allowed-emotes`
  - GET `/settings` (all settings)
- Health check endpoint: `/health`

### 3. Kafka Integration
- Consumer: `raw-emote-data` topic
- Producer: `aggregated-emote-data` topic
- Automatic reconnection and retry logic

## Prerequisites

- Node.js (v18 or higher)
- Kafka server
- Docker (For containerized deployment)

## Installation

1. Navigate to server_b directory:
```bash
cd backend/server_b
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables

| Variable     | Description         | Default    |
|----------    |---------------      |----------  |
| PORT         | Server port         | 3001       |
| KAFKA_BROKER | Kafka broker address| kafka:9092 |

### Default Settings

```javascript
{
  interval: 100,      // Buffer size for analysis
  threshold: 0.5,     // Significance threshold (50%)
  allowedEmotes: [    // Emotes to track
    '❤️', '👍', '😢', '😡'
  ]
}
```

## Running the Server

### Option 1: Local Development
```bash
npm start
```

### Option 2: Docker Deployment
```bash
# Build the image
docker build -t server_b .

# Run the container
docker run -p 3001:3001 -e KAFKA_BROKER=your_kafka_broker server_b
```


### Stopping and Removing Containers

1. **Find the Container ID**:
```bash
docker ps | grep server_b
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
docker rmi server_b
```

## API Documentation

### Health Check
```bash
GET /health
Response: { status: "healthy", timestamp: "ISO_DATE" }
```

### Settings Management

1. Get All Settings:
```bash
GET /settings
Response: { interval, threshold, allowedEmotes }
```

2. Update Interval:
```bash
PUT /settings/interval
Body: { "interval": number }
Response: { "interval": number }
```

3. Update Threshold:
```bash
PUT /settings/threshold
Body: { "threshold": number }
Response: { "threshold": number }
```

4. Update Allowed Emotes:
```bash
PUT /settings/allowed-emotes
Body: { "allowedEmotes": string[] }
Response: { "allowedEmotes": string[] }
```

## Analysis Algorithm

1. **Data Collection**:
   - Collects emote data in a buffer
   - Filters by allowed emotes
   - Groups by minute-level timestamps

2. **Analysis**:
   - Calculates emote frequencies
   - Identifies significant moments (above threshold)
   - Aggregates results by timestamp

3. **Output**:
   - Sends significant moments to Kafka
   - Includes:
     - Timestamp
     - Emote type
     - Count
     - Total emotes in period

## Troubleshooting

### Common Issues

1. **Kafka Connection Issues**
   - Verify Kafka broker is running
   - Check KAFKA_BROKER environment variable
   - Review Kafka logs

2. **Analysis Not Working**
   - Check buffer settings
   - Verify emote data format
   - Review threshold values

3. **API Endpoints Not Responding**
   - Verify server is running
   - Check port availability
   - Review error logs


