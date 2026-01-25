#!/usr/bin/env node
/**
 * CLI Tool: Process Single PDF
 * Usage: npm run process-pdf -- ./path/to/file.pdf
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import { PDFProcessor } from '../services/pdf-processor';
import { QuestionDatabase } from '../services/database';

async function main() {
  const pdfPath = process.argv[2];
  const maxPages = process.argv[3] ? parseInt(process.argv[3]) : undefined;

  if (!pdfPath) {
    console.error('❌ Please provide a PDF file path');
    console.log('Usage: npm run process-pdf -- ./path/to/file.pdf [maxPages]');
    console.log('Example: npm run process-pdf -- ./exam.pdf 50  (process only first 50 pages)');
    process.exit(1);
  }

  const fullPath = path.resolve(pdfPath);
  
  console.log('📄 Processing PDF:', fullPath);
  if (maxPages) {
    console.log(`📑 Limiting to first ${maxPages} pages`);
  }
  console.log('⏳ This may take several minutes...');
  console.log('💾 Progress will be saved after each batch\n');

  try {
    const processor = new PDFProcessor();
    const db = new QuestionDatabase();

    // Process PDF
    const result = await processor.processPDF(fullPath);

    if ((result.status === 'completed' || result.status === 'partial_failure') && result.results) {
      const isPartial = result.status === 'partial_failure';
      
      console.log(isPartial ? '\n⚠️  Processing completed with errors (partial results saved)\n' : '\n✅ Processing completed successfully!\n');
      console.log('📊 Results:');
      console.log(`  - Exam: ${result.results.documentStructure.examName}`);
      console.log(`  - Type: ${result.results.documentStructure.examType}`);
      console.log(`  - Year: ${result.results.documentStructure.year || 'N/A'}`);
      console.log(`  - Papers: ${result.results.documentStructure.papers.length}`);
      console.log(`  - Questions: ${result.results.extractedQuestions.length}`);
      console.log(`  - Avg Confidence: ${(result.results.statistics.averageConfidence * 100).toFixed(1)}%`);
      console.log(`  - Processing Time: ${(result.results.statistics.processingTimeMs / 1000).toFixed(1)}s`);

      // Import to database
      console.log('\n💾 Importing to database...');
      await db.importQuestions(result.results);
      console.log('✅ Questions imported successfully!');

      // Show breakdown
      console.log('\n📈 Question Breakdown:');
      Object.entries(result.results.statistics.questionsBySubject).forEach(([subject, count]) => {
        console.log(`  - ${subject}: ${count}`);
      });
      
      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        result.errors.forEach(err => {
          console.log(`  - [${err.stage}] ${err.message}`);
        });
      }

      db.close();
      
      if (isPartial) {
        console.log('\n⚠️  Some pages failed to process. Check logs above.');
        process.exit(2); // Different exit code for partial success
      }
    } else {
      console.error('\n❌ Processing failed completely');
      if (result.errors && result.errors.length > 0) {
        console.log('\n🔍 Errors:');
        result.errors.forEach(err => {
          console.log(`  - [${err.stage}] ${err.message}`);
        });
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
