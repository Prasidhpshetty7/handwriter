/**
 * Advanced Drawing Canvas with Multiple Tools
 */

const canvas = document.querySelector('#diagram-canvas');
const ctx = canvas.getContext('2d');
const drawContainer = document.querySelector('.draw-container');

let isDrawing = false;
let x = 0;
let y = 0;
let currentTool = 'pen';
let currentColor = '#000f55';
let currentSize = 2;
let currentOpacity = 1;

// Drawing state for shapes
let startX, startY;
let snapshot;

// Initialize canvas
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Set initial cursor
canvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text x=\'2\' y=\'28\' font-size=\'24\'>✍️</text></svg>") 4 28, auto';

// Mobile canvas scaling
function adjustCanvasForMobile() {
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;
  
  // Only adjust on mobile/tablet
  if (window.innerWidth <= 768) {
    const scale = Math.min(1, (containerWidth - 40) / 850);
    canvas.style.width = (850 * scale) + 'px';
    canvas.style.height = (550 * scale) + 'px';
  } else {
    canvas.style.width = '850px';
    canvas.style.height = '550px';
  }
}

// Adjust on load and resize
adjustCanvasForMobile();
window.addEventListener('resize', adjustCanvasForMobile);
window.addEventListener('orientationchange', adjustCanvasForMobile);

// Get canvas position relative to viewport
function getCanvasCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
  const coords = getCanvasCoordinates(e);
  isDrawing = true;
  x = coords.x;
  y = coords.y;
  startX = x;
  startY = y;
  
  // Save canvas state for shape tools
  if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  
  if (currentTool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  
  const coords = getCanvasCoordinates(e);
  const newX = coords.x;
  const newY = coords.y;
  
  if (currentTool === 'pen' || currentTool === 'eraser') {
    drawLine(ctx, x, y, newX, newY);
    x = newX;
    y = newY;
  } else if (currentTool === 'spray') {
    sprayPaint(newX, newY);
    x = newX;
    y = newY;
  } else {
    // For shapes, restore snapshot and draw preview
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
    }
    
    if (currentTool === 'rectangle') {
      drawRectangle(startX, startY, newX, newY);
    } else if (currentTool === 'circle') {
      drawCircle(startX, startY, newX, newY);
    } else if (currentTool === 'line') {
      drawLine(ctx, startX, startY, newX, newY);
    } else if (currentTool === 'arrow') {
      drawArrow(startX, startY, newX, newY);
    }
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) {
    saveState(); // Save state after drawing
  }
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// Touch events for mobile support
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  const mouseEvent = new MouseEvent('mouseup', {});
  canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  isDrawing = false;
});

// Drawing functions
function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = currentColor;
  context.lineWidth = currentSize;
  context.globalAlpha = currentOpacity;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function drawRectangle(x1, y1, x2, y2) {
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.globalAlpha = currentOpacity;
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
}

function drawCircle(x1, y1, x2, y2) {
  const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  ctx.beginPath();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.globalAlpha = currentOpacity;
  ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
}

function drawArrow(x1, y1, x2, y2) {
  const headLength = 15;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Draw line
  drawLine(ctx, x1, y1, x2, y2);
  
  // Draw arrowhead
  ctx.beginPath();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.globalAlpha = currentOpacity;
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
  ctx.closePath();
}

function sprayPaint(x, y) {
  const density = 20;
  const radius = currentSize * 3;
  
  for (let i = 0; i < density; i++) {
    const offsetX = (Math.random() - 0.5) * radius;
    const offsetY = (Math.random() - 0.5) * radius;
    
    ctx.fillStyle = currentColor;
    ctx.globalAlpha = currentOpacity * 0.5;
    ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
  }
  ctx.globalAlpha = currentOpacity;
}

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentTool = e.currentTarget.dataset.tool;
    
    // Update cursor based on tool
    updateCursor(currentTool);
    
    console.log('Tool changed to:', currentTool);
  });
});

// Update cursor based on selected tool
function updateCursor(tool) {
  const cursors = {
    'pen': 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text x=\'2\' y=\'28\' font-size=\'24\'>✍️</text></svg>") 4 28, auto',
    'eraser': 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text x=\'4\' y=\'24\' font-size=\'24\'>🧹</text></svg>") 16 16, auto',
    'spray': 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text x=\'4\' y=\'24\' font-size=\'24\'>💨</text></svg>") 16 16, auto',
    'line': 'crosshair',
    'rectangle': 'crosshair',
    'circle': 'crosshair',
    'arrow': 'crosshair'
  };
  
  canvas.style.cursor = cursors[tool] || 'default';
}

// Color picker
const colorPicker = document.querySelector('#draw-color');
if (colorPicker) {
  colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
    console.log('Color changed to:', currentColor);
  });
}

// Background color picker
const bgColorPicker = document.querySelector('#canvas-bg-color');
if (bgColorPicker) {
  bgColorPicker.addEventListener('change', (e) => {
    canvas.style.backgroundColor = e.target.value;
    console.log('Background color changed to:', e.target.value);
  });
}

// Brush size
const brushSize = document.querySelector('#brush-size');
const sizeValue = document.querySelector('#size-value');
if (brushSize && sizeValue) {
  brushSize.addEventListener('input', (e) => {
    currentSize = Number(e.target.value);
    sizeValue.textContent = e.target.value;
    console.log('Brush size changed to:', currentSize);
  });
}

