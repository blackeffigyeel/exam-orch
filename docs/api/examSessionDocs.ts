/**
 * @swagger
 * components:
 *   schemas:
 *     ExamSession:
 *       type: object
 *       required:
 *         - title
 *         - duration
 *         - maxCandidates
 *         - startTime
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique ID of the exam session
 *         title:
 *           type: string
 *           description: Title of the exam session
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *         maxCandidates:
 *           type: integer
 *           description: Maximum number of candidates allowed
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the exam session
 *         isEnrollmentClosed:
 *           type: boolean
 *           description: Whether enrollment is closed for this session
 *         enrolledCandidates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnrolledCandidate'
 *         waitlist:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WaitlistedCandidate'
 *         proctors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of proctor IDs assigned to this session
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     EnrolledCandidate:
 *       type: object
 *       required:
 *         - studentId
 *         - email
 *         - name
 *       properties:
 *         studentId:
 *           type: string
 *           description: Unique identifier for the student
 *         email:
 *           type: string
 *           format: email
 *           description: Candidate's email address
 *         name:
 *           type: string
 *           description: Candidate's full name
 *         enrollmentTimestamp:
 *           type: string
 *           format: date-time
 *           description: When the candidate was enrolled
 * 
 *     WaitlistedCandidate:
 *       type: object
 *       required:
 *         - studentId
 *         - email
 *         - name
 *       properties:
 *         studentId:
 *           type: string
 *           description: Unique identifier for the student
 *         email:
 *           type: string
 *           format: email
 *           description: Candidate's email address
 *         name:
 *           type: string
 *           description: Candidate's full name
 *         waitlistPosition:
 *           type: integer
 *           description: Position in the waitlist (1-based)
 *         enrollmentTimestamp:
 *           type: string
 *           format: date-time
 *           description: When the candidate was added to waitlist
 * 
 *     CandidateStatus:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [enrolled, waitlisted, not_enrolled]
 *         sessionId:
 *           type: string
 *         sessionTitle:
 *           type: string
 *         enrollmentTimestamp:
 *           type: string
 *           format: date-time
 *         waitlistPosition:
 *           type: integer
 * 
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 *           example: null
 */

/**
 * @swagger
 * tags:
 *   name: Exam Sessions
 *   description: Exam session management endpoints
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new exam session
 *     tags: [Exam Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *               - maxCandidates
 *               - startTime
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Final Mathematics Exam"
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 120
 *               maxCandidates:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T09:00:00Z"
 *     responses:
 *       201:
 *         description: Exam session created successfully
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
 *         description: Bad request
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
 * /api/sessions:
 *   get:
 *     summary: Get all exam sessions
 *     tags: [Exam Sessions]
 *     responses:
 *       200:
 *         description: List of all exam sessions retrieved successfully
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

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get a specific exam session by ID
 *     tags: [Exam Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *     responses:
 *       200:
 *         description: Exam session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExamSession'
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
 * /api/sessions/{id}/close-enrollment:
 *   patch:
 *     summary: Close enrollment for a session
 *     tags: [Exam Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *     responses:
 *       200:
 *         description: Enrollment closed successfully
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
 *         description: Enrollment is already closed
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
 * /api/sessions/{id}/enroll:
 *   post:
 *     summary: Enroll a candidate in a session
 *     tags: [Exam Sessions]
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
 *               - email
 *               - name
 *               - studentId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "student@university.edu"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               studentId:
 *                 type: string
 *                 example: "STU12345"
 *     responses:
 *       200:
 *         description: Candidate enrolled or added to waitlist
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [enrolled, waitlisted]
 *                         position:
 *                           type: integer
 *                           description: Waitlist position (only for waitlisted)
 *       400:
 *         description: Bad request (enrollment closed, already enrolled, overlapping session, etc.)
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
 * /api/sessions/{id}/enroll/{studentId}:
 *   delete:
 *     summary: Withdraw a candidate from a session
 *     tags: [Exam Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Candidate withdrawn successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request (session started, candidate not found)
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
 * /api/sessions/{id}/candidates:
 *   get:
 *     summary: Get enrolled candidates for a session
 *     tags: [Exam Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *     responses:
 *       200:
 *         description: Enrolled candidates retrieved successfully
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
 *                         $ref: '#/components/schemas/EnrolledCandidate'
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
 * /api/sessions/{id}/waitlist:
 *   get:
 *     summary: Get waitlisted candidates for a session
 *     tags: [Exam Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam session ID
 *     responses:
 *       200:
 *         description: Waitlisted candidates retrieved successfully
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
 *                         $ref: '#/components/schemas/WaitlistedCandidate'
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
 * /api/candidates/{studentId}/status:
 *   get:
 *     summary: Get candidate status across all sessions
 *     tags: [Exam Sessions]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Candidate status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CandidateStatus'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */