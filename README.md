# Pollify – Live Polling Tool

A real-time polling application where users can create polls, share them with an audience, and see voting results update live without refreshing the page.

## Live Application

Frontend: https://polling-frontend-lptq.onrender.com

Backend API: https://polling-app-3ko1.onrender.com

## Features

- User signup and login
- JWT-based authentication
- Create polls with 2–6 options
- View and manage created polls
- Share polls using a public link
- Public users can vote through the shared link
- Live result updates without page refresh
- Real-time updates using Redis and WebSockets
- MongoDB persistence for users, polls, and vote counts
- Backend-side input validation
- Poll ownership protection
- Responsive and polished user interface

## Technology Stack

| Layer             | Technology         |
|-------------------|--------------------|
| Frontend          | React + Vite       |
| Backend           | Go + Gin           |
| Database          | MongoDB Atlas      |
| Realtime          | Redis + WebSockets |
| Authentication    | JWT                |
| Password Security | bcrypt             |
| Deployment        | Render             |
| Redis Hosting     | Upstash            |

## Project Structure

```text
polling-app/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── database.go
│   │   └── redis.go
│   │
│   ├── handlers/
│   │   ├── auth_handler.go
│   │   ├── poll_handler.go
│   │   └── realtime_handler.go
│   │
│   ├── middleware/
│   │   └── auth_middleware.go
│   │
│   ├── models/
│   │   ├── poll.go
│   │   └── user.go
│   │
│   ├── routes/
│   │   ├── auth_routes.go
│   │   └── poll_routes.go
│   │
│   ├── services/
│   │   └── redis_service.go
│   │
│   ├── main.go
│   ├── go.mod
│   └── go.sum
│
└── README.md
```

## Application Flow
```
Create Poll
     ↓
Share Poll Link
     ↓
Audience Opens Public Poll
     ↓
Audience Votes
     ↓
Go/Gin Validates Vote
     ↓
MongoDB Updates Vote Count
     ↓
Redis Publishes Poll Update
     ↓
WebSocket Sends Update
     ↓
Connected Results Pages Update Automatically
```

## Authentication
```
The application provides basic authentication using signup and login.

Passwords are securely hashed using bcrypt before being stored.

After successful login, the backend generates a JWT token. Protected routes require a valid Bearer token.

Poll creation and poll management are restricted to authenticated users.
```

## Backend Validation
```
The backend validates incoming data before it reaches the database.

Examples include:
- Required poll question
- Poll question cannot be empty
- Poll must contain between 2 and 6 options
- Empty options are rejected
- Invalid poll IDs are rejected
- Invalid vote requests are rejected
- Poll management is restricted to the authenticated poll owner

Client-side validation is also used for better user experience, but backend validation is treated as the security boundary.
```

## Real-Time Architecture
```
Redis is used as the real-time messaging layer.

When a user votes:
The Go backend validates the request.
MongoDB updates the stored vote count.
The updated poll is published to a Redis channel.
The WebSocket handler subscribes to the corresponding Redis channel.
Connected clients receive the updated poll.
React updates the displayed results without requiring a page refresh.

Each poll uses its own Redis channel:
poll:<pollId>

This allows updates to be delivered only to clients watching that poll.
```

## Database
```
MongoDB Atlas stores persistent application data.
The main collections contain:

Users:
Stores:
- User ID
- Name
- Email
- Hashed password
- Creation timestamp

Polls:
Stores:
- Poll ID
- Question
- Poll options
- Vote counts
- Creator ID
- Creation timestamp

MongoDB is responsible for persistent storage, while Redis is responsible for real-time event delivery.
```

## API Endpoints
Authentication
POST /api/auth/signup
POST /api/auth/login

Polls
POST   /api/polls
GET    /api/polls
GET    /api/polls/:id
POST   /api/polls/:id/vote
DELETE /api/polls/:id
Real-Time Updates
WebSocket /api/polls/:id/live

Environment Variables
Create a .env file inside the backend directory.
```
MONGO_URI=your_mongodb_connection_string
MONGO_DATABASE=polling_app
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```
Do not commit .env or expose database credentials, Redis credentials, or JWT secrets.

## Running the Backend Locally
```Open a terminal inside the backend directory.

Install dependencies:

go mod tidy

Run the server:

go run main.go

The backend runs on:

http://localhost:8080
```

## Running the Frontend Locally
```
Open another terminal inside the frontend directory.

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend runs on:

http://localhost:5173
```

## Deployment
```
The application is deployed using Render.

Frontend
The React frontend is deployed as a Render Static Site.

Build command:
npm run build

Publish directory:
dist

Backend
The Go/Gin backend is deployed as a Render Web Service.

The backend connects to:
- MongoDB Atlas for persistent data
- Upstash Redis for real-time messaging
```
## Key Technical Decisions
```MongoDB Atlas
MongoDB provides persistent storage for users, polls, and voting data.

Redis
Redis Pub/Sub was selected for real-time event propagation. It allows the backend to broadcast updated poll data to all connected WebSocket clients.

WebSockets
WebSockets provide a persistent connection between the results page and the backend, allowing vote updates to appear without refreshing the page.

JWT
JWT authentication provides a simple authentication mechanism for protected poll-management operations.
```

## Security Considerations
```
- Passwords are hashed using bcrypt.
- JWT authentication protects private poll-management operations.
- Poll ownership is checked by the backend.
- Input is validated server-side.
- Sensitive environment variables are kept outside the source code.
- CORS is configured for the deployed frontend.
- WebSocket origins are checked against the configured frontend URL.
- Testing the Real-Time Feature
```

## To test live updates:
```
- Log in to the application.
- Create a poll.
- Open the poll results page.
- Copy the poll's share link.
- Open the share link in another browser or incognito window.
- Vote on the public poll.
- Return to the results page.
- The vote count should update automatically without refreshing.
```

## AI Assistance
```AI tools were used during development for:

- Understanding implementation requirements
- Debugging development and deployment issues
- Reviewing code structure
- Troubleshooting MongoDB, Redis, WebSocket, and deployment errors
- Improving the user interface
- Preparing documentation
```
## All generated code was reviewed, tested, modified where necessary, and verified through local and deployed testing.

## Author
Suwetha K