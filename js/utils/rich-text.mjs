/**
 * Rich Text Formatting System
 * Allows multiple fonts, colors, and styles in the same page
 */

let currentStyle = {
  fontFamily: "'Homemade Apple', cursive",
  color: '#000f55',
  fontSize: '10pt',
  bold: false,
  italic: false,
  underline: false
};

const paperContentEl = document.querySelector('.page-a .paper-content');

// Update current style when settings change
export function updateCurrentStyle(property, value) {
  currentStyle[property] = value;
  console.log('Style updated:', property, value);
}

// Get current style as CSS string
function getCurrentStyleString() {
  // Don't include font-size in inline styles - let it inherit from page-level CSS
  let style = `font-family: ${currentStyle.fontFamily}; color: ${currentStyle.color};`;
  
  // Explicitly set font-weight
  if (currentStyle.bold) {
    style += ' font-weight: bold;';
  } else {
    style += ' font-weight: normal;';
  }
  
  // Explicitly set font-style
  if (currentStyle.italic) {
    style += ' font-style: italic;';
  } else {
    style += ' font-style: normal;';
  }
  
  // Explicitly set text-decoration
  if (currentStyle.underline) {
    style += ' text-decoration: underline;';
  } else {
    style += ' text-decoration: none;';
  }
  
  return style;
}

// Handle text input with formatting
export function initRichTextEditor() {
  if (!paperContentEl) return;
  
  // Make sure contenteditable is enabled
  paperContentEl.setAttribute('contenteditable', 'true');
  
  // Wrap existing plain text in a span with default blue color
  wrapExistingText();
  
  // Track typing
  let typingTimer;
  let lastLength = paperContentEl.textContent.length;
  
  paperContentEl.addEventListener('keypress', (e) => {
    // When user types a character, wrap it in a span with current style
    if (e.key.length === 1) { // Regular character (not Enter, Backspace, etc.)
      e.preventDefault();
      
      // Insert styled text
      insertStyledText(e.key);
    }
  });
  
  paperContentEl.addEventListener('keydown', (e) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      insertStyledText('\n');
    }
  });
}

// Wrap existing plain text with default style
function wrapExistingText() {
  const existingText = paperContentEl.textContent.trim();
  if (existingText && !paperContentEl.querySelector('span')) {
    // Only wrap if there's text and it's not already wrapped
    const span = document.createElement('span');
    // Don't set font-size, let it inherit from page CSS
    span.setAttribute('style', "font-family: 'Homemade Apple', cursive; color: #000f55;");
    span.textContent = existingText;
    paperContentEl.innerHTML = '';
    paperContentEl.appendChild(span);
  }
}

// Insert text with current styling
function insertStyledText(text) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  
  if (text === '\n') {
    // Insert line break
    const br = document.createElement('br');
    range.insertNode(br);
    
    // Move cursor after the br
    range.setStartAfter(br);
    range.setEndAfter(br);
  } else {
    // Create span with current style
    const span = document.createElement('span');
    span.setAttribute('style', getCurrentStyleString());
    span.textContent = text;
    
    range.insertNode(span);
    
    // Move cursor after the inserted text
    range.setStartAfter(span);
    range.setEndAfter(span);
  }
  
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRichTextEditor);
} else {
  initRichTextEditor();
}

