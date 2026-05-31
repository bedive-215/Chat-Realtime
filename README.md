# Chat Realtime

Real-time messaging platform with authentication, friend management, online presence, unread counters, media uploads, and a modern React chat interface.

Chat Realtime is a full-stack chat application built to demonstrate production-style realtime communication patterns with Socket.IO, Redis-backed presence/cache, SQL-based user relationships, and MongoDB message storage.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/MySQL-8+-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-7+-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

## Tech Stack

**Frontend**

- React 19 with Vite
- React Router
- Zustand for client-side state management
- Tailwind CSS and DaisyUI
- Axios and Socket.IO Client
- Lucide React icons

**Backend**

- Node.js with Express 5
- Socket.IO for realtime events
- Sequelize and MySQL for relational data
- MongoDB and Mongoose for message storage
- Redis for online users, friend metadata, unread counts, and refresh-token storage
- JWT authentication with refresh tokens
- Multer and Cloudinary for file/image uploads
- Joi for request validation

**Infrastructure**

- Docker and Docker Compose
- MySQL 8
- Redis 7 Alpine
- Cloudflare Pages / Render-ready configuration

## Features

**Authentication**

- User registration and login
- JWT access-token authentication
- Refresh-token session support
- Auth check endpoint for persistent sessions
- Secure logout flow

**Realtime Chat**

- One-to-one realtime messaging with Socket.IO
- Personal socket rooms per user
- Chat rooms per conversation
- Realtime message delivery with optimistic client support through `tempId`
- Text and image/file message support
- Message history persisted in MongoDB

**Friends & Social Graph**

- Search users
- Send friend requests
- Accept, reject, or cancel friend requests
- Remove friends
- Friend list and enriched friend metadata

**Presence & Notifications**

- Online/offline friend status
- Redis-backed online user tracking
- Unread message count per friend
- Last-message cache per friend
- Realtime chat list updates
- Notification list, mark-as-read, and delete operations

**Profile & UI**

- Profile image upload through Cloudinary
- Responsive chat layout
- Theme settings with DaisyUI
- Search and notification views

## Project Structure

```text
Chat-Realtime/
|-- assets/                     # README preview images
|-- Backend/
|   |-- src/
|   |   |-- configs/            # Database, Redis, Socket.IO, Cloudinary config
|   |   |-- controllers/        # HTTP request handlers
|   |   |-- helpers/            # Env, token, Redis, upload helpers
|   |   |-- middlewares/        # Auth and file upload middleware
|   |   |-- models/             # Sequelize and MongoDB models
|   |   |-- routes/             # Express route definitions
|   |   |-- services/           # Business logic and socket handlers
|   |   |-- validators/         # Joi validation schemas
|   |   `-- server.js           # Backend entry point
|   |-- dockerfile
|   `-- package.json
|-- Database/
|   `-- seeds/
|       `-- data.sql            # MySQL seed data
|-- Frontend/
|   |-- public/                 # Static assets
|   |-- src/
|   |   |-- components/         # Reusable UI components
|   |   |-- constants/          # App constants
|   |   |-- lib/                # Axios, socket, utility modules
|   |   |-- pages/              # Route-level pages
|   |   |-- store/              # Zustand stores
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- dockerfile
|   `-- package.json
|-- docker-compose.yml
|-- wrangler.jsonc
`-- README.md
```

## Installation

### Prerequisites

- Node.js 20 or newer
- npm
- Docker and Docker Compose
- MySQL and Redis if running without Docker
- MongoDB connection string
- Cloudinary account for image uploads

### 1. Clone the repository

```bash
git clone https://github.com/bedive-215/Chat-Realtime.git
cd Chat-Realtime
```

### 2. Configure environment variables

Create `Backend/.env`:

```env
# Server
PORT=8080
NODE_ENV=development

# MySQL
DB_NAME=chat_realtime
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chat_realtime

# Redis
REDIS_URL=redis://localhost:6379

# JWT
ACCESS_TOKEN_SECRET=replace_with_a_strong_secret
ACCESS_TOKEN_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=replace_with_a_strong_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=30d
RESET_PASSWORD_TOKEN_SECRET=replace_with_a_strong_reset_secret

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET_KEY=your_cloudinary_api_secret

# Email / password reset
EMAIL_NAME=your_email@example.com
EMAIL_PASSWORD=your_email_app_password
```

For the frontend, the current source points to a deployed API in `Frontend/src/lib/axio.js` and `Frontend/src/lib/socket.js`. For local development, update those URLs to:

