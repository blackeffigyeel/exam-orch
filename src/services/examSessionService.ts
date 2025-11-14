import { v4 as uuidv4 } from 'uuid';
import {
  ExamSession,
  EnrolledCandidate,
  WaitlistedCandidate,
  CandidateStatus
} from '../types/exam';
import examStore from '../models/examStore';
import {
  BadRequestError,
  NotFoundError
} from '../errors/errors';

export class ExamSessionService {
  /**
   * Create a new exam session
   */
  public async createSession(
    title: string,
    duration: number,
    maxCandidates: number,
    startTime: Date
  ): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession }> {
    const session: ExamSession = {
      id: uuidv4(),
      title,
      duration,
      maxCandidates,
      startTime,
      isEnrollmentClosed: false,
      enrolledCandidates: [],
      waitlist: [],
      proctors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    examStore.addSession(session);

    return {
      success: true,
      message: 'Exam session created successfully',
      statusCode: 201,
      data: session
    };
  }

  /**
   * Get all exam sessions
   */
  public async getAllSessions(): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession[] }> {
    const sessions = examStore.getAllSessions();

    return {
      success: true,
      message: 'Sessions retrieved successfully',
      statusCode: 200,
      data: sessions
    };
  }

  /**
   * Get a specific exam session by ID
   */
  public async getSessionById(id: string): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession }> {
    const session = examStore.getSession(id);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    return {
      success: true,
      message: 'Session retrieved successfully',
      statusCode: 200,
      data: session
    };
  }

  /**
   * Close enrollment for a session
   */
  public async closeEnrollment(sessionId: string): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    if (session.isEnrollmentClosed) {
      throw new BadRequestError('Enrollment is already closed for this session');
    }

    examStore.updateSession(sessionId, { isEnrollmentClosed: true });

    return {
      success: true,
      message: 'Enrollment closed successfully',
      statusCode: 200,
      data: examStore.getSession(sessionId)!
    };
  }

  /**
   * Enroll a candidate in a session
   */
  public async enrollCandidate(
    sessionId: string,
    email: string,
    name: string,
    studentId: string
  ): Promise<{ success: boolean; message: string; statusCode: number; data: { status: string; position?: number } }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    if (session.isEnrollmentClosed) {
      throw new BadRequestError('Enrollment is closed for this session');
    }

    // Check if candidate is already enrolled in this session
    const isAlreadyEnrolled = session.enrolledCandidates.some(c => c.studentId === studentId);
    if (isAlreadyEnrolled) {
      throw new BadRequestError('Candidate is already enrolled in this session');
    }

    // Check if candidate is already waitlisted for this session
    const isAlreadyWaitlisted = session.waitlist.some(c => c.studentId === studentId);
    if (isAlreadyWaitlisted) {
      throw new BadRequestError('Candidate is already on the waitlist for this session');
    }

    // Check for overlapping sessions for the same candidate
    const existingSession = examStore.getSessionByCandidate(studentId);
    if (existingSession) {
      const existingEnd = new Date(existingSession.startTime.getTime() + existingSession.duration * 60000);
      const newEnd = new Date(session.startTime.getTime() + session.duration * 60000);

      // Check for overlap: (start1 < end2) AND (start2 < end1)
      if (
        session.startTime < existingEnd &&
        existingSession.startTime < newEnd
      ) {
        throw new BadRequestError('Candidate already enrolled in an overlapping exam session');
      }
    }

    const candidate: EnrolledCandidate = {
      studentId,
      email,
      name,
      enrollmentTimestamp: new Date()
    };

    // If session is not full, add to enrolled candidates
    if (session.enrolledCandidates.length < session.maxCandidates) {
      const updatedEnrolled = [...session.enrolledCandidates, candidate];
      examStore.updateSession(sessionId, { enrolledCandidates: updatedEnrolled });

      return {
        success: true,
        message: 'Candidate enrolled successfully',
        statusCode: 200,
        data: { status: 'enrolled' }
      };
    } else {
      // Otherwise, add to waitlist
      const waitlistPosition = session.waitlist.length + 1;
      const waitlistedCandidate: WaitlistedCandidate = {
        studentId,
        email,
        name,
        waitlistPosition,
        enrollmentTimestamp: new Date()
      };

      const updatedWaitlist = [...session.waitlist, waitlistedCandidate];
      examStore.updateSession(sessionId, { waitlist: updatedWaitlist });

      return {
        success: true,
        message: 'Candidate added to waitlist',
        statusCode: 200,
        data: { status: 'waitlisted', position: waitlistPosition }
      };
    }
  }

  /**
   * Withdraw a candidate from a session
   */
  public async withdrawCandidate(
    sessionId: string,
    studentId: string
  ): Promise<{ success: boolean; message: string; statusCode: number; data: null }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    // Check if session has started
    if (session.startTime < new Date()) {
      throw new BadRequestError('Cannot withdraw from a session that has already started');
    }

    // Remove from enrolled candidates
    const updatedEnrolled = session.enrolledCandidates.filter(c => c.studentId !== studentId);
    const wasEnrolled = updatedEnrolled.length !== session.enrolledCandidates.length;

    // Remove from waitlist
    const updatedWaitlist = session.waitlist.filter(c => c.studentId !== studentId);
    const wasWaitlisted = updatedWaitlist.length !== session.waitlist.length;

    if (!wasEnrolled && !wasWaitlisted) {
      throw new BadRequestError('Candidate not found in this session');
    }

    examStore.updateSession(sessionId, {
      enrolledCandidates: updatedEnrolled,
      waitlist: updatedWaitlist
    });

    // Auto-allocate seat from waitlist if someone was enrolled
    if (wasEnrolled && session.waitlist.length > 0) {
      this.autoAllocateSeat(sessionId);
    }

    const action = wasEnrolled ? 'enrolled' : 'waitlisted';
    return {
      success: true,
      message: `Candidate withdrawn from ${action} list successfully`,
      statusCode: 200,
      data: null
    };
  }

  /**
   * Get enrolled candidates for a session
   */
  public async getEnrolledCandidates(sessionId: string): Promise<{ success: boolean; message: string; statusCode: number; data: EnrolledCandidate[] }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    return {
      success: true,
      message: 'Enrolled candidates retrieved successfully',
      statusCode: 200,
      data: session.enrolledCandidates
    };
  }

  /**
   * Get waitlisted candidates for a session
   */
  public async getWaitlistedCandidates(sessionId: string): Promise<{ success: boolean; message: string; statusCode: number; data: WaitlistedCandidate[] }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    return {
      success: true,
      message: 'Waitlisted candidates retrieved successfully',
      statusCode: 200,
      data: session.waitlist
    };
  }

  /**
   * Get candidate status across all sessions
   */
  public async getCandidateStatus(studentId: string): Promise<{ success: boolean; message: string; statusCode: number; data: CandidateStatus }> {
    const session = examStore.getSessionByCandidate(studentId);

    if (!session) {
      return {
        success: true,
        message: 'Candidate status retrieved successfully',
        statusCode: 200,
        data: {
          studentId,
          status: 'not_enrolled'
        }
      };
    }

    const enrolledCandidate = session.enrolledCandidates.find(c => c.studentId === studentId);
    if (enrolledCandidate) {
      return {
        success: true,
        message: 'Candidate status retrieved successfully',
        statusCode: 200,
        data: {
          studentId,
          status: 'enrolled',
          sessionId: session.id,
          sessionTitle: session.title,
          enrollmentTimestamp: enrolledCandidate.enrollmentTimestamp
        }
      };
    }

    const waitlistedCandidate = session.waitlist.find(c => c.studentId === studentId);
    if (waitlistedCandidate) {
      return {
        success: true,
        message: 'Candidate status retrieved successfully',
        statusCode: 200,
        data: {
          studentId,
          status: 'waitlisted',
          sessionId: session.id,
          sessionTitle: session.title,
          waitlistPosition: waitlistedCandidate.waitlistPosition
        }
      };
    }

    // This shouldn't happen given the logic above, but just in case
    return {
      success: true,
      message: 'Candidate status retrieved successfully',
      statusCode: 200,
      data: {
        studentId,
        status: 'not_enrolled'
      }
    };
  }

  /**
   * Auto-allocate seat from waitlist when a seat becomes available
   */
  private autoAllocateSeat(sessionId: string): void {
    const session = examStore.getSession(sessionId);

    if (!session || session.waitlist.length === 0) {
      return;
    }

    // Get the first person on the waitlist
    const [firstWaitlisted] = session.waitlist;
    const remainingWaitlist = session.waitlist.slice(1);

    // Add to enrolled candidates
    const enrolledCandidate: EnrolledCandidate = {
      studentId: firstWaitlisted.studentId,
      email: firstWaitlisted.email,
      name: firstWaitlisted.name,
      enrollmentTimestamp: firstWaitlisted.enrollmentTimestamp
    };

    // Update the session
    examStore.updateSession(sessionId, {
      enrolledCandidates: [...session.enrolledCandidates, enrolledCandidate],
      waitlist: remainingWaitlist
    });

    // Log the allocation
    console.log(`Seat automatically allocated to ${firstWaitlisted.name} (${firstWaitlisted.studentId}) from waitlist for session ${sessionId}`);

    // Re-adjust waitlist positions
    this.recalculateWaitlistPositions(sessionId);
  }

  /**
   * Recalculate waitlist positions after changes
   */
  private recalculateWaitlistPositions(sessionId: string): void {
    const session = examStore.getSession(sessionId);

    if (!session) {
      return;
    }

    const updatedWaitlist = session.waitlist.map((candidate, index) => ({
      ...candidate,
      waitlistPosition: index + 1
    }));

    examStore.updateSession(sessionId, { waitlist: updatedWaitlist });
  }
}