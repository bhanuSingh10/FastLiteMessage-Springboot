# 💬 Real-time Chat Application

A full-stack real-time chat application built with **React**, **Spring Boot**, **MongoDB**, and **WebSocket**.

![Chat App](https://img.shields.io/badge/Status-Active-green.svg)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue.svg)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203-green.svg)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)

## ✨ Features

- 🔐 **User Authentication** - JWT-based login/register
- 💬 **Real-time Messaging** - WebSocket communication
- 👥 **Direct Chats** - One-on-one conversations
- 🏠 **Group Chats** - Create and manage group conversations
- 💾 **Message Persistence** - All messages saved to MongoDB
- 📁 **File Sharing** - Upload images and files via Cloudinary
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔄 **Auto-scroll** - Smart chat scrolling behavior
- 🟢 **Online Status** - See who's online
- ⌨️ **Typing Indicators** - See when someone is typing

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Next.js 14** for SSR and routing
- **Tailwind CSS** for styling
- **ShadCN/UI** components
- **WebSocket Client** for real-time communication

### Backend

- **Spring Boot 3** with Java 17
- **Spring Security** for authentication
- **Spring WebSocket** for real-time messaging
- **MongoDB** with Spring Data for persistence
- **JWT** for secure authentication
- **Cloudinary** for file uploads

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **Java** 17 or higher
- **Maven** 3.6 or higher
- **MongoDB Atlas** account (free tier available)
- **Cloudinary** account (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your credentials
# You'll need:
# - MongoDB connection string
# - JWT secret key
# - Cloudinary credentials
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔧 Environment Configuration

Create a `.env` file in the project root with these variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users

- `GET /api/users/search?query={query}` - Search users
- `POST /api/users/online?isOnline={boolean}` - Update online status

### Chats

- `GET /api/chats` - Get user's chat rooms
- `POST /api/chats/direct?userId={userId}` - Create/get direct chat
- `POST /api/groups` - Create group chat

### Messages

- `GET /api/messages?chatId={chatId}` - Get chat messages
- `POST /api/messages` - Send new message
- `PUT /api/messages/{id}` - Edit message
- `DELETE /api/messages/{id}` - Delete message
- `POST /api/messages/{id}/react` - React to message

### WebSocket

- `/ws` - WebSocket connection endpoint
- **Message reactions** with emoji support
- **Message editing and deletion**
- **Message pinning** for important messages
- **Typing indicators** ("User is typing...")
- **Message search** within chats
- **Infinite scroll** for message history
- **Unread message badges**

### 👤 User Features

- **JWT Authentication** with refresh tokens
- **User profiles** with bio and avatar
- **Avatar upload** via Cloudinary
- **Online/offline status** indicators
- **Privacy settings** (show/hide online status)
- **User search** functionality

### 📁 File Sharing

- **Image sharing** with preview
- **File uploads** (documents, images)
- **Cloudinary integration** for media storage
- **File download** functionality

### 🎨 UI/UX Features

- **Responsive design** (mobile, tablet, desktop)
- **Dark/light mode** toggle
- **Modern UI** with Tailwind CSS and shadcn/ui
- **Real-time notifications**
- **Smooth animations** and transitions

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **WebSocket** (STOMP client)
- **React Hooks** for state management

### Backend

- **Spring Boot 3.2**
- **Java 17**
- **Spring Security** (JWT)
- **Spring WebSocket** (STOMP)
- **MongoDB** (Spring Data)
- **Cloudinary** (file uploads)
- **Maven** (build tool)

### Database & Storage

- **MongoDB** (document database)
- **Cloudinary** (media storage)

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** 3.6+
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for file uploads)

### Quick Start with Docker

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd chat-app
   \`\`\`

2. **Update environment variables in docker-compose.yml**
   \`\`\`yaml

   # Update these values in docker-compose.yml

   CLOUDINARY_CLOUD_NAME: your-cloud-name
   CLOUDINARY_API_KEY: your-api-key
   CLOUDINARY_API_SECRET: your-api-secret
   JWT_SECRET: your-jwt-secret-key
   \`\`\`

3. **Start all services**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080
   - MongoDB: localhost:27017

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Configure application.properties**

   ```properties
   # Copy from application.properties and update values
   spring.data.mongodb.uri=mongodb://localhost:27017/chatapp
   jwt.secret=your-jwt-secret-key
   cloudinary.cloud-name=your-cloud-name
   cloudinary.api-key=your-api-key
   cloudinary.api-secret=your-api-secret
   \`\`\`

   ```

3. **Run the backend**
   \`\`\`bash
   mvn clean install
   mvn spring-boot:run
   \`\`\`

#### Frontend Setup

1. **Navigate to frontend directory**
   \`\`\`bash
   cd frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash

   # Create .env.local file

   NEXT_PUBLIC_API_URL=http://localhost:8080
   \`\`\`

4. **Run the frontend**
   \`\`\`bash
   npm run dev
   \`\`\`

#### Database Setup

**Option 1: Local MongoDB**
\`\`\`bash

# Install and start MongoDB locally

mongod --dbpath /path/to/your/db
\`\`\`

**Option 2: MongoDB Atlas**

1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Update `MONGODB_URI` in your configuration

## 🔧 Configuration

### Environment Variables

#### Backend (.env or application.properties)

```properties
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```
