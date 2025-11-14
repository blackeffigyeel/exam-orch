export interface ExamSession {
  id: string;
  title: string;
  duration: number; // in minutes
  maxCandidates: number;
  startTime: Date;
  isEnrollmentClosed: boolean;
  enrolledCandidates: EnrolledCandidate[];
  waitlist: WaitlistedCandidate[];
  proctors: string[]; // proctor IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrolledCandidate {
  studentId: string;
  email: string;
  name: string;
  enrollmentTimestamp: Date;
}

export interface WaitlistedCandidate {
  studentId: string;
  email: string;
  name: string;
  waitlistPosition: number;
  enrollmentTimestamp: Date;
}

export interface Proctor {
  id: string;
  name: string;
  email: string;
  assignedSessions: string[]; // session IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateStatus {
  studentId: string;
  status: 'enrolled' | 'waitlisted' | 'not_enrolled';
  sessionId?: string;
  sessionTitle?: string;
  enrollmentTimestamp?: Date;
  waitlistPosition?: number;
}