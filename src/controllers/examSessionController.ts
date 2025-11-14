import { Request, Response } from 'express';
import { ExamSessionService } from '../services/examSessionService';
import { HttpError } from '../errors/errors';

const examSessionService = new ExamSessionService();

/**
 * @desc Controller for managing exam sessions.
 */
export class ExamSessionController {
    private examSessionService: ExamSessionService;

    constructor(service?: ExamSessionService) {
        this.examSessionService = service || new ExamSessionService();
    }

    /**
     * @desc Create a new exam session
     * @route POST /api/sessions
     * @access Public
     * @return {Promise<Response>}
     */
    public createSession = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { title, duration, maxCandidates, startTime } = req.body;

            const result = await examSessionService.createSession(
                title,
                duration,
                maxCandidates,
                new Date(startTime)
            );

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Get all exam sessions
     * @route GET /api/sessions
     * @access Public
     * @return {Promise<Response>}
     */
    public getAllSessions = async (req: Request, res: Response): Promise<Response> => {
        try {
            const result = await examSessionService.getAllSessions();

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Get a specific exam session by ID
     * @route GET /api/sessions/:id
     * @access Public
     * @return {Promise<Response>}
     */
    public getSessionById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            const result = await examSessionService.getSessionById(id);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Close enrollment for a session
     * @route PATCH /api/sessions/:id/close-enrollment
     * @access Public
     * @return {Promise<Response>}
     */
    public closeEnrollment = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            const result = await examSessionService.closeEnrollment(id);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Enroll a candidate in a session
     * @route POST /api/sessions/:id/enroll
     * @access Public
     * @return {Promise<Response>}
     */
    public enrollCandidate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { email, name, studentId } = req.body;

            const result = await examSessionService.enrollCandidate(
                id,
                email,
                name,
                studentId
            );

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Withdraw a candidate from a session
     * @route DELETE /api/sessions/:id/enroll/:studentId
     * @access Public
     * @return {Promise<Response>}
     */
    public withdrawCandidate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id, studentId } = req.params;

            const result = await examSessionService.withdrawCandidate(id, studentId);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Get enrolled candidates for a session
     * @route GET /api/sessions/:id/candidates
     * @access Public
     * @return {Promise<Response>}
     */
    public getEnrolledCandidates = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            const result = await examSessionService.getEnrolledCandidates(id);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Get waitlisted candidates for a session
     * @route GET /api/sessions/:id/waitlist
     * @access Public
     * @return {Promise<Response>}
     */
    public getWaitlistedCandidates = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            const result = await examSessionService.getWaitlistedCandidates(id);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };

    /**
     * @desc Get candidate status across all sessions
     * @route GET /api/candidates/:studentId/status
     * @access Public
     * @return {Promise<Response>}
     */
    public getCandidateStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { studentId } = req.params;

            const result = await examSessionService.getCandidateStatus(studentId);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    data: null
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    };
}