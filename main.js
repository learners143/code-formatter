document
  .getElementById('fileInput')
  .addEventListener('change', handleFileSelect);

function removeComments(code, language) {
  let result = '';
  switch (language) {
    case 'javascript':
      // Remove single-line (//) and multi-line (/* */) comments for JavaScript
      result = code.replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)/g, '');
      break;
    case 'jsx':
      // Remove single-line (//) and multi-line (/* */) comments for JSX
      result = code.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
      break;
    case 'html':
      // Remove HTML comments
      result = code.replace(/<!--[\s\S]*?-->/g, '');
      break;
    case 'css':
      // Remove CSS comments
      result = code.replace(/\/\*[\s\S]*?\*\//g, '');
      break;

    default:
      result = code; // No processing for unsupported languages
  }
  return result;
}

async function pasteClipboard() {
  try {
    const clipboardPermission = await navigator.permissions.query({
      name: 'clipboard-read',
    });

    if (clipboardPermission.state === 'granted') {
      // Permission is already granted
      const text = await navigator.clipboard.readText();
      document.getElementById('codeInput').value = text;
      toggleClearButton(); // Show the clear button if there is text
    } else if (clipboardPermission.state === 'prompt') {
      // Permission is not granted yet, prompt the user
      alert(
        'Clipboard access permission is required. Please grant permission in your browser settings to enable pasting from clipboard.'
      );
    } else {
      // Permission is denied
      alert('Clipboard access is denied. You need to enable clipboard access to use this feature.');
    }
  } catch (err) {
    alert('Failed to access clipboard: ' + err.message);
  }
}

function beautifyCode() {
  const fileInput = document.getElementById('fileInput');
  const codeInput = document.getElementById('codeInput');
  const fileTypeSelect = document.getElementById('fileType');
  const result = document.getElementById('result');
  const removeCommentsCheckbox = document.getElementById('removeComments');
  let code;
  let selectedType;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileType = file.name.split('.').pop();

    if (!['js', 'jsx', 'html', 'css'].includes(fileType)) {
      result.textContent = 'Unsupported file type.';
      return;
    }

    selectedType = fileType === 'js' ? 'javascript' : fileType;
    const reader = new FileReader();

    reader.onload = function (event) {
      code = event.target.result;
      if (removeCommentsCheckbox.checked) {
        code = removeComments(code, selectedType);
      }
      processCode(code, selectedType);
    };

    reader.readAsText(file);
  } else {
    code = codeInput.value;
    selectedType = fileTypeSelect.value;
    if (removeCommentsCheckbox.checked) {
      code = removeComments(code, selectedType);
    }
    processCode(code, selectedType);
  }
}

function processCode(code, fileType) {
  const result = document.querySelector('#result');
  let parser;
  let plugins = [];

  switch (fileType) {
    case 'javascript':
    case 'js':
      parser = 'babel';
      plugins = [window.prettierPlugins.babel];
      break;
    case 'jsx':
      parser = 'babel';
      plugins = [window.prettierPlugins.babel];
      break;
    case 'html':
      parser = 'html';
      plugins = [window.prettierPlugins.html];
      break;
    case 'css':
      parser = 'css';
      plugins = [window.prettierPlugins.postcss];
      break;

    default:
      result.textContent = 'Unsupported file type.';
      return;
  }

  try {
    const formattedCode = prettier.format(code, {
      parser: parser,
      plugins: plugins,
      tabWidth: 2,
      semi: true,
      singleQuote: true,
    });
    result.textContent = formattedCode;
    result.className = `language-${fileType}`;
    Prism.highlightElement(result);
    toggleClearButton(); // Show the clear button if there is formatted code
  } catch (error) {
    result.textContent = 'Error formatting the code: ' + error.message;
    toggleClearButton(); // Show the clear button if there is an error message
  }
}

function copyCode() {
  const result = document.getElementById('result');
  navigator.clipboard.writeText(result.textContent).then(
    () => {
      alert('Code copied to clipboard!');
    },
    (err) => {
      alert('Failed to copy code: ' + err.message);
    }
  );
}

function clearText() {
  document.getElementById('codeInput').value = '';
  document.getElementById('result').textContent = '';
  toggleClearButton(); // Hide the clear button when text is cleared
}

function toggleClearButton() {
  const clearButton = document.querySelector('.clear-button');
  const codeInput = document.getElementById('codeInput').value;
  const result = document.getElementById('result').textContent;
  clearButton.style.display =
    codeInput.trim() !== '' || result.trim() !== '' ? 'inline-block' : 'none';
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('codeInput').value = e.target.result;
      toggleClearButton();
    };
    reader.readAsText(file);
  }
      }
          
