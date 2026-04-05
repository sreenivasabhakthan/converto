import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRouter from './routes/upload';
import convertRouter from './routes/convert';
import downloadRouter from './routes/download';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/converted', express.static(path.join(__dirname, '../converted')));

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/convert', convertRouter);
app.use('/api/download', downloadRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Converto API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Converto server running on http://localhost:${PORT}`);
});

export default app;
