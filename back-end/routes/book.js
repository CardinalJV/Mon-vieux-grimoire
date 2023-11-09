const express = require('express');
const router = express.Router();
const bookControllers = require('../controllers/book');
const auth = require('../middleware/auth');

// Create
router.post('/', auth, bookControllers.createBook);
router.post('/:id/rating', auth, bookControllers.createRatingBook);
// Read
router.get('/', bookControllers.getAllBook);
router.get('/:id', bookControllers.getOneBook);
router.get('/bestrating', bookControllers.getBooksWithBestRating);
// Update
router.put('/:id', auth, bookControllers.updateOneBook);
// Delete
router.delete('/:id', auth, bookControllers.deleteOneBook);

module.exports = router;