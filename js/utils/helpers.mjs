const pageEl = document.querySelector('.page-a');
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function addFontFromFile(fileObj) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const newFont = new FontFace('temp-font', e.target.result);
    newFont.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      pageEl.style.fontFamily = 'temp-font';
    });
  };
  reader.readAsArrayBuffer(fileObj);
}

/**
 * @method createPDF
 * @param imgs array of images (in base64)
 * @description
 * Creates PDF from list of given images with proper page sizing
 */
function createPDF(imgs) {
  // Get current page size
  const pageSize = document.querySelector('#page-size').value;
  
  // Define page dimensions in mm (jsPDF uses mm by default)
  const pageSizes = {
    'a4': [210, 297],
    'small-book': [127, 203.2],
    'digest': [139.7, 215.9],
    'trade': [152.4, 228.6],
    'letter': [215.9, 279.4]
  };
  
  const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes['a4'];
  
  // eslint-disable-next-line new-cap
  const doc = new jsPDF('p', 'mm', [pageWidth, pageHeight]);
  
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  
  // Calculate margins proportional to page size
  const marginX = width * 0.06; // 6% margin
  const marginY = height * 0.04; // 4% margin
  
  for (const i in imgs) {
    doc.text(10, 20, '');
    doc.addImage(
      imgs[i],
      'JPEG',
      marginX,
      marginY,
      width - (marginX * 2),
      height - (marginY * 2),
      'image-' + i
    );
    if (i != imgs.length - 1) {
      doc.addPage([pageWidth, pageHeight]);
    }
  }
  
  // Save with descriptive filename
  const filename = `handwriting-${pageSize}-${Date.now()}.pdf`;
  doc.save(filename);
}

function formatText(event) {
  event.preventDefault();
  const text = event.clipboardData
    .getData('text/plain')
    .replace(/\n/g, '<br/>');
  document.execCommand('insertHTML', false, text);
}

function addPaperFromFile(file) {
  const tmppath = URL.createObjectURL(file);
  
  // Apply background to the page element
  pageEl.style.backgroundImage = `url(${tmppath})`;
  pageEl.style.backgroundSize = '100% 100%'; // Stretch to fit exact page dimensions
  pageEl.style.backgroundPosition = 'center';
  pageEl.style.backgroundRepeat = 'no-repeat';
  
  // Remove default white background to show paper texture
  pageEl.style.backgroundColor = 'transparent';
  
  // Ensure paper content area is transparent so background shows through
  const paperContentEl = document.querySelector('.page-a .paper-content');
  if (paperContentEl) {
    paperContentEl.style.backgroundColor = 'transparent';
  }
  
  // Remove lines if they exist (paper image should have its own lines)
  const hasLines = pageEl.classList.contains('lines');
  if (hasLines) {
    paperContentEl.style.backgroundImage = 'none';
  }
  
  console.log('Paper background applied successfully');
}

export { isMobile, addFontFromFile, createPDF, formatText, addPaperFromFile };
