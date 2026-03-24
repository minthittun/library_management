import express from 'express';
import cors from 'cors';
import bookRoutes from './routes/book.routes.js';
import memberRoutes from './routes/member.routes.js';
import borrowRoutes from './routes/borrow.routes.js';
import saleRoutes from './routes/sale.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api', bookRoutes);
app.use('/api', memberRoutes);
app.use('/api', borrowRoutes);
app.use('/api', saleRoutes);
app.use('/api', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
