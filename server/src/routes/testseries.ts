import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const router = Router();
const gunzip = promisify(zlib.gunzip);

// Root directory containing testseries folder
const DATA_ROOT = path.resolve(__dirname, '../../../');
const TESTSERIES_DIR = path.join(DATA_ROOT, 'testseries');

/**
 * GET /api/testseries - List all test series with their sections
 */
router.get('/', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(TESTSERIES_DIR)) {
      return res.status(500).json({ error: 'Testseries directory not found', path: TESTSERIES_DIR });
    }

    const testSeriesFolders = fs.readdirSync(TESTSERIES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const testSeriesList: any[] = [];

    for (const seriesFolder of testSeriesFolders) {
      const seriesPath = path.join(TESTSERIES_DIR, seriesFolder);
      
      // Get all section folders
      const sectionFolders = fs.readdirSync(seriesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      const sections: any[] = [];

      for (const sectionFolder of sectionFolders) {
        const sectionPath = path.join(seriesPath, sectionFolder);
        const infoFilePath = path.join(sectionPath, '_section_info.json');

        let sectionInfo: any = {
          id: sectionFolder,
          title: sectionFolder,
          tests: []
        };

        // Read section info if available
        if (fs.existsSync(infoFilePath)) {
          try {
            const infoContent = fs.readFileSync(infoFilePath, 'utf-8');
            const info = JSON.parse(infoContent);
            sectionInfo = {
              id: info.id || sectionFolder,
              folderName: sectionFolder, // Keep actual folder name
              title: info.title || sectionFolder,
              tests: info.tests || []
            };
          } catch (err) {
            console.error(`Error reading section info for ${sectionFolder}:`, err);
          }
        } else {
          sectionInfo.folderName = sectionFolder; // Add folder name if no info file
        }

        // Count available test files
        const testFiles = fs.readdirSync(sectionPath)
          .filter(f => f.endsWith('.json.gz'));
        
        sectionInfo.availableTests = testFiles.length;
        sections.push(sectionInfo);
      }

      // Extract series ID from folder name (last part after last underscore)
      const seriesIdMatch = seriesFolder.match(/_([a-f0-9]{24})$/);
      const seriesId = seriesIdMatch ? seriesIdMatch[1] : seriesFolder;

      testSeriesList.push({
        id: seriesId,
        folderName: seriesFolder,
        title: seriesFolder.replace(/_/g, ' ').replace(/\s+[a-f0-9]{24}$/i, ''),
        sections: sections,
        totalSections: sections.length,
        totalTests: sections.reduce((sum, s) => sum + s.availableTests, 0)
      });
    }

    res.json({
      total: testSeriesList.length,
      testSeries: testSeriesList
    });

  } catch (error: any) {
    console.error('Error listing test series:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/testseries/:seriesFolder/:sectionFolder - List tests in a section
 */
router.get('/:seriesFolder/:sectionFolder', (req: Request, res: Response) => {
  try {
    const { seriesFolder, sectionFolder } = req.params;
    const sectionPath = path.join(TESTSERIES_DIR, seriesFolder, sectionFolder);

    if (!fs.existsSync(sectionPath)) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Read section info
    const infoFilePath = path.join(sectionPath, '_section_info.json');
    let sectionInfo: any = { tests: [] };

    if (fs.existsSync(infoFilePath)) {
      const infoContent = fs.readFileSync(infoFilePath, 'utf-8');
      sectionInfo = JSON.parse(infoContent);
    }

    // Get available test files
    const testFiles = fs.readdirSync(sectionPath)
      .filter(f => f.endsWith('.json.gz') || f.endsWith('.json'))
      .map(filename => {
        // Remove extension to get the ID
        const testId = filename.replace(/\.(json\.gz|json)$/, '');
        
        // Try to find matching test info from _section_info.json
        const testInfo = sectionInfo.tests?.find((t: any) => 
          t.id === testId || t.filename === filename
        );
        
        if (testInfo) {
          return {
            ...testInfo,
            id: testId, // Use actual filename (without extension) as ID
            filename: filename,
            compressed: filename.endsWith('.gz')
          };
        } else {
          // No info found, create basic info from filename
          return {
            id: testId,
            title: testId.replace(/_/g, ' '),
            filename: filename,
            compressed: filename.endsWith('.gz')
          };
        }
      });

    console.log(`[TestSeries] Section ${sectionFolder}: Found ${testFiles.length} test files`);

    res.json({
      section: sectionInfo,
      tests: testFiles,
      total: testFiles.length
    });

  } catch (error: any) {
    console.error('Error listing section tests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/testseries/:seriesFolder/:sectionFolder/:testId - Get decompressed test paper
 */
router.get('/:seriesFolder/:sectionFolder/:testId', async (req: Request, res: Response) => {
  try {
    const { seriesFolder, sectionFolder, testId } = req.params;
    
    console.log(`[TestSeries] Fetching test: ${seriesFolder}/${sectionFolder}/${testId}`);
    
    const sectionPath = path.join(TESTSERIES_DIR, seriesFolder, sectionFolder);
    
    // List all files in the section to help debug
    if (fs.existsSync(sectionPath)) {
      const files = fs.readdirSync(sectionPath);
      console.log(`[TestSeries] Files in section:`, files.slice(0, 5)); // Show first 5 files
    } else {
      console.error(`[TestSeries] Section path does not exist: ${sectionPath}`);
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Try multiple filename patterns
    const possibleFilenames = [
      `${testId}.json.gz`,
      `${testId}.json`,
    ];
    
    let filePath: string | null = null;
    let needsDecompression = false;
    
    for (const filename of possibleFilenames) {
      const fullPath = path.join(sectionPath, filename);
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        needsDecompression = filename.endsWith('.gz');
        console.log(`[TestSeries] Found file: ${filename}`);
        break;
      }
    }
    
    if (!filePath) {
      console.error(`[TestSeries] Test paper not found. Tried: ${possibleFilenames.join(', ')}`);
      return res.status(404).json({ 
        error: 'Test paper not found',
        testId,
        triedFiles: possibleFilenames
      });
    }

    if (needsDecompression) {
      // Read and decompress
      const compressedData = fs.readFileSync(filePath);
      const decompressedData = await gunzip(compressedData);
      const jsonString = decompressedData.toString('utf-8');
      const testData = JSON.parse(jsonString);

      console.log(`[TestSeries] Successfully decompressed and parsed test`);
      res.json(testData);
    } else {
      // Stream uncompressed file
      res.setHeader('Content-Type', 'application/json');
      console.log(`[TestSeries] Streaming uncompressed test`);
      fs.createReadStream(filePath).pipe(res);
    }

  } catch (error: any) {
    console.error('[TestSeries] Error serving test paper:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
