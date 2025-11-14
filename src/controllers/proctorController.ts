import { Request, Response } from 'express';
import { ProctorService } from '../services/proctorService';
import { HttpError } from '../errors/errors';

const proctorService = new ProctorService();

export class ProctorController {
  /**
   * @desc Assign a proctor to a session
   * @route POST /api/sessions/:id/proctors
   * @access Public
   * @return {Promise<Response>}
   */
  public assignProctorToSession = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { proctorId, proctorName, proctorEmail } = req.body;

      const result = await proctorService.assignProctorToSession(
        id,
        proctorId,
        proctorName,
        proctorEmail
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
   * @desc Remove a proctor from a session
   * @route DELETE /api/sessions/:id/proctors/:proctorId
   * @access Public
   * @return {Promise<Response>}
   */
  public removeProctorFromSession = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id, proctorId } = req.params;

      const result = await proctorService.removeProctorFromSession(id, proctorId);

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
   * @desc Get all proctors for a session
   * @route GET /api/sessions/:id/proctors
   * @access Public
   * @return {Promise<Response>}
   */
  public getProctorsForSession = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const result = await proctorService.getProctorsForSession(id);

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
   * @desc Get all sessions for a proctor
   * @route GET /proctors/:proctorId/sessions
   * @access Public
   * @return {Promise<Response>}
   */
  public getSessionsForProctor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { proctorId } = req.params;

      const result = await proctorService.getSessionsForProctor(proctorId);

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