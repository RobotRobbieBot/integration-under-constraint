// Data loader for Integration Under Constraint

// This will be populated by fetch from ../data/passages-complete.json
let passages = [];

// Fetch passages on page load
async function loadPassages() {
  try {
    const response = await fetch('../data/passages-complete.json');
    if (!response.ok) throw new Error('Failed to load passages');
    
    const data = await response.json();
    passages = data.passages || [];
    
    console.log(`Loaded ${passages.length} passages`);
    
    // Initialize app once data is loaded
    if (typeof IntegrationApp !== 'undefined') {
      window.app = new IntegrationApp(passages);
    }
  } catch (error) {
    console.error('Error loading passages:', error);
    
    // Fallback: use empty array and show error
    passages = [];
    document.getElementById('app').innerHTML = `
      <div class="container" style="margin-top: 40px;">
        <div class="card" style="border-color: #e74c3c;">
          <div class="card-header">
            <h3 style="color: #e74c3c;">Error Loading Data</h3>
          </div>
          <div class="card-body">
            <p>Could not load passages from data file. This is likely because the file path is incorrect or the file structure doesn't match.</p>
            <p><strong>Solution:</strong> Make sure passages-complete.json is in the /data folder at the same level as /public.</p>
            <p style="font-family: monospace; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              Error: ${error.message}
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

// Call fetch when DOM is ready
document.addEventListener('DOMContentLoaded', loadPassages);
