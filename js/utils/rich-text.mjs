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
  console.log('Format updated:', currentFormat);
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
  
  if (currentFormat.color && currentFormat.color !== '#000f55') {
    styles.push(`color: ${currentFormat.color}`);
  }
  
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
  // Check if any formatting is active
  const hasFormatting = currentFormat.bold || 
                       currentFormat.italic || 
                       currentFormat.underline || 
                       (currentFormat.color && currentFormat.color !== '#000f55');
  
  if (!hasFormatting) return; // Let default behavior handle it
  
  e.preventDefault();
  
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  
  // Create span with formatting
  const span = document.createElement('span');
  applyStylesToSpan(span);
  span.textContent = e.key;
  
  range.insertNode(span);
  
  // Move cursor after the inserted span
  range.setStartAfter(span);
  range.setEndAfter(span);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Get current format state
 */
export function getCurrentFormat() {
  return { ...currentFormat };
}
