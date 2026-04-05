import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const convertedDir = path.join(__dirname, '../../converted');

router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params['filename'] as string;

  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(convertedDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found or already deleted.' });
    return;
  }

  res.download(filePath, safeFilename, (err) => {
    if (!err) {
      // Delete after download
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
  });
});

export default router;
