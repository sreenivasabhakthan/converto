import { Router, Request, Response } from 'express';
import { upload, handleMulterError } from '../middleware/upload';
import path from 'path';
import { getCompatibleFormats } from '../services/converter';

const router = Router();

router.post(
  '/',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
      } else {
        next();
      }
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const compatibleFormats = getCompatibleFormats(ext);

    res.json({
      success: true,
      fileId: path.basename(req.file.filename, path.extname(req.file.filename)),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      detectedFormat: ext,
      compatibleFormats,
    });
  }
);

export default router;