```js
// Frontend/src/lib/axio.js
baseURL: "http://localhost:8080/api"

// Frontend/src/lib/socket.js
const URL = "http://localhost:8080";
```

### 3. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 4. Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- MySQL: `localhost:3308`
- Redis: `localhost:6370`

## Usage

### Backend

```bash
cd Backend
npm run start
```

Production mode:

```bash
cd Backend
npm run start:product
```

### Frontend

```bash
cd Frontend
npm run dev
```

Build for production:

```bash
cd Frontend
npm run build
```

Preview production build:

```bash
cd Frontend
npm run preview
```

Lint frontend code:

```bash
cd Frontend
npm run lint
```

## API Overview

Base URL:

```text
http://localhost:8080/api
```

### Public Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/public/signUp` | Register a new user |
| `POST` | `/public/signIn` | Log in and issue auth tokens |
| `POST` | `/public/logout` | Log out the current user |
| `GET` | `/public/check-auth` | Validate the current session |

### Protected User Routes

All routes below are mounted under `/api/user` and require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| `PUT` | `/update-profile` | Update profile data and upload avatar |
| `GET` | `/search` | Search users |
| `GET` | `/friends` | Get friends |
| `GET` | `/friends-info` | Get friends with cached chat metadata |
| `GET` | `/friends/requests` | Get incoming friend requests |
| `POST` | `/friends` | Send a friend request |
| `PATCH` | `/friends/:requesterId` | Accept a friend request |
| `DELETE` | `/friends/reject/:requesterId` | Reject a friend request |
| `DELETE` | `/friends/cancel/:friendId` | Cancel a sent friend request |
| `DELETE` | `/friends/:friendId` | Remove a friend |
| `POST` | `/chats` | Create or initialize a chat |
| `GET` | `/chats` | Get a chat ID |
| `GET` | `/messages/:chatId` | Get paginated messages for a chat |
| `GET` | `/notifications` | Get notifications |
| `PATCH` | `/notifications/:id/read` | Mark a notification as read |
| `DELETE` | `/notification/:id` | Delete a notification |

Example message pagination:

```text
GET /api/user/messages/:chatId?limit=20&before=2025-09-01T00:00:00.000Z
```

## Socket.IO Events

Client connects with `userId` in the Socket.IO handshake query. The server stores online users in Redis, joins the user to a personal room, and notifies online friends.

| Event | Direction | Description |
| --- | --- | --- |
| `getUserOnline` | Server -> Client | Sends online friend IDs after connection |
| `userOnline` | Server -> Client | Notifies friends when a user comes online |
| `userOffline` | Server -> Client | Notifies friends when a user disconnects |
| `joinChat` | Client -> Server | Joins a chat room and resets unread count |
| `leaveChat` | Client -> Server | Leaves a chat room |
| `sendMessage` | Client -> Server | Sends a message to a chat |
| `newMessage` | Server -> Client | Broadcasts a saved message to chat participants |
| `chatUpdate` | Server -> Client | Updates last message and unread count |
| `errorMessage` | Server -> Client | Reports message-send errors |

## Redis Cache Design

| Key | Type | Purpose |
| --- | --- | --- |
| `online_users` | Set | Currently connected users |
| `friends:{userId}` | Set | Friend IDs for a user |
| `friends_info:{userId}` | Hash | Friend metadata such as last message and unread count |
| `refresh_tokens:{userId}` | String | Refresh token/session storage |

## Architecture Notes

- **Relational data in MySQL:** users, chats, friendships, participants, and notifications are modeled with Sequelize.
- **Message data in MongoDB:** chat messages are stored separately for flexible message content and scalable history reads.
- **Redis as realtime state:** online users, unread counters, friend metadata, and token cache are kept outside the primary database for fast access.
- **Socket rooms:** each user has a personal room for notifications and chat list updates, while each conversation uses a chat room for message broadcasts.
- **Containerized local runtime:** Docker Compose starts the backend, frontend, MySQL, and Redis together for consistent local setup.

## Preview

![Home page](./assets/HomePage.png)
![Theme settings](./assets/Themes.png)
![Search users](./assets/Search.png)

## Quick Test Flow

1. Register two users.
2. Search for the second user.
3. Send and accept a friend request.
4. Open a chat and send messages in realtime.
5. Confirm online/offline status and unread counters update correctly.

## Security Notice

Do not commit real `.env` files or production credentials. Use strong JWT secrets, app-specific email passwords, managed database credentials, and environment-specific configuration in production.

## License

This project is currently licensed under ISC through the backend package metadata.
