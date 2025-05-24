// utils/pdfProcessor.js
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { Document } = require("langchain/document");
const fs = require("fs").promises;
const path = require("path");

async function loadAndProcessPDF(filePath) {
  try {
    // Verify file exists and is accessible
    const absolutePath = path.resolve(filePath);
    await fs.access(absolutePath);
    
    const loader = new PDFLoader(absolutePath, {
      splitPages: false,
      pdfjs: () => import('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js')
    });

    const docs = await loader.load();
    
    return docs.map(doc => {
      const content = doc.pageContent;
      const sections = {};
      
      // Extract sections using regex
      const sectionPattern = /\[([^\]]+)\]([^\[]+)/g;
      let match;
      
      while ((match = sectionPattern.exec(content)) !== null) {
        sections[match[1].trim().toLowerCase()] = match[2].trim();
      }
      
      // Create enriched metadata
      const metadata = {
        disease: content.match(/BỆNH\s([^\n]+)/i)?.[1]?.trim() || 'Unknown',
        ...sections,
        source: absolutePath
      };
      
      return new Document({
        pageContent: content,
        metadata: metadata
      });
    });
  } catch (error) {
    console.error(`Error processing PDF at ${filePath}:`, error);
    throw error; // Re-throw to let calling code handle it
  }
}

module.exports = { loadAndProcessPDF };