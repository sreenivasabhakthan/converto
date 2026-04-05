import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { convertFile } from '../services/converter';

const router = Router();

// Ensure converted dir exists
const convertedDir = path.join(__dirname, '../../converted');
if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../../uploads');

router.post('/', async (req: Request, res: Response) => {
  const { filename, outputFormat } = req.body as {
    filename: string;
    outputFormat: string;
  };

  if (!filename || !outputFormat) {
    res.status(400).json({ error: 'filename and outputFormat are required.' });
    return;
  }

  const inputPath = path.join(uploadsDir, filename);
  if (!fs.existsSync(inputPath)) {
    res.status(404).json({ error: 'Uploaded file not found. Please re-upload.' });
    return;
  }

  const inputExt = path.extname(filename).toLowerCase().replace('.', '');
  const fileId = path.basename(filename, path.extname(filename));
  const outputFilename = `${fileId}_converted.${outputFormat}`;
  const outputPath = path.join(convertedDir, outputFilename);

  try {
    await convertFile(inputPath, outputPath, inputExt, outputFormat);

    // Clean up uploaded file after conversion
    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      convertedFilename: outputFilename,
      downloadUrl: `/api/download/${outputFilename}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Conversion failed.';
    res.status(500).json({ error: message });
  }
});

export default router;
