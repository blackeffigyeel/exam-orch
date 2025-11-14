import { ExamSession, Proctor } from '../types/exam';

// In-memory data store for exam sessions and proctors
class ExamStore {
  private sessions: Map<string, ExamSession> = new Map();
  private proctors: Map<string, Proctor> = new Map();

  // Session operations
  public addSession(session: ExamSession): void {
    this.sessions.set(session.id, session);
  }

  public getSession(id: string): ExamSession | undefined {
    return this.sessions.get(id);
  }

  public getAllSessions(): ExamSession[] {
    return Array.from(this.sessions.values());
  }

  public updateSession(id: string, updates: Partial<ExamSession>): void {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, ...updates, updatedAt: new Date() });
    }
  }

  public deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  // Proctor operations
  public addProctor(proctor: Proctor): void {
    this.proctors.set(proctor.id, proctor);
  }

  public getProctor(id: string): Proctor | undefined {
    return this.proctors.get(id);
  }

  public getAllProctors(): Proctor[] {
    return Array.from(this.proctors.values());
  }

  public updateProctor(id: string, updates: Partial<Proctor>): void {
    const proctor = this.proctors.get(id);
    if (proctor) {
      this.proctors.set(id, { ...proctor, ...updates, updatedAt: new Date() });
    }
  }

  public removeProctor(id: string): boolean {
    return this.proctors.delete(id);
  }

  // Utility methods
  public getSessionByCandidate(studentId: string): ExamSession | undefined {
    for (const session of this.sessions.values()) {
      const isEnrolled = session.enrolledCandidates.some(c => c.studentId === studentId);
      const isWaitlisted = session.waitlist.some(c => c.studentId === studentId);
      if (isEnrolled || isWaitlisted) {
        return session;
      }
    }
    return undefined;
  }

  public getSessionsByProctor(proctorId: string): ExamSession[] {
    return this.getAllSessions().filter(session => session.proctors.includes(proctorId));
  }

  public clear(): void {
    this.sessions.clear();
    this.proctors.clear();
  }
}

export default new ExamStore();