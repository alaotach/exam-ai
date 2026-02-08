import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import zlib from 'zlib';
import { promisify } from 'util';

const router = Router();
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const DATA_ROOT = path.resolve(__dirname, '../../../');
const PYTHON_SCRIPT = path.join(DATA_ROOT, 'generate_ai_answers.py');
const ANSWERS_DIR = path.join(DATA_ROOT, 'ai_generated_answers');

// In-memory queue for tracking generation status
// In production, use Redis or a database
const generationQueue: Map<string, {
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  testId: string;
  testFilePath: string;
  progress: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}> = new Map();

/**
 * POST /api/answers/generate - Trigger answer generation for a test
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { testId, testFilePath } = req.body;

    if (!testId || !testFilePath) {
      return res.status(400).json({ error: 'testId and testFilePath are required' });
    }

    // Check if already in queue or completed
    if (generationQueue.has(testId)) {
      const existing = generationQueue.get(testId)!;
      return res.json({
        testId,
        status: existing.status,
        message: 'Answer generation already in progress or completed'
      });
    }

    // Check if answers already exist (both .json and .json.gz)
    const answerFileName = path.basename(testFilePath).replace('.json.gz', '.json');
    const answerFilePath = path.join(ANSWERS_DIR, answerFileName);
    const answerFilePathGz = path.join(ANSWERS_DIR, answerFileName + '.gz');

    if (fs.existsSync(answerFilePath) || fs.existsSync(answerFilePathGz)) {
      return res.json({
        testId,
        status: 'completed',
        message: 'Answers already exist',
        answersAvailable: true
      });
    }

    // Add to queue
    generationQueue.set(testId, {
      status: 'pending',
      testId,
      testFilePath,
      progress: 0,
      startedAt: new Date().toISOString()
    });

    // Start background generation (don't await)
    generateAnswersInBackground(testId, testFilePath);

    res.json({
      testId,
      status: 'pending',
      message: 'Answer generation queued successfully',
      estimatedTime: '2-5 minutes'
    });

  } catch (error: any) {
    console.error('Error queueing answer generation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/answers/status/:testId - Check generation status
 */
router.get('/status/:testId', (req: Request, res: Response) => {
  try {
    const { testId } = req.params;

    const status = generationQueue.get(testId);
    
    // Check if status not in queue - check for completed files (both .json and .json.gz)
    if (!status) {
      const testFileName = `${testId}.json`;
      const answerFilePath = path.join(ANSWERS_DIR, testFileName);
      const answerFilePathGz = path.join(ANSWERS_DIR, testFileName + '.gz');
      
      if (fs.existsSync(answerFilePath) || fs.existsSync(answerFilePathGz)) {
        return res.json({
          testId,
          status: 'completed',
          progress: 100,
          answersAvailable: true
        });
      }

      return res.status(404).json({
        testId,
        status: 'not-found',
        message: 'Answer generation not started'
      });
    }

    res.json({
      testId,
      ...status,
      answersAvailable: status.status === 'completed'
    });

  } catch (error: any) {
    console.error('Error checking generation status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/answers/:testFileName - Get generated answers (supports both .json and .json.gz)
 */
router.get('/:testFileName', async (req: Request, res: Response) => {
  try {
    const { testFileName } = req.params;
    const answerFilePath = path.join(ANSWERS_DIR, testFileName);
    const answerFilePathGz = path.join(ANSWERS_DIR, testFileName + '.gz');

    let filePath: string;
    let needsDecompression = false;

    // Check for compressed file first
    if (fs.existsSync(answerFilePathGz)) {
      filePath = answerFilePathGz;
      needsDecompression = true;
    } else if (fs.existsSync(answerFilePath)) {
      filePath = answerFilePath;
    } else {
      return res.status(404).json({ error: 'Answers not found' });
    }

    res.setHeader('Content-Type', 'application/json');

    if (needsDecompression) {
      // Read, decompress and send
      const compressedData = fs.readFileSync(filePath);
      const decompressedData = await gunzip(compressedData);
      res.send(decompressedData);
    } else {
      // Stream uncompressed file
      fs.createReadStream(filePath).pipe(res);
    }

  } catch (error: any) {
    console.error('Error serving answers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Background answer generation using Python script
 */
async function generateAnswersInBackground(testId: string, testFilePath: string) {
  const queueItem = generationQueue.get(testId);
  if (!queueItem) return;

  try {
    queueItem.status = 'in-progress';
    queueItem.progress = 10;

    // Ensure answers directory exists
    if (!fs.existsSync(ANSWERS_DIR)) {
      fs.mkdirSync(ANSWERS_DIR, { recursive: true });
    }

    // Create a temporary file with just this test for processing
    const tempTestFile = path.join(DATA_ROOT, 'temp', `temp_${testId}.json`);
    const tempDir = path.dirname(tempTestFile);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Copy test file to temp location
    fs.copyFileSync(testFilePath, tempTestFile);

    // Run Python script for this specific test
    const pythonProcess = spawn('python', [
      PYTHON_SCRIPT,
      '--file', tempTestFile
    ]);

    let output = '';
    let errorOutput = '';

    // Update progress based on output
    pythonProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Processing')) {
        queueItem.progress = 30;
      } else if (data.toString().includes('Section:')) {
        queueItem.progress = Math.min(queueItem.progress + 10, 80);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`[Answer Gen Error ${testId}]:`, data.toString().trim());
    });

    pythonProcess.on('close', async (code) => {
      // Clean up temp file
      if (fs.existsSync(tempTestFile)) {
        fs.unlinkSync(tempTestFile);
      }

      if (code === 0) {
        // Compress the generated answer file
        const answerFileName = `${testId}.json`;
        const answerFilePath = path.join(ANSWERS_DIR, answerFileName);
        const answerFilePathGz = path.join(ANSWERS_DIR, answerFileName + '.gz');

        try {
          if (fs.existsSync(answerFilePath)) {
            // Read the JSON file
            const jsonData = fs.readFileSync(answerFilePath);
            // Compress it
            const compressed = await gzip(jsonData);
            // Write compressed file
            fs.writeFileSync(answerFilePathGz, compressed);
            // Delete original uncompressed file
            fs.unlinkSync(answerFilePath);
            console.log(`📦 Compressed answer file: ${answerFileName}.gz`);
          }
        } catch (compressError) {
          console.error(`Failed to compress answer file for ${testId}:`, compressError);
          // Continue anyway, file exists uncompressed
        }

        queueItem.status = 'completed';
        queueItem.progress = 100;
        queueItem.completedAt = new Date().toISOString();
        console.log(`✅ Answer generation completed for ${testId}`);
      } else {
        queueItem.status = 'failed';
        queueItem.error = errorOutput || 'Unknown error';
        queueItem.completedAt = new Date().toISOString();
        console.error(`❌ Answer generation failed for ${testId}:`, errorOutput);
      }
    });

  } catch (error: any) {
    console.error(`Error in background generation for ${testId}:`, error);
    queueItem.status = 'failed';
    queueItem.error = error.message;
    queueItem.completedAt = new Date().toISOString();
  }
}

export default router;
