import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from "dotenv";

import logger from './utils/logger';
import { sqlInjectionGuard } from './middleware/sqlInjectionGuard';
import { globalErrorMaster } from './middleware/globalErrorMaster';
import apiRoutes from './routes/api_v1';
import { blockVerify, limiter, slowLimiter } from './middleware/rateLimiterMiddleware';

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4013;

// API Security middleware
app.use(helmet());
app.use(sqlInjectionGuard);

// Rate Limiting middleware
app.use(blockVerify);
app.use(limiter);
app.use(slowLimiter);

// Define permitted origins for CORS
const permittedOrigins: string[] = [
    process.env.CORS_ORIGIN_1 || '',
    process.env.CORS_ORIGIN_2 || '',
].filter((origin): origin is string => Boolean(origin)); // Remove empty strings

// CORS configuration
const corsOptions = {
  origin: permittedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Health check endpoint
app.get(["/", "/health"], (req: Request, res: Response): void => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "ExamOrch API"
    });
});

const serverUrl = process.env.SERVER_URL || 'http://localhost:4013';
const swaggerUrlDescription = process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server';

// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ExamOrch API',
      version: '1.0.0',
      description: 'ExamOrch is an API service for managing and coordinating examinations, offering features such as session and participant management.'
    },
    servers: [
      {
        url: serverUrl,
        description: swaggerUrlDescription
      }
    ]
  },
  // Resolve docs folder relative to project root
  apis: [path.join(__dirname, '../docs/api/*.ts')] // files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/public', express.static(path.join(__dirname, '../public')));

// API routes
app.use("/api", apiRoutes);

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: "Unknown Route",
    message: `The requested route ${req.originalUrl} is nonexistent on this server.`,
  });
});

// Global error handling middleware
app.use(globalErrorMaster);

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

// Ignite server
app.listen(PORT, () => {
  logger.info(`ExamOrch API server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});