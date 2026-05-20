let passages = [];

async function loadPassages() {
  try {
    const response = await fetch('./data/passages-complete.json');
    if (!response.ok) throw new Error('Failed to load passages');
    
    const data = await response.json();
    passages = data.passages || [];
    
    console.log(`Loaded ${passages.length} passages`);
    
    if (typeof IntegrationApp !== 'undefined') {
      window.app = new IntegrationApp(passages);
    }
  } catch (error) {
    console.error('Error loading passages:', error);
    passages = [];
    document.getElementById('app').innerHTML = `
      <div class="container" style="margin-top: 40px;">
        <div class="card" style="border-color: #e74c3c;">
          <div class="card-header">
            <h3 style="color: #e74c3c;">Error Loading Data</h3>
          </div>
          <div class="card-body">
            <p>Could not load passages from data file.</p>
            <p><strong>Error:</strong> ${error.message}</p>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadPassages);
