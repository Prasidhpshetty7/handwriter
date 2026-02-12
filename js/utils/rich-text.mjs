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
  // Include line-height to keep consistent alignment
  let style = `font-family: ${currentStyle.fontFamily}; color: ${currentStyle.color}; line-height: inherit;`;
  
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
  
  // Track current typing session
  let currentSpan = null;
  let lastStyleString = getCurrentStyleString();
  
  paperContentEl.addEventListener('keypress', (e) => {
    // When user types a character
    if (e.key.length === 1) {
      e.preventDefault();
      
      const currentStyleString = getCurrentStyleString();
      
      // Check if style changed or we need a new span
      if (!currentSpan || currentStyleString !== lastStyleString) {
        // Create new span with current style
        currentSpan = document.createElement('span');
        currentSpan.setAttribute('style', currentStyleString);
        
        // Insert at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(currentSpan);
          
          // Move cursor inside the span
          range.setStart(currentSpan, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        lastStyleString = currentStyleString;
      }
      
      // Add character to current span
      const textNode = document.createTextNode(e.key);
      currentSpan.appendChild(textNode);
      
      // Move cursor after the character
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  
  paperContentEl.addEventListener('keydown', (e) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Insert line break
      const br = document.createElement('br');
      const selection = window.getSelection();
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Reset current span so next text creates a new span
      currentSpan = null;
    }
    
    // Handle Space - continue in same span
    if (e.key === ' ') {
      // Let default behavior happen, but ensure we're in a span
      if (!currentSpan) {
        e.preventDefault();
        const currentStyleString = getCurrentStyleString();
        currentSpan = document.createElement('span');
        currentSpan.setAttribute('style', currentStyleString);
        
        const selection = window.getSelection();
        if (selection.rangeCount) {
          const range = selection.getRangeAt(0);
          range.insertNode(currentSpan);
          range.setStart(currentSpan, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        lastStyleString = currentStyleString;
      }
    }
  });
}

// Wrap existing plain text with default style
function wrapExistingText() {
  const existingText = paperContentEl.textContent.trim();
  if (existingText && !paperContentEl.querySelector('span')) {
    // Only wrap if there's text and it's not already wrapped
    const span = document.createElement('span');
    // Force line-height to inherit for consistent alignment
    span.setAttribute('style', "font-family: 'Homemade Apple', cursive; color: #000f55; line-height: inherit;");
    span.textContent = existingText;
    paperContentEl.innerHTML = '';
    paperContentEl.appendChild(span);
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRichTextEditor);
} else {
  initRichTextEditor();
}

