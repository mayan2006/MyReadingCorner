const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const { sanitizeRequest } = require('./middleware/sanitize');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://myreadingcorner-1.onrender.com',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
];

app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const bookRouter = require('./Routes/BookRoutrer');
app.use('/books', bookRouter);
const categoryRouter = require('./Routes/CategoryRouter');
app.use('/category', categoryRouter);
const freeWritingRouter = require('./Routes/FreeWritingRouter');
app.use('/FreeWriting', freeWritingRouter);
const markedBookRouter = require('./Routes/MarkedBookRouter');
app.use('/markedBook', markedBookRouter);
const subjectRouter = require('./Routes/SubjectRouter');
app.use('/subject', subjectRouter);
const userRouter = require('./Routes/UserRouter');
app.use('/user', userRouter);
const ratingRouter = require('./Routes/RatingRouter');
app.use('/rating', ratingRouter);
const bookLikeRouter = require('./Routes/BookLikeRouter');
app.use('/bookLike', bookLikeRouter);
const bookResponseRouter = require('./Routes/BookResponseRouter');
app.use('/bookResponse', bookResponseRouter);

app.use(errorHandler);

module.exports = app;
