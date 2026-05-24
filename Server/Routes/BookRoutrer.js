const express = require('express');
const BookController = require('../Controllers/BookController');

const BookRouter = express.Router();

BookRouter.get('/code/:bookCode', BookController.getBookByCode);
BookRouter.get('/:id', BookController.getBookById);
BookRouter.get('/', BookController.getAllBooks);
BookRouter.delete('/:bookCode', BookController.deleteBook);
BookRouter.put('/:id', BookController.updateBook);
BookRouter.post('/', BookController.addNewBook);

module.exports = BookRouter;