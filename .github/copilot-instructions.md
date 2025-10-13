# 👁️‍🗨️ VisionAid - Copilot Instructions

## Project Overview

VisionAid is an accessibility-focused application that converts visual content into audio descriptions to help visually impaired users. The project consists of three main components:

1. **React Native Mobile App** (`VisionAid/`) - Expo-based mobile application
2. **Python API Backend** (`VisionAid-API/`) - FastAPI server with AI vision processing
3. **Node.js Backend** (`VisionAid_BE/`) - Express.js server for user management

## 🏗️ Architecture & Technology Stack

### Mobile App (VisionAid/)
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router with file-based routing
- **Key Features**: Camera integration, audio playback, image processing
- **Main Dependencies**: 
  - `expo-camera` for camera functionality
  - `expo-av` for audio handling
  - `@react-navigation/*` for navigation
  - `react-native-reanimated` for animations

### Python API (VisionAid-API/)
- **Framework**: FastAPI
- **AI Services**: Google Gemini AI for image analysis, FPT.AI for TTS
- **Key Features**: Image-to-text conversion, text-to-speech, OCR
- **Architecture**: Modular design with separate vision processing class

### Node.js Backend (VisionAid_BE/)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Features**: User authentication, JWT tokens, CORS enabled

## 📁 Key File Structure

```
VisionAid/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── CameraScreen.tsx      # Main camera interface
│   │   ├── index.tsx            # Home screen
│   │   ├── main.tsx             # Main functionality
│   │   └── register.tsx         # User registration
│   └── _layout.tsx              # Root layout with theme provider
├── components/                   # Reusable UI components
│   └── ui/                      # UI-specific components
├── constants/theme.ts           # Theme configuration
└── hooks/                       # Custom React hooks

VisionAid-API/
├── app.py                       # FastAPI main application
├── vision_to_speech.py         # Core VTS processing
├── index.html                  # Web interface
└── requirements.txt            # Python dependencies

VisionAid_BE/
├── server.js                   # Express.js server
└── package.json               # Node.js dependencies
```

## 🎯 Development Guidelines

### Mobile App Development
- Use TypeScript for all new files
- Follow Expo conventions and file-based routing
- Implement proper error handling for camera and audio permissions
- Use theme colors from `constants/theme.ts`
- Test on both iOS and Android simulators/devices

### API Development
- Follow FastAPI best practices with proper typing
- Implement async/await patterns for external API calls
- Add proper error handling and status codes
- Document all endpoints with FastAPI's automatic documentation
- Use environment variables for API keys and sensitive data

### Backend Development
- Use middleware for authentication and CORS
- Implement proper error handling and validation
- Follow REST API conventions
- Use prepared statements for database queries

## 🔧 Development Setup

### Mobile App
```bash
cd VisionAid/
npm install
npx expo start
```

### Python API
```bash
cd VisionAid-API/
pip install -r requirements.txt
python app.py
```

### Node.js Backend
```bash
cd VisionAid_BE/
npm install
node server.js
```

## 📱 Key Features & Components

### Camera Integration
- Located in `app/(tabs)/CameraScreen.tsx`
- Uses `expo-camera` for photo capture
- Handles camera permissions properly
- Integrates with API for image processing

### Audio Processing
- Uses `expo-av` for audio playback
- Supports multiple Vietnamese TTS voices
- Handles audio permissions and playback states

### Navigation
- File-based routing with Expo Router
- Tab navigation for main screens
- Modal presentations for overlays

## 🚨 Important Considerations

### Accessibility
- This app is designed for visually impaired users
- Ensure all UI elements have proper accessibility labels
- Test with screen readers (TalkBack/VoiceOver)
- Use high contrast colors and large touch targets

### Performance
- Optimize image processing and API calls
- Implement proper loading states
- Handle network errors gracefully
- Cache responses when appropriate

### Privacy & Security
- Handle sensitive user data properly
- Implement secure authentication
- Follow data protection guidelines
- Use HTTPS for all API communications

## 🔍 Common Tasks

### Adding New Screens
1. Create new file in `app/` directory
2. Export React component as default
3. Add navigation links if needed
4. Update tab navigator if it's a main screen

### Integrating New AI Features
1. Add API endpoints in `VisionAid-API/app.py`
2. Update `vision_to_speech.py` for core processing
3. Connect mobile app to new endpoints
4. Test with various image types

### Database Changes
1. Update schema in PostgreSQL
2. Modify queries in `VisionAid_BE/server.js`
3. Update mobile app API calls
4. Test data flow end-to-end

## 🧪 Testing Strategy

- Test camera functionality on physical devices
- Verify audio playback across different devices
- Test API endpoints with various image formats
- Validate user authentication flows
- Check accessibility features with assistive technologies

## 🌐 Deployment Notes

- Mobile app: Build with Expo Application Services (EAS)
- Python API: Deploy on cloud platforms with ML capabilities
- Node.js Backend: Standard Express.js deployment
- Ensure all environment variables are configured
- Set up proper monitoring and logging

## 📚 External Dependencies

### Critical APIs
- **Google Gemini AI**: Image analysis and OCR
- **FPT.AI TTS**: Vietnamese text-to-speech
- **Expo SDK**: Mobile development framework

### Key Libraries
- `expo-camera`: Camera integration
- `expo-av`: Audio processing
- `fastapi`: Python web framework
- `express`: Node.js web framework
- `pg`: PostgreSQL client

## 🤝 Contributing Guidelines

1. Follow TypeScript/JavaScript best practices
2. Add proper error handling and logging
3. Test accessibility features thoroughly
4. Document API changes in code comments
5. Ensure cross-platform compatibility
6. Follow the established project structure
