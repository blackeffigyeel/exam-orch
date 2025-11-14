import { Router } from 'express';
import { ExamSessionController } from '../controllers/examSessionController';
import { ProctorController } from '../controllers/proctorController';
import { validate } from '../middleware/validationMiddleware';
import {
  createSessionSchema,
  enrollCandidateSchema,
  assignProctorSchema
} from '../validators/examValidators';

const router = Router();

const examSessionController = new ExamSessionController();
const proctorController = new ProctorController();

// Exam Session routes
router.post('/sessions', validate(createSessionSchema), examSessionController.createSession);
router.get('/sessions', examSessionController.getAllSessions);
router.get('/sessions/:id', examSessionController.getSessionById);
router.patch('/sessions/:id/close-enrollment', examSessionController.closeEnrollment);

// Candidate enrollment routes
router.post('/sessions/:id/enroll', validate(enrollCandidateSchema), examSessionController.enrollCandidate);
router.delete('/sessions/:id/enroll/:studentId', examSessionController.withdrawCandidate);
router.get('/sessions/:id/candidates', examSessionController.getEnrolledCandidates);
router.get('/sessions/:id/waitlist', examSessionController.getWaitlistedCandidates);

// Candidate status route
router.get('/candidates/:studentId/status', examSessionController.getCandidateStatus);

// Proctor assignment routes
router.post('/sessions/:id/proctors', validate(assignProctorSchema), proctorController.assignProctorToSession);
router.delete('/sessions/:id/proctors/:proctorId', proctorController.removeProctorFromSession);
router.get('/sessions/:id/proctors', proctorController.getProctorsForSession);
router.get('/proctors/:proctorId/sessions', proctorController.getSessionsForProctor);

export default router;