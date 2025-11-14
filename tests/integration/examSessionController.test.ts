import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { ExamSessionController } from '../../src/controllers/examSessionController';
import { ExamSessionService } from '../../src/services/examSessionService';
import { HttpError } from '../../src/errors/errors';

// Mock the service module
jest.mock('../../src/services/examSessionService');

describe('ExamSessionController', () => {
  let controller: ExamSessionController;
  let mockService: jest.Mocked<ExamSessionService>;

  beforeEach(() => {
    // Create the mock service instance
    mockService = {
      createSession: jest.fn(),
      getAllSessions: jest.fn(),
      getSessionById: jest.fn(),
      closeEnrollment: jest.fn(),
      enrollCandidate: jest.fn(),
      withdrawCandidate: jest.fn(),
      getEnrolledCandidates: jest.fn(),
      getWaitlistedCandidates: jest.fn(),
      getCandidateStatus: jest.fn()
    } as unknown as jest.Mocked<ExamSessionService>;

    // Create the controller with the mocked service
    controller = new ExamSessionController(mockService);
  });

  describe('createSession', () => {
    it('should return success response when session is created', async () => {
      const mockRequest = {
        body: {
          title: 'Mathematics Exam',
          duration: 120,
          maxCandidates: 30,
          startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString()
        }
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const mockResult = {
        success: true,
        message: 'Exam session created successfully',
        statusCode: 201,
        data: {
          id: 'session-123',
          title: 'Mathematics Exam',
          duration: 120,
          maxCandidates: 30,
          startTime: new Date(Date.now() + 1000 * 60 * 60),
          isEnrollmentClosed: false,
          enrolledCandidates: [],
          waitlist: [],
          proctors: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Mock the service method call
      mockService.createSession.mockResolvedValue(mockResult);

      await controller.createSession(mockRequest, mockResponse);

      expect(mockService.createSession).toHaveBeenCalledWith(
        'Mathematics Exam',
        120,
        30,
        new Date(mockRequest.body.startTime)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Exam session created successfully',
        data: expect.any(Object)
      });
    });

    it('should handle HttpError and return appropriate status', async () => {
      const mockRequest = {
        body: {
          title: 'Mathematics Exam',
          duration: 120,
          maxCandidates: 30,
          startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString()
        }
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const error = new HttpError('Bad request', 400);
      mockService.createSession.mockRejectedValue(error);

      await controller.createSession(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad request',
        data: null
      });
    });
  });
});