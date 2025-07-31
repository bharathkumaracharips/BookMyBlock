const express = require('express')
const EventController = require('../controllers/eventController')

const router = express.Router()

// Event routes
router.post('/', EventController.createEvent)                    // POST /api/events
router.get('/theater/:theaterId', EventController.getTheaterEvents) // GET /api/events/theater/:theaterId
router.get('/user', EventController.getUserEvents)              // GET /api/events/user?userId=...
router.get('/stats', EventController.getEventStats)             // GET /api/events/stats?userId=...
router.get('/:eventId', EventController.getEventById)           // GET /api/events/:eventId
router.put('/:eventId', EventController.updateEvent)            // PUT /api/events/:eventId
router.delete('/:eventId', EventController.deleteEvent)         // DELETE /api/events/:eventId
router.patch('/:eventId/cancel', EventController.cancelEvent)   // PATCH /api/events/:eventId/cancel

module.exports = router