/**
 * Rich Text Formatting System - Baseline Aligned Version
 */

let currentStyle = {
  fontFamily: "'Homemade Apple', cursive",
  color: '#000f55',
  bold: false,
  italic: false,
  underline: false
};

const paperContentEl = document.querySelector('.page-a .paper-content');

export function updateCurrentStyle(property, value) {
  currentStyle[property] = value;
}

function getCurrentStyleString() {
  // Force baseline alignment and consistent line-height
  let style = `font-family: ${currentStyle.fontFamily}; color: ${currentStyle.color}; vertical-align: baseline; display: inline;`;
  
  if (currentStyle.bold) {
    style += ' font-weight: bold;';
  } else {
    style += ' font-weight: normal;';
  }
  
  if (currentStyle.italic) {
    style += ' font-style: italic;';
  } else {
    style += ' font-style: normal;';
  }
  
  if (currentStyle.underline) {
    style += ' text-decoration: underline;';
  } else {
    style += ' text-decoration: none;';
  }
  
  return style;
}

export function initRichTextEditor() {
  if (!paperContentEl) return;
  
  paperContentEl.setAttribute('contenteditable', 'true');
  
  // Wrap existing text
  wrapExistingText();
  
  let currentSpan = null;
  let lastStyleString = getCurrentStyleString();
  
  paperContentEl.addEventListener('keypress', (e) => {
    if (e.key.length === 1) {
      e.preventDefault();
      
      const currentStyleString = getCurrentStyleString();
      
      if (!currentSpan || currentStyleString !== lastStyleString) {
        currentSpan = document.createElement('span');
        currentSpan.setAttribute('style', currentStyleString);
        
        const selection = window.getSelection();
        if (selection.rangeCount) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(currentSpan);
          range.setStart(currentSpan, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        lastStyleString = currentStyleString;
      }
      
      const textNode = document.createTextNode(e.key);
      currentSpan.appendChild(textNode);
      
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  
  paperContentEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
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
      
      currentSpan = null;
    }
  });
}

function wrapExistingText() {
  const existingText = paperContentEl.textContent.trim();
  if (existingText && !paperContentEl.querySelector('span')) {
    const span = document.createElement('span');
    span.setAttribute('style', "font-family: 'Homemade Apple', cursive; color: #000f55; vertical-align: baseline; display: inline;");
    span.textContent = existingText;
    paperContentEl.innerHTML = '';
    paperContentEl.appendChild(span);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRichTextEditor);
} else {
  initRichTextEditor();
}
