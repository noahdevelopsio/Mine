# SocialBoost AI

An AI-powered social media automation desktop application with N8N integration for managing X (Twitter) and LinkedIn feeds, generating engaging content, and automating social media workflows.

## Features

### 🚀 Core Features
- **Feed Monitoring**: Monitor X and LinkedIn feeds for engagement opportunities
- **AI Post Generation**: Generate complete posts from topics using local AI models
- **Draft Improvement**: Enhance your rough drafts with AI-powered improvements
- **Hashtag Suggestions**: Smart hashtag and keyword suggestions for maximum reach
- **Trending Analysis**: Analyze trending topics in your industry
- **N8N Workflows**: Visual workflow automation for complex social media tasks

### 🤖 AI-Powered Capabilities
- **Local AI Models**: Free and open-source AI using Ollama (no API costs)
- **Content Generation**: Convert topics into complete, engaging posts
- **Style Learning**: AI adapts to your writing style and preferences
- **Platform Optimization**: Platform-specific content formatting (X vs LinkedIn)
- **Engagement Prediction**: AI predicts post performance before publishing

### ⚙️ Automation & Workflows
- **Smart Engagement**: Automated suggestions for posts to engage with
- **Content Scheduling**: Queue posts for optimal timing
- **Performance Analytics**: Track engagement metrics and content performance
- **Workflow Builder**: Visual N8N workflows for complex automation

## Tech Stack

### Frontend
- **Electron.js** - Cross-platform desktop application
- **React.js** - Modern UI framework
- **Material-UI** - Beautiful, responsive UI components
- **React Router** - Client-side routing

### Backend
- **Node.js** - Server-side JavaScript runtime
- **SQLite** - Local database for preferences and cached data
- **Axios** - HTTP client for API integrations

### AI & Automation
- **Ollama** - Local AI model runner (free/open source)
- **N8N** - Visual workflow automation engine
- **LangChain.js** - AI orchestration and prompt management

### Social Media APIs
- **X (Twitter) API v2** - For feed monitoring and post management
- **LinkedIn API** - For professional network integration
- **OAuth 2.0** - Secure authentication

## Installation

### Prerequisites
- Node.js (v18 or higher)
- N8N (optional, will be installed automatically)
- Ollama (optional, for local AI models)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-social-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Development Setup

For development with hot reloading:

```bash
npm run dev
```

## Configuration

### Social Media API Setup

1. **X (Twitter) API**
   - Visit [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new app and get your Client ID and Client Secret
   - Add callback URL: `http://localhost:3000/auth/twitter/callback`
   - Update `.env` with your credentials

2. **LinkedIn API**
   - Visit [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
   - Create a new app and get your Client ID and Client Secret
   - Add redirect URL: `http://localhost:3000/auth/linkedin/callback`
   - Update `.env` with your credentials

### AI Model Setup

1. **Install Ollama** (optional)
   - Download from [ollama.com](https://ollama.com/)
   - Install and run locally

2. **Download AI Models**
   ```bash
   # Pull a model (e.g., Llama 3.2)
   ollama pull llama3.2
   
   # Or pull other models
   ollama pull mistral
   ollama pull gemma2
   ```

3. **Configure in .env**
   ```env
   OLLAMA_HOST=localhost
   OLLAMA_PORT=11434
   DEFAULT_AI_MODEL=llama3.2
   ```

### N8N Setup

N8N will be automatically configured when you start the application. You can access the N8N interface at `http://localhost:5678` to create and manage workflows.

## Usage

### Authentication

1. Launch the application
2. Go to **Settings** page
3. Click **Connect Twitter** and **Connect LinkedIn**
4. Follow the OAuth flow to authenticate your accounts

### Feed Monitoring

1. Go to **Feed Monitor** page
2. Select your preferred platform (X, LinkedIn, or both)
3. Set monitoring frequency and filters
4. Review suggested posts for engagement

### Content Generation

1. Go to **Post Generator** page
2. Enter your topic or idea
3. Select target platform
4. Generate multiple post variations
5. Choose your favorite and schedule or publish

### Workflow Management

1. Go to **N8N Workflows** page
2. Browse pre-built workflows or create custom ones
3. Configure triggers and actions
4. Monitor workflow execution and results

## Project Structure

```
socialboost-ai/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.js    # Main application entry
│   │   ├── preload.js  # Electron preload script
│   │   └── api/        # Social media API integrations
│   ├── renderer/       # React frontend
│   │   ├── App.jsx     # Main React component
│   │   ├── main.jsx    # React entry point
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   └── context/    # React context providers
│   └── ai/            # AI model integration
├── data/              # SQLite database and data files
├── n8n/              # N8N workflows and configurations
├── config/           # Application configuration
└── assets/           # Icons, images, and static assets
```

## Development

### Adding New Features

1. **Frontend Components**: Add to `src/renderer/components/`
2. **Pages**: Add to `src/renderer/pages/`
3. **API Integrations**: Add to `src/main/api/`
4. **AI Features**: Add to `src/main/ai/`
5. **N8N Workflows**: Add to `n8n/workflows/`

### Testing

```bash
# Run tests (when available)
npm test

# Run linting (when configured)
npm run lint
```

### Building for Production

```bash
# Build the application
npm run build

# The built application will be in the dist/ folder
```

## Security

- All API keys are stored locally and never transmitted
- OAuth tokens are encrypted and securely stored
- No external data transmission except for social media APIs
- Local AI processing ensures content privacy

## Troubleshooting

### Common Issues

1. **API Authentication Fails**
   - Check your API keys in `.env`
   - Ensure callback URLs are correctly configured
   - Verify OAuth permissions

2. **AI Models Not Loading**
   - Ensure Ollama is running
   - Check model availability with `ollama list`
   - Verify model name in `.env`

3. **N8N Workflows Not Working**
   - Check N8N service status
   - Verify workflow configuration
   - Check logs for errors

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) section
- Join our [Discord community](https://discord.gg/your-invite)
- Email support at support@socialboost.ai

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is designed to assist with social media management and content creation. Users are responsible for ensuring their content complies with platform policies and regulations. The developers are not responsible for any misuse of this tool.

## Support

For support and questions:
- 📧 Email: support@socialboost.ai
- 💬 Discord: [Join our community](https://discord.gg/your-invite)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ for social media professionals and content creators**