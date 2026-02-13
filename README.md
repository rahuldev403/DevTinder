# 💖 CodeCrush

> A pixelated, bubblegum-themed dating platform for developers. Find your perfect dev match!

CodeCrush is a modern full-stack dating application designed specifically for developers. Swipe through profiles, connect with like-minded coders, and chat in real-time with your matches.

## ✨ Features

- 🎨 **Pixelated Bubblegum Aesthetic** - Retro-inspired design with custom pixel art assets
- 👤 **Developer Profiles** - Showcase your tech stack, experience level, and bio
- 💫 **Smart Matching** - AI-powered compatibility scoring using OpenAI
- ↔️ **Swipeable Feed** - Tinder-style interface for browsing developers
- 💬 **Real-time Chat** - Instant messaging with Socket.io
- 🔔 **Live Notifications** - Get notified of matches, messages, and connection requests
- 🔐 **Secure Authentication** - JWT-based auth with HTTP-only cookies
- 📸 **Image Uploads** - Cloudinary integration for profile pictures
- 🎯 **Connection Management** - Send, accept, or reject connection requests

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication
- **Sonner** - Toast notifications
- **Axios** - HTTP client
- **shadcn/ui** - UI component library

### Backend

- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **OpenAI API** - AI compatibility scoring
- **Express Rate Limit** - API rate limiting

## 📁 Project Structure

```
DevTinder/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & service configs
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Auth & validation middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Seed scripts
│   │   ├── services/        # Business logic (AI service)
│   │   ├── sockets/         # Socket.io handlers
│   │   ├── index.js         # App entry point
│   │   └── socket.js        # Socket instance manager
│   └── package.json
├── frontend/
│   ├── public/              # Static assets (PNG icons)
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── assets/          # Images & assets
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Auth-related components
│   │   │   ├── layout/      # Layout components (AppShell)
│   │   │   └── ui/          # Reusable UI components
│   │   ├── contexts/        # React contexts (LoadingContext)
│   │   ├── hooks/           # Custom hooks (useSocketNotifications)
│   │   ├── lib/             # Utilities & helpers
│   │   ├── pages/           # Route pages
│   │   ├── routes/          # Router configuration
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # React entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account (for image uploads)
- OpenAI API key (for compatibility scoring)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DevTinder
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=8000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# OpenAI (for AI compatibility scoring)
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend

No environment variables required. API URL is configured in `src/api/client.js`.

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   Server runs on `http://localhost:8000`

2. **Start the frontend dev server**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

3. **Seed the database (optional)**
   ```bash
   cd backend
   npm run seed
   ```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/user/feed` - Get swipeable user feed
- `PUT /api/user/update` - Update user profile
- `POST /api/user/swipe` - Swipe left/right on a user
- `GET /api/user/matches` - Get all matches
- `GET /api/user/requests` - Get connection requests
- `POST /api/user/respond` - Accept/reject connection request

### Messages

- `GET /api/messages/:matchId` - Get chat messages
- `POST /api/messages/:matchId` - Send message
- `DELETE /api/messages/:messageId` - Delete message

## 🔌 Socket Events

### Client → Server

- `join-room` - Join chat room for a match
- `leave-room` - Leave chat room
- `send-message` - Send chat message
- `delete-message` - Delete sent message

### Server → Client

- `receive-message` - New message received
- `message-deleted` - Message was deleted
- `connection-request` - New connection request
- `connection-accepted` - Connection was accepted
- `connection-rejected` - Connection was rejected
- `compatibility-ready` - AI compatibility score ready
- `compatibility-error` - Error calculating compatibility

## 🎨 Custom Assets

All icon assets are custom PNG images with pixelated styling:

- `codecrush-text.png` - Main logo
- `feed.png`, `requests.png`, `match.png`, `user.png` - Navigation icons
- `save.png`, `sheild.png`, `key.png` - Profile action icons
- `postbox.png`, `calendar.png` - Empty state illustrations
- And more in `/frontend/public/`

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- bcrypt password hashing
- Socket.io authentication middleware
- Express rate limiting (200 requests per 15 minutes)
- CORS configuration
- Input validation with validator.js

## 🧪 Development Scripts

### Backend

```bash
npm run dev      # Start with nodemon (auto-reload)
npm run seed     # Seed database with sample users
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📝 Key Features Explained

### AI Compatibility Scoring

When two users match, the backend uses OpenAI's API to analyze their profiles (bio, interests, experience) and generate a compatibility score from 0-100 with a personalized explanation.

### Real-time Chat

Socket.io enables bidirectional communication for instant messaging. Users join room-based channels (by matchId) and messages are emitted to all participants in real-time.

### Global Loading Indicator

A custom `LoadingContext` provides app-wide loading states with customizable messages for better UX during async operations.

### Toast Notifications

Sonner library integrated with custom styling for pixelated theme. Notifications trigger on socket events like new matches, messages, and connection status updates.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Built with 💖 by developers, for developers.

---

**Happy Matching! 💕✨**
