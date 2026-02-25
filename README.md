# SocialBoost AI 🚀

**AI-Powered Social Media Management Platform**

A comprehensive desktop application for intelligent social media management, content generation, and analytics tracking. Built with Electron, React, and integrated with Ollama AI for intelligent content creation.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-27.0.0-9fe2bf.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Smart Post Creation**: AI-generated content optimized for Twitter/X and LinkedIn
- **Draft Improvement**: Enhance existing drafts with AI suggestions
- **Hashtag Optimization**: Smart hashtag recommendations based on content
- **Content Variations**: Generate multiple versions of the same post
- **Content Ideas**: AI-powered content suggestions based on trends
- **Sentiment Analysis**: Understand the emotional tone of your content
- **Optimal Timing**: AI recommendations for best posting times

### 📊 Comprehensive Analytics
- **Real-time Metrics**: Track engagement, reach, and performance
- **Visual Charts**: Interactive charts and graphs (Line, Bar, Pie, Area)
- **Performance Trends**: Historical data analysis with trend indicators
- **Content Performance**: Track your best-performing posts
- **Hashtag Analytics**: Monitor hashtag effectiveness
- **Audience Insights**: Demographics and device breakdown
- **Best Posting Times**: Data-driven timing recommendations
- **Data Export**: Export analytics in JSON or CSV format

### 📡 Feed Monitoring
- **Multi-Platform Monitoring**: Track Twitter and LinkedIn feeds
- **AI-Powered Scoring**: Automatic engagement and relevance scoring
- **Smart Filtering**: Filter by keywords, engagement, verified accounts
- **Real-time Updates**: Live feed monitoring with customizable intervals
- **Auto-Engagement**: One-click engagement with high-value posts

### 🔥 Trending Topics
- **Trend Detection**: AI-powered trend analysis across platforms
- **Sentiment Analysis**: Understand trend sentiment (positive/negative/neutral)
- **Category Classification**: Smart categorization of trends
- **AI Recommendations**: Content suggestions based on trends
- **Platform-Specific**: Twitter and LinkedIn trend tracking

### ⚙️ N8N Workflow Automation
- **Pre-built Templates**: Ready-to-use workflow templates
- **Custom Workflows**: Create your own automation workflows
- **Schedule Triggers**: Time-based workflow execution
- **Feed Triggers**: React to feed updates
- **Manual Execution**: Run workflows on-demand
- **Workflow Management**: Start, pause, resume, delete workflows

