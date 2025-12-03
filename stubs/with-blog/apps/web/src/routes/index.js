/**
 * API Routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './auth.routes.js';

export function setupRoutes(server) {
  // Security middleware
  server.use(helmet());
  server.use(cors());
  
  // Body parsing
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  
  // API Routes
  server.use('/api/auth', authRoutes);
  
  // Health check
  server.get('/health', (req, res) => {
    res.json({
      success: true,
      service: process.env.APP_NAME || 'blog-api-web',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });
  
  // Example protected route
  server.get('/api/protected', (req, res) => {
    res.json({
      success: true,
      message: 'This is a protected route',
    });
  });
  
  // 404 handler
  server.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });
  
  // Error handler
  server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });
}
