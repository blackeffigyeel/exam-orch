import { describe, it, expect, beforeEach } from '@jest/globals';
import { ExamSessionService } from '../../src/services/examSessionService';
import examStore from '../../src/models/examStore';
import { BadRequestError, NotFoundError } from '../../src/errors/errors';

describe('ExamSessionService', () => {
  let service: ExamSessionService;

  beforeEach(() => {
    service = new ExamSessionService();
    examStore.clear(); // Clear the in-memory store before each test
  });

  describe('createSession', () => {
    it('should create a new exam session successfully', async () => {
      const result = await service.createSession(
        'Mathematics Exam',
        120,
        30,
        new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
      );

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Mathematics Exam');
      expect(result.data.duration).toBe(120);
      expect(result.data.maxCandidates).toBe(30);
      expect(result.data.isEnrollmentClosed).toBe(false);
      expect(result.data.enrolledCandidates).toHaveLength(0);
      expect(result.data.waitlist).toHaveLength(0);
      expect(result.data.proctors).toHaveLength(0);
    });
  });

  describe('getSessionById', () => {
    it('should return session if it exists', async () => {
      const createResult = await service.createSession(
        'Physics Exam',
        90,
        25,
        new Date(Date.now() + 1000 * 60 * 60)
      );

      const session = await service.getSessionById(createResult.data.id);

      expect(session.success).toBe(true);
      expect(session.data.title).toBe('Physics Exam');
    });

    it('should throw NotFoundError if session does not exist', async () => {
      await expect(service.getSessionById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('enrollCandidate', () => {
    it('should enroll candidate when session has capacity', async () => {
      const sessionResult = await service.createSession(
        'Chemistry Exam',
        120,
        1, // Only 1 capacity
        new Date(Date.now() + 1000 * 60 * 60)
      );

      const enrollResult = await service.enrollCandidate(
        sessionResult.data.id,
        'john@example.com',
        'John Doe',
        'STU001'
      );

      expect(enrollResult.success).toBe(true);
      expect(enrollResult.data.status).toBe('enrolled');
    });

    it('should add candidate to waitlist when session is full', async () => {
      const sessionResult = await service.createSession(
        'Biology Exam',
        120,
        1, // Only 1 capacity
        new Date(Date.now() + 1000 * 60 * 60)
      );

      // Enroll first candidate
      await service.enrollCandidate(
        sessionResult.data.id,
        'john@example.com',
        'John Doe',
        'STU001'
      );

      // Try to enroll second candidate (should go to waitlist)
      const enrollResult = await service.enrollCandidate(
        sessionResult.data.id,
        'jane@example.com',
        'Jane Smith',
        'STU002'
      );

      expect(enrollResult.success).toBe(true);
      expect(enrollResult.data.status).toBe('waitlisted');
      expect(enrollResult.data.position).toBe(1);
    });

    it('should throw BadRequestError if candidate is already enrolled', async () => {
      const sessionResult = await service.createSession(
        'History Exam',
        120,
        30,
        new Date(Date.now() + 1000 * 60 * 60)
      );

      // Enroll candidate first time
      await service.enrollCandidate(
        sessionResult.data.id,
        'john@example.com',
        'John Doe',
        'STU001'
      );

      // Try to enroll same candidate again
      await expect(
        service.enrollCandidate(
          sessionResult.data.id,
          'john@example.com',
          'John Doe',
          'STU001'
        )
      ).rejects.toThrow(BadRequestError);
    });
  });
});