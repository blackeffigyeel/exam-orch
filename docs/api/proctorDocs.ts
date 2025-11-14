/**
 * @swagger
 * components:
 *   schemas:
 *     Proctor:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the proctor
 *         name:
 *           type: string
 *           description: Proctor's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Proctor's email address
 *         assignedSessions:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of session IDs the proctor is assigned to
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Proctors
 *   description: Proctor management endpoints
 */

/**
 * @swagger
 * /api/sessions/{id}/proctors:
 *   post:
 *     summary: Assign a proctor to a session
 *     tags: [Proctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proctorId
 *               - proctorName
 *               - proctorEmail
 *             properties:
 *               proctorId:
 *                 type: string
 *                 example: "PRO001"
 *               proctorName:
 *                 type: string
 *                 example: "Dr. Smith"
 *               proctorEmail:
 *                 type: string
 *                 format: email
 *                 example: "smith@university.edu"
 *     responses:
 *       200:
 *         description: Proctor assigned to session successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExamSession'
 *       400:
 *         description: Bad request (proctor already assigned, overlapping session)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Exam session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/sessions/{id}/proctors/{proctorId}:
 *   delete:
 *     summary: Remove a proctor from a session
 *     tags: [Proctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *       - in: path
 *         name: proctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Proctor ID
 *     responses:
 *       200:
 *         description: Proctor removed from session successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExamSession'
 *       400:
 *         description: Bad request (proctor not assigned to session)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Exam session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/sessions/{id}/proctors:
 *   get:
 *     summary: Get all proctors for a session
 *     tags: [Proctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *     responses:
 *       200:
 *         description: Proctors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Proctor'
 *       404:
 *         description: Exam session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/proctors/{proctorId}/sessions:
 *   get:
 *     summary: Get all sessions for a proctor
 *     tags: [Proctors]
 *     parameters:
 *       - in: path
 *         name: proctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Proctor ID
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ExamSession'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */