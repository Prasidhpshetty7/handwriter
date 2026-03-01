/**
 * Rich Text Editing System
 * Allows multiple colors, fonts, and styles in the same page
 */

// Current formatting state
let currentFormat = {
  bold: false,
  italic: false,
  underline: false,
  color: '#000f55'
};

// Get the paper content element
const paperContent = document.querySelector('.page-a .paper-content');

/**
 * Update current format when user changes settings
 */
export function updateFormat(property, value) {
  currentFormat[property] = value;
  console.log('Format updated:', property, '=', value);
  console.log('Current format state:', currentFormat);
}

/**
 * Apply current formatting to selected text or at cursor
 */
export function applyCurrentFormat() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  
  // If there's selected text, wrap it
  if (!range.collapsed) {
    wrapSelection(range);
  }
}

/**
 * Wrap selected text with current formatting
 */
function wrapSelection(range) {
  const span = document.createElement('span');
  applyStylesToSpan(span);
  
  try {
    range.surroundContents(span);
  } catch (e) {
    // If surroundContents fails, use extractContents
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
  }
}

/**
 * Apply current format styles to a span element
 */
function applyStylesToSpan(span) {
  let styles = [];
  
  if (currentFormat.bold) {
    styles.push('font-weight: bold');
  }
  
  if (currentFormat.italic) {
    styles.push('font-style: italic');
  }
  
  if (currentFormat.underline) {
    styles.push('text-decoration: underline');
  }
  
  // Always apply color as inline style
  if (currentFormat.color) {
    styles.push(`color: ${currentFormat.color}`);
  }
  
  console.log('Applying styles:', styles.join('; '));
  
  if (styles.length > 0) {
    span.setAttribute('style', styles.join('; '));
  }
}

/**
 * Handle keyboard input to apply formatting to new text
 */
export function initRichTextEditor() {
  if (!paperContent) return;
  
  paperContent.addEventListener('keydown', (e) => {
    // Don't interfere with special keys
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Only handle printable characters
    if (e.key.length === 1) {
      handleCharacterInput(e);
    }
  });
  
  console.log('Rich text editor initialized');
}

/**
 * Handle character input with current formatting
 */
function handleCharacterInput(e) {
  // Always apply formatting to wrap text in spans with explicit color
  e.preventDefault();
  
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  
  // Create span with formatting
  const span = document.createElement('span');
  applyStylesToSpan(span);
  
  // Handle spaces properly - use non-breaking space for multiple spaces
  if (e.key === ' ') {
    // Check if previous character was also a space
    const prevNode = range.startContainer;
    const prevText = prevNode.textContent || '';
    const prevChar = prevText[range.startOffset - 1];
    
    if (prevChar === ' ' || prevChar === '\u00A0') {
      // Use non-breaking space for multiple spaces
      span.innerHTML = '&nbsp;';
    } else {
      span.textContent = ' ';
    }
  } else {
    span.textContent = e.key;
  }
  
  range.insertNode(span);
  
  // Move cursor after the inserted span
  range.setStartAfter(span);
  range.setEndAfter(span);
  selection.removeAllRanges();
  selection.addRange(range);
  
  console.log('Character inserted:', e.key, 'Bold:', currentFormat.bold);
}

/**
 * Get current format state
 */
export function getCurrentFormat() {
  return { ...currentFormat };
}
