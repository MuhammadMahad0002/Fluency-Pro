# English Fluency App

A MERN Stack application to help people improve their English fluency through speech practice.

## Features

- 🎯 **Speech Practice**: Practice speaking with AI-generated or curated speeches
- 📊 **Progress Tracking**: Track your scores, accuracy, and improvement over time
- 🎤 **Voice Recognition**: Real-time speech recognition to compare your pronunciation
- 📚 **Multiple Topics**: Choose from 10 different topics (Technology, Environment, Education, etc.)
- ⏱️ **Flexible Duration**: Practice with 2-minute, 5-minute, or 10-minute speeches
- 📈 **Analytics Dashboard**: View your top scores, recent activity, and statistics

## Tech Stack

- **Frontend**: React.js with Framer Motion for animations
- **Backend**: Node.js with Express (Vercel Serverless Functions)
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: OpenAI GPT-3.5 for speech generation (optional)

## Project Structure

```
├── api/                    # Vercel Serverless Functions
│   ├── auth/              # Authentication routes
│   ├── speech/            # Speech generation routes
│   ├── scores/            # Score management routes
│   └── lib/               # Shared utilities and models
├── client/                # React Frontend
│   ├── public/
│   └── src/
│       ├── context/       # React Context (Auth)
│       └── pages/         # Page components
├── server/                # Express server (for local development)
├── vercel.json            # Vercel configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- (Optional) OpenAI API key for AI-generated speeches

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd english-fluency-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key  # Optional
   PORT=5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This starts both the backend (port 5000) and frontend (port 3000).

## Deploying to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/english-fluency-app)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   
   Go to your project settings in Vercel and add:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string for JWT signing
   - `OPENAI_API_KEY` - (Optional) Your OpenAI API key

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `OPENAI_API_KEY` | No | OpenAI API key for AI-generated speeches |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify JWT token

### Speech
- `GET /api/speech/topics` - Get available topics
- `POST /api/speech/generate` - Generate speech for practice

### Scores
- `POST /api/scores` - Save practice score
- `GET /api/scores/top` - Get top 5 scores
- `GET /api/scores/recent` - Get recent scores
- `GET /api/scores/stats` - Get user statistics
- `GET /api/scores/history` - Get paginated score history

## Scripts

```bash
# Install all dependencies
npm run install-all

# Run development (both client and server)
npm run dev

# Run server only
npm run server

# Run client only
npm run client

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
