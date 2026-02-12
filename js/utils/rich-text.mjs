/**
 * Rich Text Formatting System - Font-Specific Metrics
 */

// Pre-calibrated settings for each font to align with lines
const fontMetrics = {
  "'Homemade Apple', cursive": {
    fontSize: '10pt',
    verticalOffset: '0px',
    letterSpacing: '0px'
  },
  "'Caveat', cursive": {
    fontSize: '13pt',
    verticalOffset: '-2px',
    letterSpacing: '0px'
  },
  "'Liu Jian Mao Cao', cursive": {
    fontSize: '13pt',
    verticalOffset: '-1px',
    letterSpacing: '0px'
  },
  "Hindi_Font": {
    fontSize: '10pt',
    verticalOffset: '0px',
    letterSpacing: '0px'
  }
};

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
  
  // Don't auto-update UI inputs - let user control them manually
  // The font metrics are only used for the inline styles of new text
}

function getCurrentStyleString() {
  const metrics = fontMetrics[currentStyle.fontFamily] || fontMetrics["'Homemade Apple', cursive"];
  
  // Use !important to prevent any external CSS from affecting these styles
  let style = `font-family: ${currentStyle.fontFamily} !important; color: ${currentStyle.color} !important; font-size: ${metrics.fontSize} !important; position: relative !important; top: ${metrics.verticalOffset} !important; letter-spacing: ${metrics.letterSpacing} !important; line-height: 1.5em !important;`;
  
  if (currentStyle.bold) {
    style += ' font-weight: bold !important;';
  } else {
    style += ' font-weight: normal !important;';
  }
  
  if (currentStyle.italic) {
    style += ' font-style: italic !important;';
  } else {
    style += ' font-style: normal !important;';
  }
  
  if (currentStyle.underline) {
    style += ' text-decoration: underline !important;';
  } else {
    style += ' text-decoration: none !important;';
  }
  
  return style;
}

export function initRichTextEditor() {
  if (!paperContentEl) return;
  
  paperContentEl.setAttribute('contenteditable', 'true');
  
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
    const metrics = fontMetrics["'Homemade Apple', cursive"];
    span.setAttribute('style', `font-family: 'Homemade Apple', cursive !important; color: #000f55 !important; font-size: ${metrics.fontSize} !important; position: relative !important; top: ${metrics.verticalOffset} !important; line-height: 1.5em !important;`);
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

