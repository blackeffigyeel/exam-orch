import Joi from 'joi';

export const createSessionSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  duration: Joi.number().integer().min(1).required(),
  maxCandidates: Joi.number().integer().min(1).required(),
  startTime: Joi.date().iso().required()
});

export const enrollCandidateSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  studentId: Joi.string().min(3).max(50).required()
});

export const assignProctorSchema = Joi.object({
  proctorId: Joi.string().min(1).max(100).required(),
  proctorName: Joi.string().min(2).max(100).required(),
  proctorEmail: Joi.string().email().required()
});

export const sessionCloseEnrollmentSchema = Joi.object({
  id: Joi.string().required()
});