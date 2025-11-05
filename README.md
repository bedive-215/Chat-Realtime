# Chat Realtime ##

A real-time chat application with user authentication, friend requests, messaging, and online/offline status. Built with Socket.IO, Redis, MySQL, and MongoDB, and powered by a modern React + Vite frontend.
## Frontend inspired by projects from https://github.com/burakorkmez/ ##

---

## Features ##

- User registration, login, and JWT authentication
- Real-time messaging between friends
- Online/offline status updates
- Friend request system (send, accept, reject)
- Message history stored in MongoDB
- Secure with JWT, refresh tokens
- Modern UI built with React and Vite

---

## Tech Stack ##

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React + Vite                        |
| Backend     | Node.js + Express                   |
| Real-time   | Socket.IO + Redis                   |
| Database    | MySQL (via Sequelize ORM) + MongoDB |
| Auth        | JWT + Refresh Token                 |
| DevOps      | Docker + Docker Compose             |

---

### Project Structure ###

```

Chat-Realtime/
├── Backend/
│   ├── src/
│   ├── .env
│   └── dockerfile
├── Frontend/
│   ├── src/
│   ├── .env
│   └── dockerfile
├── Database/
│   └── seeds/
├── docker-compose.yml

```

## Getting Started

## 1. Clone the repository ##

```bash

git clone https://github.com/bedive-215/Chat-Realtime.git

```

## 2. Configure environment variables ##

```bash

### Backend Environment Variables (`Backend/.env`)

# Cloudinary (for image uploads)
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET_KEY=your_api_secret

# MySQL Database
DB_NAME=chat_realtime
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_HOST=mysql
DB_PORT=3306

# MongoDB (for message storage)
MONGODB_URL=your_mongo_atlas_url

# JWT Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=30d
RESET_PASSWORD_TOKEN_SECRET=your_reset_password_token_secret

# Email (for password reset)
EMAIL_NAME=your_email_address
EMAIL_PASSWORD=your_email_app_password

# Redis (for realtime presence)
REDIS_HOST=redis
REDIS_PORT=6379

# Server
PORT=8080
NODE_ENV=development

```

## 3. Run with Docker ##

```bash
docker-compose up --build
```
Then open your browser at: http://localhost:5173

## 4. Socket Flow

1. **User connects**
   - Frontend sends `userId` via socket handshake.
   - Server adds `userId` to `online_users` set in Redis.
   - Server joins the user to their personal room (`socket.join(userId)`).
   - Server fetches `friends:{userId}` from Redis and compares with `online_users`.
   - Emits `getUserOnline` event with the list of online friends.

2. **User sends a message**
   - Server saves the message via `messageService`.
   - Emits `newMessage` to the corresponding `chatId` room.
   - Updates `lastMessage` field in `friends_info:{receiverId}` and `friends_info:{senderId}` Redis hashes.
   - If the receiver is not in the chat room, increments `unreadCount` in `friends_info:{receiverId}`.
   - Emits `chatUpdate` to the receiver’s personal room.

3. **User joins or leaves a chat**
   - `joinChat`: resets unread count and joins the `chatId` room.
   - `leaveChat`: leaves the `chatId` room.

4. **User disconnects**
   - Removes `userId` from `online_users` in Redis.
   - Notifies all friends via `userOffline` event.

5. **Friend request actions**
   - On `sendFriendRequest`, `acceptFriendRequest`, or `rejectFriendRequest`, server emits `newNotification` to the target user.
  
## 5. Redis cache

| Key Format                      | Type    | Description                                           |
|--------------------------------|---------|-------------------------------------------------------|
| `online_users`                 | Set     | List of currently online user IDs                    |
| `friends:{userId}`            | Set     | List of friend IDs for a specific user              |
| `friends_info:{userId}`       | Hash    | Stores metadata for each friend (last message, unread count, etc.) |
| `refresh_tokens:{userId}`       | String  | Stores refresh token for secure authentication       |

## 6. Quick test ##

 - Register a new user
 - Send and accept friend requests
 - Start a real-time chat
 - Observe online/offline status updates

---

> This project is for learning and educational purposes only.
