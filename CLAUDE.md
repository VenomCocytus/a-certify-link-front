# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

**A-Cert Frontend** is the React-based web application for Activa's certificate management system. It provides a comprehensive interface for:

- **Digital Certificate Lifecycle Management**: Create, validate, suspend, and cancel certificates through ORASS policy integration
- **Edition Request Workflows**: Streamlined certificate production requests with approval processes
- **Multi-Organization Support**: Enterprise-grade user and organization management
- **Real-time Statistics**: Usage analytics and certificate utilization reporting
- **Secure Authentication**: JWT-based auth with 2FA support and automatic token refresh

The application serves as the primary interface for certificate authorities, administrators, and end-users managing digital certificates in enterprise environments.

## Build/Test/Deploy Commands

### Local Development
```bash
npm start                    # Start development server on http://localhost:3000
npm test                     # Run Jest tests in interactive watch mode
npm run build               # Build optimized production bundle to build/
npm install                 # Install dependencies from package-lock.json
```

### Docker Commands
```bash
# Full stack development
docker-compose up           # Start all services (frontend:3001, backend:3000, db:5432, redis:6379)
docker-compose up -d        # Start in background (detached mode)
docker-compose down         # Stop all services and remove containers

# Frontend only
docker build -t a-cert-frontend .    # Build production image using multi-stage Dockerfile
docker run -p 3001:80 a-cert-frontend    # Run container on port 3001
```

### Production Deployment
```bash
npm run build               # Create production build
# Serve build/ folder with nginx or static server
# Docker: Uses multi-stage build (Node.js → nginx:alpine)
```

### Environment Setup
- Create `.env` file with `REACT_APP_API_BASE_URL=http://localhost:3002/api/v1`
- Backend must be running on configured API URL
- Database and Redis required for full functionality (via docker-compose)

## Code Architecture

### Frontend Framework Stack
- **React 19.1.0** with Create React App
- **PrimeReact 10.9.6** - Primary UI component library with PrimeIcons and PrimeFlex
- **React Router 7.6.2** - Client-side routing
- **Axios** - HTTP client with interceptors for auth and error handling
- **Chart.js** - Data visualization

### Project Structure
```
src/
├── components/           # Feature-based component organization
│   ├── Auth/            # Authentication components
│   ├── Certificate/     # Certificate management
│   ├── Common/          # Shared/reusable components
│   ├── CreateEdition/   # Edition creation workflow
│   ├── Dashboard/       # Main dashboard
│   ├── Layout/          # App layout components
│   ├── Login/           # Login/auth forms
│   ├── Profile/         # User profile management
│   ├── Settings/        # Application settings
│   └── Statistics/      # Data visualization components
├── contexts/            # React Context providers
│   ├── AuthContext.js   # Authentication state management
│   ├── ThemeContext.js  # Theme switching functionality
│   └── ToastContext.js  # Global notification system
├── hooks/
│   └── useCommon.js     # Shared custom hooks
├── services/            # External service integration
│   ├── apiService.js    # Centralized API client with auth interceptors
│   └── authService.js   # Authentication service layer
└── utils/               # Utility functions and constants
    ├── constants.js     # Application constants and configuration
    ├── format.js        # Data formatting utilities
    ├── validation.js    # Form validation helpers
    └── utils.js         # General utility functions
```

### Authentication Architecture
- **JWT-based authentication** with access tokens stored in localStorage
- **AuthContext** provides centralized auth state (login, register, logout, profile updates)
- **API interceptors** handle automatic token attachment and refresh logic
- **Route protection** via ProtectedRoute and PublicRoute wrapper components
- **Automatic token refresh** on 401 responses with fallback to login redirect

