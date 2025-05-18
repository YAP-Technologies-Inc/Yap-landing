# YAP Landing Page

<img src="src/assets/images/YAP.png" alt="YAP Logo" width="100"/>

## Overview

YAP Landing Page is the pre-launch website for [goyap.ai](https://goyap.ai), a revolutionary language learning platform that rewards users for mastering new languages. This project serves as the entry point for early adopters, allowing them to join the waitlist and get exclusive early access to the platform.

## Project Structure

This project is part of the larger YAP ecosystem, which consists of:
- **yap-landing**: Pre-launch marketing site (this repository)
- **Yap-frontend**: Main application frontend for registered users
- **YAP-backend**: Microservices backend powering the platform

### Tech Stack

The YAP Landing Page is built with:
- [Angular](https://angular.io/) - Frontend framework
- [Ionic](https://ionicframework.com/) - Cross-platform UI toolkit
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Three.js](https://threejs.org/) - 3D graphics library for immersive visual experiences

## Features

- **Interactive 3D Background**: Engaging visual experience powered by Three.js
- **Multi-language Support**: Showcases supported languages in a dynamic ticker
- **Waitlist Registration**: Captures user information including preferred language
- **Responsive Design**: Fully optimized for all device sizes

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) (v7+) or [yarn](https://yarnpkg.com/) (v1.22+)
- [Angular CLI](https://angular.io/cli) (v15+)
- [Ionic CLI](https://ionicframework.com/docs/cli) (v6+)

### Installation

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/your-org/YAP.git
cd YAP/yap-landing

# Install dependencies
npm install

# Fix any package vulnerabilities (if needed)
npm audit fix
```

### Development Server

```bash
# Start the development server
npm start

# Or with Ionic CLI
ionic serve
```

Navigate to `http://localhost:4200/` to see the application running. The app will automatically reload if you change any of the source files.

## Building for Production

```bash
# Production build
npm run build

# Or with environment-specific configuration
npm run build -- --configuration=production
```

The build artifacts will be stored in the `www/` directory.

## Backend Integration

The landing page connects to the auth microservice in the YAP-backend to register waitlist users. The connection is configured through environment variables:

- Development: Points to `http://localhost:3000` by default
- Production: Points to `https://api.yapapp.xyz`

## Waitlist Feature

The waitlist feature allows users to register for early access and express their language learning preferences. When users submit the form, the following data is collected:

- Full name
- Email address
- Preferred language for learning
- Marketing consent

This data is sent to the backend and stored in MongoDB. When users are later activated:

1. The auth microservice creates a user profile
2. The user's preferred language is stored in their profile
3. The learning experience is personalized based on this preference

## Deployment

The production build can be deployed to various hosting services:

```bash
# For Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init
firebase deploy

# For AWS S3/CloudFront
aws s3 sync www/ s3://your-bucket-name/ --delete
```

## Environment Configuration

Environment configuration files are located in `src/environments/`:

- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

Update these files to adjust API endpoints or other environment-specific settings.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Related Projects

- [YAP-backend](../YAP-backend/README.md) - Microservices backend
- [Yap-frontend](../Yap-frontend/README.md) - Main application frontend

## Contact

Project Owner - [@your-twitter](https://twitter.com/your-twitter)

Project Website: [https://goyap.ai](https://goyap.ai)

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
