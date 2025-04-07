# Real-time Video Streaming with Emote Analysis

COMP.CS.510 Advanced Web Development: Back End - Group Project

## Group Information
- Team Name: HT Squad
- Repository: https://course-gitlab.tuni.fi/compcs510-spring2025/ht_squad

### Team Members
- Humayra Noureen - 153061637 - humayra.noureen@tuni.fi
- Tripti Ann Bara - K428980 - tripti.bara@tuni.fi

## Project Overview

A real-time video streaming platform with emote analysis capabilities, built using modern web technologies and microservices architecture. The system allows users to stream video content while analyzing and displaying real-time emote data.

### Core Features
- Real-time video streaming
- Emote data analysis and visualization
- WebSocket-based live updates
- Configurable settings for emote analysis
- Microservices architecture with Kafka message broker

## Project Timeline and Task Distribution

### Milestone 1: Setup and Basic Implementation
- Basic project structure
- Docker configuration
- Initial service setup

### Milestone 2: Core Features
- Video streaming implementation
- WebSocket setup
- Kafka integration

### Milestone 3: Enhancement and Testing
- UI improvements
- Error handling
- Performance optimization

### Architecture Overview
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │◄────┤  Server A   │◄────┤   Kafka     │
└─────────────┘     └─────────────┘     └─────────────┘
                           ▲                   ▲
                           │                   │
                    ┌─────────────┐     ┌─────────────┐
                    │  Server B   │     │  Video      │
                    │             │     │  Producer   │
                    └─────────────┘     └─────────────┘
```
### Component Roles

1. **Frontend (React)**
   - User interface and video player
   - Real-time emote visualization
   - Settings management interface
   - WebSocket client implementation

2. **Backend Services**
   - **Server A**: WebSocket handling and video streaming
   - **Server B**: REST API and settings management
   - **Video Producer**: Video file processing and streaming
   - **Emotegen**: Emote data generation and analysis

3. **Infrastructure**
   - **Nginx**: Reverse proxy and static file serving
   - **Kafka**: Message broker for inter-service communication
   - **Docker**: Service containerization and orchestration

### Data Flow
1. Video Streaming: `Video File -> Video Producer -> Kafka -> Server A -> Frontend`
2. Emote Processing: `Emotegen -> Kafka -> Server B -> Frontend`
3. Settings Management: `Frontend -> Server B -> Kafka -> Services`

## Technologies Used

### Frontend Stack
- React.js (UI Framework)
- WebSocket (Real-time Communication)
- MediaSource API (Video Streaming)
- CSS (Styling)

### Backend Stack
- Node.js (Runtime)
- Express.js (API Framework)
- Kafka.js (Kafka Client)
- WebSocket (Real-time Server)

### Infrastructure
- Docker & Docker Compose
- Apache Kafka
- Nginx
- Node.js

## Development and Deployment

### Prerequisites
- Docker and Docker Compose
- Node.js (v18 or later)
- Git

### Local Development Setup
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Create videos directory and add video file:
   ```bash
   mkdir videos
   cp your_video.mp4 videos/video.mp4
   ```

3. Start the services:
   ```bash
   docker-compose up --build
   ```

4. Access the application at http://localhost:3002

### Directory Structure
```
├── frontend/          # React frontend application
├── backend/
│   ├── server_a/     # WebSocket server
│   ├── server_b/     # REST API server
│   ├── emotegen/     # Emote generation service
│   └── video_producer/ # Video streaming service
├── videos/           # Video files directory
└── docker-compose.yml
```

## Implementation Challenges and Solutions

### 1. Service Communication
**Challenge**: Reliable communication between microservices

**Solution**:
- Implemented Kafka for message queuing
- Added health checks for services
- Improved error handling and retry logic
- Configured proper service discovery

### 2. Real-time Updates
**Challenge**: Maintaining WebSocket connections and real-time data flow

**Solution**:
- Implemented reconnection logic
- Added message queuing for missed updates
- Improved error handling
- Enhanced connection status monitoring

# Known Issues and Limitations

1. **Performance**
   - Large video files may cause initial loading delay
   - Memory usage with large videos needs optimization

2. **Reliability**
   - WebSocket reconnection needs improvement
   - Some edge cases in video streaming need handling

3. **Scalability**
   - Single Kafka broker limitation
   - No load balancing implementation

## Future Improvements

Right now, we are not using a database in our project. All the data—like emotes and video chunks—flows through Kafka, which handles everything in real time without needing storage. We have thought about adding a database later, like MongoDB or PostgreSQL, to save things like emote history or video metadata. MongoDB could work well because of its flexibility with unstructured data, while PostgreSQL might be better for structured tables and queries. We wll decide if and when we need it as the project grows.
On the video streaming front, we have encountered a problem. The video appears in the web browser but is stuck on “loading” and is not streaming like live video yet. Meanwhile, the emotes are working perfectly—they pop up in real-time on the front end as expected. We think the video file might not be in the right format for streaming, or maybe the way we are sending chunks through Kafka and the MediaSource API is not quite right. We plan to study this more—looking into supported video formats (like MP4 with specific codecs) and debugging the streaming setup—to figure out how to make it play smoothly.
We also want to improve the appearance of the front end. Right now, it is functional but pretty basic. We will try to improve the design—to make it more interactive and easy to use.

## Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Manual Testing Steps
1. Start all services
2. Verify WebSocket connection
3. Check video streaming
4. Test emote generation
5. Verify data flow


## Learning Outcomes

### Technical Skills
- Microservices architecture implementation
- Real-time data processing
- Video streaming technologies
- Message broker systems

### Team Collaboration
- Git workflow
- Code review process
- Task management
- Documentation practices