### API Integration
- **Base URL**: Configurable via `REACT_APP_API_BASE_URL` (defaults to http://localhost:3002/api/v1)
- **Certificate API**: Main business logic for certificate management and edition requests
- **Auth API**: Complete authentication flow including 2FA support
- **Statistics API**: Usage metrics and reporting endpoints
- **Error handling**: Centralized error response handling with automatic retry logic

### State Management Patterns
- **Context providers** wrap the entire app: ThemeProvider → AuthProvider → ToastProvider
- **Global contexts** for cross-cutting concerns (auth, themes, notifications)
- **Local component state** for feature-specific data
- **Service layer pattern** separating API calls from component logic

### Styling and UI
- **PrimeReact theme system** with dynamic theme switching capability
- **PrimeFlex** for responsive flexbox utilities
- **Prettier configuration** enforcing consistent code style:
  - Single quotes, semicolons, 2-space indentation
  - Line width: 80 characters
  - No trailing commas

### Environment Configuration
- **Development**: API defaults to http://localhost:3002/api/v1
- **Docker production**: Frontend serves on port 3001, connects to backend on port 3000
- **Multi-stage Docker build** with Nginx serving static assets in production

## Coding Standards

### Code Formatting (Prettier)
```javascript
// .prettierrc configuration enforced
{
  "semi": true,                    // Always use semicolons
  "trailingComma": "none",         // No trailing commas
  "singleQuote": true,             // Use single quotes for strings
  "printWidth": 80,                // Max line length 80 characters
  "tabWidth": 2,                   // 2-space indentation
  "useTabs": false,                // Spaces, not tabs
  "bracketSpacing": true,          // Spaces in object literals { foo: bar }
  "bracketSameLine": false,        // JSX closing bracket on new line
  "arrowParens": "avoid",          // x => x not (x) => x
  "endOfLine": "lf",               // Unix line endings
  "jsxSingleQuote": false,         // Use double quotes in JSX
  "quoteProps": "as-needed"        // Quote object properties only when needed
}
```

### React Component Patterns
```javascript
// Functional components with hooks (preferred)
import React, { useState, useEffect } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="my-component">
      {/* JSX content */}
    </div>
  );
};

export default MyComponent;

// Custom hooks for shared logic
export const useApiCall = (apiFunction, dependencies = []) => {
  // Hook implementation
};
```

### File and Component Naming
- **Components**: PascalCase (`UserProfile.js`, `CreateEdition.js`)
- **Hooks**: camelCase starting with 'use' (`useCommon.js`, `useApiCall`)
- **Services**: camelCase with Service suffix (`apiService.js`, `authService.js`)
- **Utilities**: camelCase (`validation.js`, `constants.js`)
- **Contexts**: PascalCase with Context suffix (`AuthContext.js`)

### Import Organization
```javascript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import axios from 'axios';

// 2. Internal contexts and hooks
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

// 3. Services and utilities
import { apiService } from '../services/apiService';
import { ValidationRules } from '../utils/validation';

// 4. Styles (last)
import './Component.css';
```

### Error Handling Patterns
```javascript
// API calls with proper error handling
try {
  const response = await apiService.someEndpoint();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  showError(error.message || 'Operation failed');
}

// Form validation using ValidationRules
const errors = validateForm(formData, ValidationRules);
if (errors.length > 0) {
  showError('Please fix validation errors');
  return;
}
```

### State Management Conventions
- **Local state**: `useState` for component-specific data
- **Global state**: React Context for auth, themes, notifications
- **API state**: Custom `useApiCall` hook with loading/error states
- **Forms**: Controlled components with validation utilities

## Critical File Locations

### Core Application Files
- **`src/App.js`** - Main application component with routing setup and context providers
- **`src/index.js`** - React DOM root and app initialization
- **`package.json`** - Dependencies, scripts, and project metadata

### Configuration Files
- **`.env`** - Environment variables (`REACT_APP_API_BASE_URL`)
- **`.prettierrc`** - Code formatting rules enforced across the project
- **`docker-compose.yaml`** - Full stack development environment configuration
- **`Dockerfile`** - Multi-stage production build (Node.js → Nginx)
- **`nginx.conf`** - Production web server configuration

### Authentication System
- **`src/contexts/AuthContext.js`** - Global authentication state management
- **`src/services/authService.js`** - Authentication API integration layer
- **`src/components/Login/Login.js`** - Login form with 2FA support
- **Route protection in `src/App.js`** - ProtectedRoute and PublicRoute components

### API Integration Layer
- **`src/services/apiService.js`** - Centralized API client with request/response interceptors
  - Automatic token attachment
  - Token refresh on 401 responses  
  - Base URL configuration
  - All certificate and auth endpoints

### Business Logic Components
- **`src/components/Dashboard/Dashboard.js`** - Main application dashboard
- **`src/components/CreateEdition/CreateEdition.js`** - Certificate edition request workflow
- **`src/components/Certificate/`** - Certificate management components
- **`src/components/Statistics/`** - Usage analytics and reporting

### Utility and Configuration
- **`src/utils/constants.js`** - Application constants, routes, certificate statuses
- **`src/utils/validation.js`** - Form validation rules matching backend DTOs
- **`src/utils/format.js`** - Data formatting utilities
- **`src/hooks/useCommon.js`** - Shared custom hooks including `useApiCall`

### UI and Styling
- **`src/contexts/ThemeContext.js`** - Dynamic theme switching functionality
- **`src/contexts/ToastContext.js`** - Global notification system
- **`src/components/Layout/Layout.js`** - Main application layout wrapper
- **`src/components/Common/`** - Reusable UI components

### Development and Deployment
- **`public/index.html`** - HTML template for React application
- **`build/`** - Production build output (generated by `npm run build`)
- **`node_modules/`** - Installed dependencies
- **`package-lock.json`** - Exact dependency versions for reproducible builds

## Key Business Domain

This is a **certificate management application** (A-Cert) that handles:
- **Certificate lifecycle management** (creation, suspension, cancellation)
- **Edition request workflows** for certificate production
- **ORASS policy integration** for certificate validation
- **Multi-organization support** with user management
- **Usage statistics and reporting** for certificate utilization
- **Certificate download and distribution** functionality

The application connects to a backend API that manages certificate authorities, policy engines, and certificate production workflows.