### 🎨 Modern UI/UX
- **Material Design**: Clean, professional interface
- **Dark/Light Mode**: Theme support (configurable)
- **Responsive Layout**: Adapts to different screen sizes
- **Real-time Status**: Live connection indicators
- **Progress Indicators**: Visual feedback for operations
- **Error Handling**: Graceful error messages and fallbacks

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Ollama** (for AI features) - [Download here](https://ollama.ai)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/socialboost-ai.git
   cd socialboost-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and settings
   ```

4. **Set up Ollama (for AI features)**
   ```bash
   # Install Ollama from https://ollama.ai
   # Then pull the required models:
   ollama pull llama3.2
   ollama pull mistral
   ```

5. **Start the application**
   ```bash
   npm start
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Twitter API
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn API
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Ollama Configuration
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
DEFAULT_AI_MODEL=llama3.2

# N8N Configuration
N8N_HOST=localhost
N8N_PORT=5678

# Application
NODE_ENV=development
PORT=3000
```

## 📖 Usage Guide

### 1. Initial Setup
1. Launch the application
2. Go to **Settings** to connect your social media accounts
3. Configure **AI Settings** to connect to Ollama
4. Test connections to ensure everything is working

### 2. Content Generation
1. Navigate to **Post Generator**
2. Choose your generation method:
   - **Generate from Topic**: Enter a topic and let AI create content
   - **Improve Draft**: Paste your draft for AI enhancement
   - **Content Ideas**: Get AI-generated content ideas
3. Select platform, tone, and length
4. Generate content and schedule or post immediately

### 3. Feed Monitoring
1. Go to **Feed Monitor**
2. Configure monitoring settings (platforms, refresh interval)
3. Start monitoring to see real-time feeds
4. Use filters to find high-engagement posts
5. Engage with posts directly from the interface

### 4. Analytics & Insights
1. Visit **Analytics** to view performance metrics
2. Select time range and platform filters
3. Explore different tabs:
   - **Performance**: Engagement trends and charts
   - **Content**: Top-performing posts and hashtags
   - **Engagement**: AI recommendations and insights
   - **Scheduled**: Manage scheduled posts
4. Export data for further analysis

### 5. Workflow Automation
1. Go to **N8N Workflows**
2. Choose from pre-built templates or create custom workflows
3. Configure triggers (schedule, feed updates, manual)
4. Activate workflows for automated content management

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Material-UI 5, Recharts
- **Backend**: Electron 27, Node.js
- **Database**: SQLite3
- **AI**: Ollama (Llama 3.2, Mistral, etc.)
- **Workflows**: N8N integration
- **APIs**: Twitter API v2, LinkedIn API

### Project Structure
```
socialboost-ai/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── api/             # API integrations
│   │   │   ├── twitter.js   # Twitter API
│   │   │   ├── linkedin.js  # LinkedIn API
│   │   │   └── ollama.js    # Ollama AI API
│   │   ├── index.js         # Main entry point
│   │   └── preload.js       # IPC handlers
│   ├── renderer/            # React frontend
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Renderer entry
│   └── data/                # SQLite database
├── .env.example             # Environment template
├── package.json             # Dependencies
└── README.md               # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Package application
npm run package
```

### Adding New Features

1. **New API Integration**:
   - Add API client in `src/main/api/`
   - Add IPC handlers in `src/main/index.js`
   - Expose methods in `src/main/preload.js`

2. **New Page**:
   - Create component in `src/renderer/pages/`
   - Add route in `src/renderer/App.jsx`
   - Add sidebar link in `src/renderer/components/Sidebar.jsx`

3. **New AI Feature**:
   - Add method to `src/main/api/ollama.js`
   - Add IPC handler in `src/main/index.js`
   - Update UI in relevant page component

## 📝 API Documentation

### Ollama AI API

The application integrates with Ollama for AI-powered features:

```javascript
// Generate content
const result = await window.electronAPI.generatePost(topic, platform, {
  tone: 'professional',
  length: 'medium',
  includeHashtags: true
});

// Improve draft
const improved = await window.electronAPI.improveDraft(draft, platform);

// Analyze sentiment
const sentiment = await window.electronAPI.analyzeSentiment(text);

// Check Ollama status
const status = await window.electronAPI.checkOllamaStatus();
```

### Social Media APIs

Twitter and LinkedIn API integrations provide:

- OAuth 2.0 authentication
- Feed fetching and monitoring
- Post creation and scheduling
- Engagement tracking
- Trend analysis

## 🧪 Testing

### Manual Testing Checklist

- [ ] Ollama connection and AI generation
- [ ] Twitter OAuth and feed monitoring
- [ ] LinkedIn OAuth and feed monitoring
- [ ] Content generation and improvement
- [ ] Analytics dashboard and charts
- [ ] Workflow creation and execution
- [ ] Data export functionality
- [ ] Error handling and fallbacks

### Performance Testing

- AI generation response time: ~1-3 seconds
- Feed refresh: ~1-2 seconds
- Analytics loading: ~1 second
- Memory usage: ~200-500MB

## 🚀 Deployment

### Building for Production

```bash
# Build the application
npm run build

# Package for current platform
npm run package

# Package for specific platforms
npm run package:win
npm run package:mac
npm run package:linux
```

### Distribution

Built applications will be in the `dist/` directory. Distribute the appropriate installer for your platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) - For providing local AI model hosting
- [Material-UI](https://mui.com) - For the beautiful UI components
- [Recharts](https://recharts.org) - For the charting library
- [N8N](https://n8n.io) - For workflow automation capabilities
- [Electron](https://electronjs.org) - For the desktop application framework

## 📞 Support

For support, email support@socialboost.ai or join our [Discord community](https://discord.gg/socialboost).

## 🗺️ Roadmap

- [x] Phase 1: Foundation (Electron + React + OAuth)
- [x] Phase 2: Feed Monitoring (Multi-platform + N8N)
- [x] Phase 3: AI Integration (Ollama + Content Generation)
- [x] Phase 4: Analytics & Polish (Charts + Export + UI)
- [ ] Future: Instagram/Facebook integration
- [ ] Future: Advanced AI model training
- [ ] Future: Team collaboration features
- [ ] Future: Mobile companion app

---

**Made with ❤️ by the SocialBoost AI Team**