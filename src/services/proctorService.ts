import { ExamSession, Proctor } from '../types/exam';
import examStore from '../models/examStore';
import {
  BadRequestError,
  NotFoundError
} from '../errors/errors';

export class ProctorService {
  /**
   * Assign a proctor to a session
   */
  public async assignProctorToSession(
    sessionId: string,
    proctorId: string,
    proctorName: string,
    proctorEmail: string
  ): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    // Check if proctor is already assigned to this session
    if (session.proctors.includes(proctorId)) {
      throw new BadRequestError('Proctor is already assigned to this session');
    }

    // Check for overlapping sessions for the proctor
    const proctor = examStore.getProctor(proctorId);
    if (proctor) {
      // Check if proctor is assigned to any overlapping sessions
      const assignedSessions = examStore.getSessionsByProctor(proctorId);
      const newEnd = new Date(session.startTime.getTime() + session.duration * 60000);

      for (const assignedSession of assignedSessions) {
        const assignedEnd = new Date(assignedSession.startTime.getTime() + assignedSession.duration * 60000);

        // Check for overlap: (start1 < end2) AND (start2 < end1)
        if (
          session.startTime < assignedEnd &&
          assignedSession.startTime < newEnd
        ) {
          throw new BadRequestError('Proctor is assigned to an overlapping exam session');
        }
      }
    } else {
      // Create new proctor if doesn't exist
      const newProctor: Proctor = {
        id: proctorId,
        name: proctorName,
        email: proctorEmail,
        assignedSessions: [sessionId],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      examStore.addProctor(newProctor);
    }

    // Add proctor to session
    const updatedProctors = [...session.proctors, proctorId];
    examStore.updateSession(sessionId, { proctors: updatedProctors });

    // Update proctor's assigned sessions
    if (proctor) {
      const updatedAssignedSessions = [...proctor.assignedSessions, sessionId];
      examStore.updateProctor(proctorId, { assignedSessions: updatedAssignedSessions });
    }

    return {
      success: true,
      message: 'Proctor assigned to session successfully',
      statusCode: 200,
      data: examStore.getSession(sessionId)!
    };
  }

  /**
   * Remove a proctor from a session
   */
  public async removeProctorFromSession(
    sessionId: string,
    proctorId: string
  ): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    if (!session.proctors.includes(proctorId)) {
      throw new BadRequestError('Proctor is not assigned to this session');
    }

    // Remove proctor from session
    const updatedProctors = session.proctors.filter(id => id !== proctorId);
    examStore.updateSession(sessionId, { proctors: updatedProctors });

    // Remove session from proctor's assigned sessions
    const proctor = examStore.getProctor(proctorId);
    if (proctor) {
      const updatedAssignedSessions = proctor.assignedSessions.filter(id => id !== sessionId);
      examStore.updateProctor(proctorId, { assignedSessions: updatedAssignedSessions });
    }

    return {
      success: true,
      message: 'Proctor removed from session successfully',
      statusCode: 200,
      data: examStore.getSession(sessionId)!
    };
  }

  /**
   * Get all proctors for a session
   */
  public async getProctorsForSession(sessionId: string): Promise<{ success: boolean; message: string; statusCode: number; data: Proctor[] }> {
    const session = examStore.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Exam session not found');
    }

    const proctors = session.proctors.map(proctorId => {
      const proctor = examStore.getProctor(proctorId);
      if (!proctor) {
        throw new NotFoundError(`Proctor with ID ${proctorId} not found`);
      }
      return proctor;
    });

    return {
      success: true,
      message: 'Proctors retrieved successfully',
      statusCode: 200,
      data: proctors
    };
  }

  /**
   * Get all sessions for a proctor
   */
  public async getSessionsForProctor(proctorId: string): Promise<{ success: boolean; message: string; statusCode: number; data: ExamSession[] }> {
    const sessions = examStore.getSessionsByProctor(proctorId);

    return {
      success: true,
      message: 'Sessions retrieved successfully',
      statusCode: 200,
      data: sessions
    };
  }
}