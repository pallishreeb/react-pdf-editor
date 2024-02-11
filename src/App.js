import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import './App.css';
import { PDFDocument, rgb } from 'pdf-lib';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function App() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [link, setLink] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotations, setCurrentAnnotations] = useState([]);

  useEffect(() => {
    setCurrentAnnotations(
      annotations.filter(annotation => annotation.pageNumber === pageNumber)
    );
  }, [annotations, pageNumber]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    setPdfFile(file);
  }

  function addAnnotation() {
    if (link.trim()) {
      setAnnotations([...annotations, { link, pageNumber }]);
      setLink('');
    }
  }

  
  // Function to download the edited PDF
  async function downloadEditedPDF() {
    if (!pdfFile) return;

    const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
    const pages = pdfDoc.getPages();
    
    annotations.forEach((annotation) => {
      const { link } = annotation;
      pages.forEach((page) => {
        const textX = 20; // X position for text
        const textY = 20; // Y position for text
        page.drawText('Explore here', { x: textX, y: textY, size: 12, color: rgb(0, 0, 0) });
        page.drawText(link, { x: textX + 100, y: textY, size: 12, color: rgb(0, 0, 1), underline: true });
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_pdf.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="App">
      <div className="header">
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Link URL"
          className="input-field"
        />
        <button onClick={addAnnotation} className="add-button">Add Annotation</button>
        <input
          type="number"
          value={pageNumber}
          onChange={(e) => setPageNumber(parseInt(e.target.value))}
          min={1}
          max={numPages || 1}
          className="page-number-input"
        />
      </div>
      {pdfFile && (
        <div className="pdf-container">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page key={pageNumber} pageNumber={pageNumber} renderAnnotationLayer={true} width={800} height={1200} />
          </Document>
          <div className="annotations">
            {currentAnnotations.map((annotation, index) => (
              <div className="annotation" key={index}>
                <a href={annotation.link} target="_blank" rel="noopener noreferrer">{annotation.link}</a>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="controls">
        <button onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber <= 1} className="page-nav-button">
          Previous Page
        </button>
        <button onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber >= numPages} className="page-nav-button">
          Next Page
        </button>
        <button onClick={downloadEditedPDF} className="download-button save">Download Edited PDF</button>
      </div>
      <div className="page-info">
        Page {pageNumber} of {numPages}
      </div>
    </div>
  );
}

export default App;
