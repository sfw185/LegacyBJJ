# Embedding a Legacy BJJ Schedule

Each academy has an embeddable two-week schedule at `embed/<id>.html` (IDs are listed in the [README](README.md)), e.g. `https://legacy.australian.software/embed/parramatta.html`. These are rendered live and are at most about a minute old. (The older `https://sfw185.github.io/LegacyBJJ/embed/<id>.html` URLs still work, but only update every few hours.)

To embed one into your website, use the following JavaScript function:

```javascript
async function loadHTMLIntoDiv(divId, url) {
  try {
    // Get the target div element
    const targetDiv = document.getElementById(divId);

    if (!targetDiv) {
      throw new Error(`Element with ID '${divId}' not found`);
    }

    // Fetch the HTML content
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Insert the HTML into the target div
    targetDiv.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading HTML:', error);

    // Optionally display error message in the div
    const targetDiv = document.getElementById(divId);
    if (targetDiv) {
      targetDiv.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    }
  }
}
```

## Usage

1. Add a div element to your HTML where you want the schedule to appear:
   ```html
   <div id="schedule"></div>
   ```

2. Call the function after the page loads:
   ```javascript
   loadHTMLIntoDiv('schedule', 'https://legacy.australian.software/embed/parramatta.html');
   ```