// Opacity
const opacitySlider = document.querySelector('#opacity');
const opacityValue = document.querySelector('#opacity-value');
if (opacitySlider && opacityValue) {
  opacitySlider.addEventListener('input', (e) => {
    currentOpacity = Number(e.target.value) / 100;
    opacityValue.textContent = e.target.value + '%';
    console.log('Opacity changed to:', currentOpacity);
  });
}

export function setInkColor(color) {
  currentColor = color;
  if (colorPicker) {
    colorPicker.value = color;
  }
}

export function toggleDrawCanvas() {
  if (drawContainer.style.display === 'block') {
    drawContainer.style.display = 'none';
  } else {
    drawContainer.style.display = 'block';
  }
}

// Clear canvas
const clearBtn = document.querySelector('#clear-draw-canvas');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save state after clearing
  });
}

// Add to paper
const addToPaperBtn = document.querySelector('#add-to-paper-button');
if (addToPaperBtn) {
  addToPaperBtn.addEventListener('click', () => {
    const imgData = canvas.toDataURL();
    const img = `<img src="${imgData}" style="max-width: 100%;" />`;
    document.querySelector('.page-a .paper-content').innerHTML += img;
    toggleDrawCanvas();
  });
}

// Add as separate page - creates a standalone white page in output
const addAsSeparatePageBtn = document.querySelector('#add-as-separate-page-button');
if (addAsSeparatePageBtn) {
  addAsSeparatePageBtn.addEventListener('click', async () => {
    try {
      // Import the function to add canvas to output
      const module = await import('../generate-images.mjs');
      const addCanvasToOutput = module.addCanvasToOutput;
      
      // Create a new canvas with background color
      const outputCanvas = document.createElement('canvas');
      const pageSize = document.querySelector('#page-size').value;
      
      // Set canvas dimensions based on page size (matching the page-a dimensions)
      const pageSizes = {
        'a4': { width: 400, height: 565 },
        'small-book': { width: 241, height: 387 },
        'digest': { width: 266, height: 411 },
        'trade': { width: 290, height: 435 },
        'letter': { width: 411, height: 532 }
      };
      
      const dimensions = pageSizes[pageSize] || pageSizes['a4'];
      const resolution = parseFloat(document.querySelector('#resolution').value) || 3;
      
      outputCanvas.width = dimensions.width * resolution;
      outputCanvas.height = dimensions.height * resolution;
      
      const outputCtx = outputCanvas.getContext('2d');
      
      // Get the chosen background color
      const bgColorPicker = document.querySelector('#canvas-bg-color');
      const bgColor = bgColorPicker ? bgColorPicker.value : '#ffffff';
      
      // Fill with chosen background color
      outputCtx.fillStyle = bgColor;
      outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      
      // Scale and center the drawing on the page
      const scale = Math.min(
        (outputCanvas.width * 0.9) / canvas.width,
        (outputCanvas.height * 0.9) / canvas.height
      );
      
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;
      const x = (outputCanvas.width - scaledWidth) / 2;
      const y = (outputCanvas.height - scaledHeight) / 2;
      
      outputCtx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      
      // Add to output
      addCanvasToOutput(outputCanvas);
      
      // Close the draw canvas
      toggleDrawCanvas();
    } catch (error) {
      console.error('Error adding as separate page:', error);
      alert('Error creating separate page. Please try again.');
    }
  });
}

// Download image without background (transparent)
const downloadBtn = document.querySelector('#draw-download-button');
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// Download image with background
const downloadWithBgBtn = document.querySelector('#draw-download-with-bg-button');
if (downloadWithBgBtn) {
  downloadWithBgBtn.addEventListener('click', () => {
    // Create a temporary canvas with background color
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Get the canvas background color (from style or default white)
    const bgColorPicker = document.querySelector('#canvas-bg-color');
    const canvasBgColor = bgColorPicker ? bgColorPicker.value : '#ffffff';
    
    // Fill with canvas background color
    tempCtx.fillStyle = canvasBgColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);
    
    // Download
    const link = document.createElement('a');
    link.download = 'drawing-with-bg.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  });
}

// Add background image
const addImageBtn = document.querySelector('#add-new-image-button');
const imageInput = document.querySelector('#image-to-add-in-canvas');
if (addImageBtn && imageInput) {
  addImageBtn.addEventListener('click', () => {
    imageInput.click();
  });
  
  imageInput.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        saveState(); // Save state after adding background image
      };
      img.src = event.target.result;
    };
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  });
}

// Undo/Redo functionality
const history = [];
let historyStep = -1;

function saveState() {
  historyStep++;
  if (historyStep < history.length) {
    history.length = historyStep;
  }
  history.push(canvas.toDataURL());
}

const undoBtn = document.querySelector('#undo-btn');
const redoBtn = document.querySelector('#redo-btn');

if (undoBtn) {
  undoBtn.addEventListener('click', () => {
    if (historyStep > 0) {
      historyStep--;
      const img = new Image();
      img.src = history[historyStep];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  });
}

if (redoBtn) {
  redoBtn.addEventListener('click', () => {
    if (historyStep < history.length - 1) {
      historyStep++;
      const img = new Image();
      img.src = history[historyStep];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  });
}

// Save initial state
saveState();

console.log('Draw tool initialized');
