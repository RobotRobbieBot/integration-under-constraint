// Integration Under Constraint - Main Application

class IntegrationApp {
  constructor(passages) {
    this.passages = passages;
    this.currentTab = 'study';
    this.selectedFramework = null;
    this.selectedConcept = null;
    this.selectedPassageIndex = 0;
    this.state = this.loadState();
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  loadState() {
    const saved = localStorage.getItem('integrationState');
    return saved ? JSON.parse(saved) : {
      passageRatings: {},
      essays: [],
      lastStudyDate: null,
      sessionsCompleted: 0,
      conceptsStudied: {}
    };
  }

  saveState() {
    localStorage.setItem('integrationState', JSON.stringify(this.state));
  }

  getFrameworks() {
    const frameworks = {};
    this.passages.forEach(p => {
      if (!frameworks[p.framework]) {
        frameworks[p.framework] = [];
      }
      if (!frameworks[p.framework].find(c => c.concept === p.concept)) {
        frameworks[p.framework].push({ concept: p.concept, id: p.id });
      }
    });
    return frameworks;
  }

  getConceptsForFramework(framework) {
    const concepts = {};
    this.passages
      .filter(p => p.framework === framework)
      .forEach(p => {
        if (!concepts[p.concept]) {
          concepts[p.concept] = [];
        }
        concepts[p.concept].push(p);
      });
    return concepts;
  }

  getPassagesForConcept(framework, concept) {
    return this.passages.filter(p => p.framework === framework && p.concept === concept);
  }

  renderStudyTab() {
    const frameworks = this.getFrameworks();
    const frameworkNames = Object.keys(frameworks);

    let html = `
      <div class="container">
        <h2>Study Session</h2>
        <p style="color: var(--color-text-muted);">Select a framework and concept to begin studying passages.</p>
        
        <div style="margin-bottom: var(--spacing-lg);">
          <h3>Select Framework</h3>
          <div class="grid grid-3">
    `;

    frameworkNames.forEach(fw => {
      const passageCount = this.passages.filter(p => p.framework === fw).length;
      const isActive = this.selectedFramework === fw;
      html += `
        <div class="concept-card ${isActive ? 'active' : ''}" onclick="app.selectFramework('${fw}')">
          <div class="concept-name">${fw}</div>
          <div style="font-size: 12px; opacity: 0.7;">${passageCount} passages</div>
        </div>
      `;
    });

    html += `</div></div>`;

    if (this.selectedFramework) {
      const concepts = this.getConceptsForFramework(this.selectedFramework);
      const conceptNames = Object.keys(concepts);

      html += `
        <div style="margin-bottom: var(--spacing-lg);">
          <h3>Select Concept</h3>
          <div class="concept-grid">
      `;

      conceptNames.forEach(concept => {
        const isActive = this.selectedConcept === concept;
        const passageCount = concepts[concept].length;
        html += `
          <div class="concept-card ${isActive ? 'active' : ''}" onclick="app.selectConcept('${concept}')">
            <div class="concept-name">${concept}</div>
            <div style="font-size: 11px; opacity: 0.7;">${passageCount} passages</div>
          </div>
        `;
      });

      html += `</div></div>`;

      if (this.selectedConcept) {
        const passages = this.getPassagesForConcept(this.selectedFramework, this.selectedConcept);
        const passage = passages[this.selectedPassageIndex];

        html += `
          <div class="passage-container">
            <div class="passage-meta">
              <span><strong>Passage ${this.selectedPassageIndex + 1}</strong> of ${passages.length}</span>
              <span class="difficulty-badge difficulty-${passage.difficulty}">Difficulty ${passage.difficulty}</span>
              <span><strong>${passage.author}</strong></span>
              <span>${passage.source}, p. ${passage.page}</span>
            </div>

            <div class="passage-text">"${passage.text}"</div>

            <div class="passage-intent">
              <strong>Intent:</strong> ${passage.intent}
            </div>

            ${passage.understanding ? `
              <div id="understanding-container-${passage.id}" style="margin-top: 12px;"></div>
            ` : ''}

            <div style="margin-top: var(--spacing-lg);">
              <label>Rate your comprehension:</label>
              <div class="rating-control">
        `;

        for (let i = 1; i <= 5; i++) {
          const currentRating = this.state.passageRatings[passage.id] || 0;
          html += `
            <button class="rating-button ${currentRating === i ? 'active' : ''}" onclick="app.ratePassage('${passage.id}', ${i})">${i}</button>
          `;
        }

        html += `
              </div>
              <p style="font-size: 12px; color: var(--color-text-muted);">1 = Confused | 3 = Understand | 5 = Crystal Clear</p>
            </div>

            <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
              <button class="btn btn-primary" onclick="app.nextPassage(${passages.length})">Next Passage</button>
              ${this.selectedPassageIndex > 0 ? `<button class="btn" onclick="app.prevPassage()">Previous</button>` : ''}
              <button class="btn" onclick="app.completedSession()">Session Complete</button>
              <button class="btn" onclick="app.switchTab('study')">Back to Frameworks</button>
            </div>
          </div>
        `;
      }
    }

    document.getElementById('app').innerHTML = html;
  }

  renderDashboardTab() {
    const frameworks = this.getFrameworks();
    const totalPassages = this.passages.length;
    const ratedPassages = Object.keys(this.state.passageRatings).length;
    const progressPercent = Math.round((ratedPassages / totalPassages) * 100);
    
    const avgRating = ratedPassages > 0 
      ? (Object.values(this.state.passageRatings).reduce((a, b) => a + b, 0) / ratedPassages).toFixed(1)
      : 0;

    let html = `
      <div class="container">
        <h2>Dashboard</h2>
        
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-label">Passages Studied</div>
            <div class="stat-value">${ratedPassages}</div>
            <div style="font-size: 12px; color: var(--color-text-muted);">of ${totalPassages}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Progress</div>
            <div class="stat-value">${progressPercent}%</div>
            <div class="progress-bar" style="margin-top: var(--spacing-md);">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Avg Comprehension</div>
            <div class="stat-value">${avgRating}</div>
            <div style="font-size: 12px; color: var(--color-text-muted);">out of 5</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Sessions Completed</div>
            <div class="stat-value">${this.state.sessionsCompleted}</div>
          </div>
        </div>

        <h3>Framework Progress</h3>
        <div class="grid grid-2">
    `;

    Object.entries(frameworks).forEach(([fw, concepts]) => {
      const fwPassages = this.passages.filter(p => p.framework === fw);
      const fwRated = fwPassages.filter(p => this.state.passageRatings[p.id]).length;
      const fwPercent = Math.round((fwRated / fwPassages.length) * 100);

      html += `
        <div class="card">
          <div class="card-header">
            <h3>${fw}</h3>
          </div>
          <div class="card-body">
            <div style="margin-bottom: var(--spacing-md);">
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm); font-size: 13px;">
                <span>${fwRated} / ${fwPassages.length}</span>
                <span class="text-muted">${fwPercent}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${fwPercent}%"></div>
              </div>
            </div>
            <div style="font-size: 13px; color: var(--color-text-muted);">
              ${Object.keys(this.getConceptsForFramework(fw)).length} concepts
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>

        <h3 style="margin-top: var(--spacing-xl);">Weak Passages (Rating 1-2)</h3>
        <div class="grid grid-2">
    `;

    const weakPassages = this.passages.filter(p => {
      const rating = this.state.passageRatings[p.id];
      return rating && rating <= 2;
    });

    if (weakPassages.length === 0) {
      html += `<div style="grid-column: 1/-1; text-align: center; padding: var(--spacing-lg); color: var(--color-text-muted);">No weak passages identified yet. Keep studying!</div>`;
    } else {
      weakPassages.forEach(p => {
        html += `
          <div class="card">
            <div class="card-header">
              <h3 style="margin: 0; font-size: 14px;">${p.concept}</h3>
              <div style="font-size: 11px; color: var(--color-text-muted); margin-top: var(--spacing-xs);">${p.framework} • Difficulty ${p.difficulty}</div>
            </div>
            <div class="card-body" style="font-size: 13px;">
              <p style="margin: 0 0 var(--spacing-sm) 0; font-style: italic;">"${p.text.substring(0, 100)}..."</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="text-muted">Rating: ${this.state.passageRatings[p.id]}/5</span>
                <button class="btn btn-small" onclick="app.reviewPassage('${p.id}')">Review</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;
    document.getElementById('app').innerHTML = html;
  }

  renderSynthesisTab() {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    let html = `
      <div class="container">
        <h2>Monthly Synthesis Essay</h2>
        <p style="color: var(--color-text-muted);">Write a 500-750 word essay connecting concepts from this month and how they apply to your life.</p>

        <div class="card">
          <div class="card-header">
            <h3>${currentMonth}</h3>
          </div>
          <div class="card-body">
            <form onsubmit="app.submitEssay(event)">
              <div class="form-group">
                <label>Your Essay</label>
                <textarea id="essayText" placeholder="Write your synthesis essay here..." required></textarea>
                <div style="font-size: 12px; color: var(--color-text-muted); margin-top: var(--spacing-sm);">
                  <span id="wordCount">0</span> words
                </div>
              </div>

              <div style="display: flex; gap: var(--spacing-md);">
                <button type="submit" class="btn btn-primary">Submit Essay</button>
                <button type="button" class="btn" onclick="app.requestFeedback()">Request Claude Feedback</button>
              </div>
            </form>
          </div>
        </div>

        <h3 style="margin-top: var(--spacing-xl);">Past Essays</h3>
        <div class="grid grid-2">
    `;

    if (this.state.essays.length === 0) {
      html += `<div style="grid-column: 1/-1; text-align: center; padding: var(--spacing-lg); color: var(--color-text-muted);">No essays submitted yet. Start with this month!</div>`;
    } else {
      this.state.essays.forEach((essay, idx) => {
        const date = new Date(essay.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        html += `
          <div class="card">
            <div class="card-header">
              <h3 style="margin: 0;">${date}</h3>
            </div>
            <div class="card-body">
              <p style="margin: 0; font-size: 13px; color: var(--color-text-muted); line-height: 1.6;">${essay.text.substring(0, 150)}...</p>
              <div style="margin-top: var(--spacing-md); font-size: 12px;">
                <button class="btn btn-small" onclick="app.viewEssay(${idx})">View Full</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;
    document.getElementById('app').innerHTML = html;

    // Add word count listener
    const textarea = document.getElementById('essayText');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length;
        document.getElementById('wordCount').textContent = words;
      });
    }
  }

  renderSettingsTab() {
    let html = `
      <div class="container">
        <h2>Settings & Help</h2>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-header">
              <h3>Data Management</h3>
            </div>
            <div class="card-body">
              <button class="btn btn-warning" style="width: 100%; margin-bottom: var(--spacing-md);" onclick="app.exportData()">Export All Data</button>
              <button class="btn btn-danger" style="width: 100%;" onclick="app.resetData()">Reset All Progress</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Statistics</h3>
            </div>
            <div class="card-body">
              <div style="font-size: 13px;">
                <p><strong>Total Passages:</strong> ${this.passages.length}</p>
                <p><strong>Frameworks:</strong> ${Object.keys(this.getFrameworks()).length}</p>
                <p><strong>Storage Used:</strong> ${(new Blob([JSON.stringify(this.state)]).size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top: var(--spacing-lg);">
          <div class="card-header">
            <h3>About This Framework</h3>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.8;">
            <p><strong>Integration Under Constraint</strong> is a depth psychology and stoic practice framework combining Jung, Bowen, Stoicism, Gurdjieff, Frankl, Laing, and Russian testimony.</p>
            <p>This tool scaffolds your active learning through:</p>
            <ul style="margin: var(--spacing-md) 0; padding-left: var(--spacing-lg);">
              <li>Concept browsing across frameworks</li>
              <li>Spaced repetition with comprehension tracking</li>
              <li>Monthly synthesis essays</li>
              <li>Cross-framework integration</li>
            </ul>
            <p><strong>Commitment required:</strong> 3 study sessions/week + 1 essay/month for 12 months.</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
  }

  render() {
    let html = `
      <div class="header">
        <h1>Integration Under Constraint</h1>
        <p>Depth Psychology • Stoic Practice • Systems Awareness • Russian Testimony</p>
      </div>

      <div class="container">
        <div class="nav-tabs">
          <button class="nav-btn ${this.currentTab === 'study' ? 'active' : ''}" onclick="app.switchTab('study')">Study</button>
          <button class="nav-btn ${this.currentTab === 'dashboard' ? 'active' : ''}" onclick="app.switchTab('dashboard')">Dashboard</button>
          <button class="nav-btn ${this.currentTab === 'synthesis' ? 'active' : ''}" onclick="app.switchTab('synthesis')">Synthesis Essays</button>
          <button class="nav-btn ${this.currentTab === 'settings' ? 'active' : ''}" onclick="app.switchTab('settings')">Settings</button>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    // Render the active tab content
    if (this.currentTab === 'study') {
      this.renderStudyTab();
    } else if (this.currentTab === 'dashboard') {
      this.renderDashboardTab();
    } else if (this.currentTab === 'synthesis') {
      this.renderSynthesisTab();
    } else if (this.currentTab === 'settings') {
      this.renderSettingsTab();
    }
  }

  setupEventListeners() {
    // Event listeners set up inline in HTML
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.selectedFramework = null;
    this.selectedConcept = null;
    this.selectedPassageIndex = 0;
    this.render();
  }

  selectFramework(fw) {
    this.selectedFramework = fw;
    this.selectedConcept = null;
    this.selectedPassageIndex = 0;
    this.renderStudyTab();
  }

  selectConcept(concept) {
    this.selectedConcept = concept;
    this.selectedPassageIndex = 0;
    this.renderStudyTab();
  }

  ratePassage(passageId, rating) {
    this.state.passageRatings[passageId] = rating;
    this.saveState();
    this.updateUnderstandingDisplay(passageId, rating);
    this.renderStudyTab();
  }

  updateUnderstandingDisplay(passageId, rating) {
    const container = document.getElementById(`understanding-container-${passageId}`);
    if (!container) return;

    const passage = this.passages.find(p => p.id === passageId);
    if (!passage || !passage.understanding) return;

    let text = '';
    let level = '';
    
    if (rating <= 2) {
      text = passage.understanding.full || passage.understanding;
      level = 'full';
    } else if (rating === 3) {
      text = passage.understanding.medium || passage.understanding.full || passage.understanding;
      level = 'medium';
    } else {
      text = passage.understanding.brief || passage.understanding.medium || passage.understanding;
      level = 'brief';
    }

    container.innerHTML = `
      <div style="background: var(--color-background-secondary); border-radius: 8px; padding: 12px; font-size: 14px; line-height: 1.6;">
        <strong>Understanding:</strong> ${text}
      </div>
    `;
  }

  nextPassage(total) {
    if (this.selectedPassageIndex < total - 1) {
      this.selectedPassageIndex++;
      this.renderStudyTab();
    }
  }

  prevPassage() {
    if (this.selectedPassageIndex > 0) {
      this.selectedPassageIndex--;
      this.renderStudyTab();
    }
  }

  completedSession() {
    this.state.sessionsCompleted += 1;
    this.state.lastStudyDate = new Date().toISOString();
    this.saveState();
    alert('Session completed! Great work. Switch to Dashboard to track progress.');
    this.switchTab('dashboard');
  }

  submitEssay(event) {
    event.preventDefault();
    const text = document.getElementById('essayText').value;
    
    if (text.trim().length === 0) {
      alert('Please write your essay first.');
      return;
    }

    const essay = {
      date: new Date().toISOString(),
      text: text,
      feedback: null
    };

    this.state.essays.push(essay);
    this.saveState();
    
    document.getElementById('essayText').value = '';
    alert('Essay submitted! You can add another next month, or request feedback.');
    this.renderSynthesisTab();
  }

  requestFeedback() {
    alert('Claude feedback feature: Not yet implemented. Copy your essay and paste it in a new chat with Claude.');
  }

  viewEssay(idx) {
    const essay = this.state.essays[idx];
    const date = new Date(essay.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const fullText = `
      <div class="modal active" style="display: flex;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${date}</h2>
            <button class="modal-close" onclick="document.querySelector('.modal').style.display='none'">&times;</button>
          </div>
          <div style="font-size: 14px; line-height: 1.8; color: var(--color-text);">
            ${essay.text.split('\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('app').insertAdjacentHTML('beforeend', fullText);
  }

  reviewPassage(passageId) {
    const passage = this.passages.find(p => p.id === passageId);
    if (passage) {
      this.selectedFramework = passage.framework;
      this.selectedConcept = passage.concept;
      this.selectedPassageIndex = this.passages.indexOf(passage);
      this.switchTab('study');
    }
  }

  exportData() {
    const dataStr = JSON.stringify(this.state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `integration-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  resetData() {
    if (confirm('Are you sure? This will delete all your progress. This cannot be undone.')) {
      this.state = {
        passageRatings: {},
        essays: [],
        lastStudyDate: null,
        sessionsCompleted: 0,
        conceptsStudied: {}
      };
      this.saveState();
      alert('All data reset.');
      this.render();
    }
  }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
  if (typeof passages !== 'undefined') {
    window.app = new IntegrationApp(passages);
  } else {
    document.getElementById('app').innerHTML = '<div class="container"><p style="color: red;">Error: Passages data not loaded. Check data.js file.</p></div>';
  }
});
