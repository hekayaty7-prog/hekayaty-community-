# StoryVerse Community Platform

## Overview

StoryVerse is a full-stack community platform designed for writers, readers, and creative enthusiasts. The application provides a social hub where users can participate in discussions, join book clubs, attend writing workshops, and share artwork. Built as a modern web application with React frontend and Express backend, it features a comprehensive content management system with different post types and community engagement tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using functional components and hooks
- **Vite Build System**: Fast development server with hot module replacement and optimized production builds
- **Routing**: Wouter library for lightweight client-side routing
- **State Management**: React Context API for global community state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting light/dark mode
- **Type Safety**: Full TypeScript integration with shared schema definitions

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for logging and error handling
- **Modular Route System**: Centralized route registration with separation of concerns
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations
- **Development Integration**: Vite middleware integration for seamless development experience

### Data Architecture
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe queries
- **Schema Design**: Comprehensive database schema supporting users, posts, book clubs, and workshops
- **Type Generation**: Drizzle-zod integration for runtime validation and TypeScript type inference
- **Migration System**: Database migration management through Drizzle Kit

### Component Architecture
- **Post Type System**: Specialized components for different content types (discussions, book clubs, workshops, art gallery)
- **Layout Components**: Structured layout with navigation header, main sidebar, and right sidebar
- **Reusable UI**: Comprehensive component library with consistent design patterns
- **Context Providers**: Global state management for community data and user interactions

### Authentication & State
- **Session Management**: Express session handling with PostgreSQL session store
- **User Context**: Global user state management through React Context
- **Mock Data**: Development-ready with comprehensive mock data for all features

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, React DOM, and React Router alternative (Wouter)
- **Build Tools**: Vite for development and production builds, ESBuild for server bundling
- **Node.js Runtime**: Express.js server with TypeScript execution via tsx

### Database & ORM
- **PostgreSQL**: Primary database with Neon Database serverless integration
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Session Store**: connect-pg-simple for PostgreSQL session storage

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with PostCSS integration
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide Icons**: Modern icon library for consistent iconography

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **Replit Integration**: Development environment plugins for enhanced debugging
- **React Query**: Server state management and caching (TanStack Query)

### Utility Libraries
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Date Management**: date-fns for date formatting and manipulation
- **Styling Utilities**: clsx and class-variance-authority for conditional styling
- **Validation**: Zod for runtime type validation and schema definition