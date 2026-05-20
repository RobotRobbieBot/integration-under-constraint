class IntegrationApp {
  constructor(passages) {
    this.passages = passages;
    this.currentPassageIndex = 0;
    this.state = this.loadState();
    this.init();
  }

  init() {
    this.render();
  }

  loadState() {
    const saved = localStorage.getItem('integrationState');
    return saved ? JSON.parse(saved) : {
      passageRatings: {},
      currentIndex: 0,
      sessionsCompleted: 0,
      lastSaved: new Date().toISOString()
    };
  }

  saveState() {
    this.state.currentIndex = this.currentPassageIndex;
    this.state.lastSaved = new Date().toISOString();
    localStorage.setItem('integrationState', JSON.stringify(this.state));
  }

  getCurrentPassage() {
    return this.passages[this.currentPassageIndex] || null;
  }

  getStats() {
    const totalPassages = this.passages.length;
    const ratedPassages = Object.keys(this.state.passageRatings).length;
    const progressPercent = Math.round((ratedPassages / totalPassages) * 100);
    
    const avgRating = ratedPassages > 0
      ? (Object.values(this.state.passageRatings).reduce((a, b) => a + b, 0) / ratedPassages).toFixed(1)
      : 0;

    const weakPassages = this.passages.filter(p => {
      const rating = this.state.passageRatings[p.id];
      return rating && rating <= 2;
    });

    return {
      totalPassages,
      ratedPassages,
      progressPercent,
      avgRating,
      weakPassages
    };
  }

  ratePassage(rating) {
    const passage = this.getCurrentPassage();
    if (passage) {
      this.state.passageRatings[passage.id] = rating;
      this.saveState();
      this.render();
    }
  }

  nextPassage() {
    if (this.currentPassageIndex < this.passages.length - 1) {
      this.currentPassageIndex++;
      this.saveState();
      this.render();
    }
  }

  prevPassage() {
    if (this.currentPassageIndex > 0) {
      this.currentPassageIndex--;
      this.saveState();
      this.render();
    }
  }

  goToPassage(id) {
    const index = this.passages.findIndex(p => p.id === id);
    if (index !== -1) {
      this.currentPassageIndex = index;
      this.saveState();
      this.render();
    }
  }

  filterByFramework(framework) {
    const firstPassageInFramework = this.passages.findIndex(p => p.framework === framework);
    if (firstPassageInFramework !== -1) {
      this.currentPassageIndex = firstPassageInFramework;
      this.saveState();
      this.render();
    }
  }

  filterByConcept(concept) {
    const firstPassageInConcept = this.passages.findIndex(p => p.concept === concept);
    if (firstPassageInConcept !== -1) {
      this.currentPassageIndex = firstPassageInConcept;
      this.saveState();
      this.render();
    }
  }

  render() {
    const passage = this.getCurrentPassage();
    const stats = this.getStats();
    const currentRating = passage ? this.state.passageRatings[passage.id] || 0 : 0;

    // Get frameworks and concepts for filtering
    const frameworks = {};
    this.passages.forEach(p => {
      if (!frameworks[p.framework]) frameworks[p.framework] = new Set();
      frameworks[p.framework].add(p.concept);
    });

    const selectedFramework = passage?.framework || null;
    const selectedConcept = passage?.concept || null;
    const frameworkConcepts = selectedFramework ? Array.from(frameworks[selectedFramework]).sort() : [];

    let understanding = '';
    if (passage && passage.understanding && currentRating) {
      const u = passage.understanding;
      if (typeof u === 'string') {
        understanding = u;
      } else if (typeof u === 'object') {
        if (currentRating <= 2) {
          understanding = u.full || u.medium || u.brief || '';
        } else if (currentRating === 3) {
          understanding = u.medium || u.full || u.brief || '';
        } else {
          understanding = u.brief || u.medium || u.full || '';
        }
      }
    }

    const html = `
      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 16px; padding: 16px; min-height: 100vh; background: var(--color-background-tertiary);">
        
        <div style="display: flex; flex-direction: column; gap: 16px; height: fit-content; position: sticky; top: 16px;">
          
          <div style="background: white; border-radius: 8px; padding: 16px; border: 0.5px solid var(--color-border-tertiary);">
            <h3 style="margin: 0 0 12px 0; font-size: 13px; color: var(--color-text-muted); text-transform: uppercase;">Framework</h3>
            <div style="display: grid; gap: 6px;">
              ${Object.keys(frameworks).sort().map(fw => `
                <button onclick="app.filterByFramework('${fw}')" style="padding: 8px 12px; background: ${selectedFramework === fw ? '#3498db' : 'white'}; color: ${selectedFramework === fw ? 'white' : 'var(--color-text-primary)'}; border: 0.5px solid ${selectedFramework === fw ? '#3498db' : 'var(--color-border-tertiary)'}; border-radius: 4px; cursor: pointer; font-size: 12px; text-align: left;">
                  ${fw}
                </button>
              `).join('')}
            </div>
          </div>

          ${selectedFramework ? `
            <div style="background: white; border-radius: 8px; padding: 16px; border: 0.5px solid var(--color-border-tertiary);">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; color: var(--color-text-muted); text-transform: uppercase;">Concept</h3>
              <div style="display: grid; gap: 6px; max-height: 300px; overflow-y: auto;">
                ${frameworkConcepts.map(concept => `
                  <button onclick="app.filterByConcept('${concept}')" style="padding: 8px 12px; background: ${selectedConcept === concept ? '#3498db' : 'white'}; color: ${selectedConcept === concept ? 'white' : 'var(--color-text-primary)'}; border: 0.5px solid ${selectedConcept === concept ? '#3498db' : 'var(--color-border-tertiary)'}; border-radius: 4px; cursor: pointer; font-size: 11px; text-align: left;">
                    ${concept}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="background: white; border-radius: 8px; padding: 16px; border: 0.5px solid var(--color-border-tertiary);">
            <h3 style="margin: 0 0 12px 0; font-size: 13px;">Progress</h3>
            
            <div style="margin-bottom: 12px;">
              <div style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 4px;">Overall</div>
              <div style="font-size: 20px; font-weight: 600; color: var(--color-text-primary);">${stats.ratedPassages}</div>
              <div style="font-size: 11px; color: var(--color-text-muted);">of ${stats.totalPassages}</div>
              <div style="background: var(--color-background-secondary); height: 4px; border-radius: 2px; margin-top: 6px; overflow: hidden;">
                <div style="background: #3498db; height: 100%; width: ${stats.progressPercent}%"></div>
              </div>
            </div>

            <div style="padding-top: 12px; border-top: 0.5px solid var(--color-border-tertiary);">
              <div style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 4px;">Comprehension</div>
              <div style="font-size: 20px; font-weight: 600; color: #3498db;">${stats.avgRating}</div>
              <div style="font-size: 10px; color: var(--color-text-muted);">of 5</div>
            </div>

            ${stats.weakPassages.length > 0 ? `
              <div style="padding-top: 12px; border-top: 0.5px solid var(--color-border-tertiary); margin-top: 12px;">
                <div style="font-size: 11px; color: #e74c3c; font-weight: 500; margin-bottom: 6px;">Weak (1-2): ${stats.weakPassages.length}</div>
                <div style="display: grid; gap: 3px; max-height: 120px; overflow-y: auto;">
                  ${stats.weakPassages.slice(0, 5).map(p => `
                    <button onclick="app.goToPassage('${p.id}')" style="padding: 4px 8px; font-size: 10px; background: #fadbd8; border: 0.5px solid #f5b7b1; border-radius: 3px; cursor: pointer; text-align: left; color: #c0392b;">
                      ${p.framework}: ${p.concept.substring(0, 14)}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div style="display: flex; flex-direction: column;">
          ${passage ? `
            <div style="background: white; border-radius: 8px; padding: 24px; border: 0.5px solid var(--color-border-tertiary); flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 0.5px solid var(--color-border-tertiary);">
                <div>
                  <span style="font-size: 12px; color: var(--color-text-muted);">Passage ${this.currentPassageIndex + 1} of ${this.passages.length}</span>
                  <span style="font-size: 11px; background: #f0f4f8; color: #185fa5; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">Difficulty ${passage.difficulty}</span>
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <div style="font-size: 14px; font-weight: 500; color: var(--color-text-muted); margin-bottom: 8px;">${passage.author} — ${passage.source}</div>
              </div>

              <div style="font-size: 16px; line-height: 1.7; font-style: italic; color: var(--color-text-primary); margin-bottom: 16px; padding-left: 12px; border-left: 3px solid #3498db;">
                "${passage.text}"
              </div>

              <div style="background: var(--color-background-secondary); padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;">
                <strong>Intent:</strong> ${passage.intent}
              </div>

              ${understanding ? `
                <div style="background: #f0f7ff; padding: 12px; border-radius: 8px; border-left: 3px solid #3498db; margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                  <strong>Understanding:</strong> ${understanding}
                </div>
              ` : ''}

              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 13px;">Rate your comprehension:</label>
                <div style="display: flex; gap: 8px;">
                  ${[1,2,3,4,5].map(i => `
                    <button onclick="app.ratePassage(${i})" style="width: 40px; height: 40px; border: 0.5px solid ${currentRating === i ? '#3498db' : 'var(--color-border-secondary)'}; background: ${currentRating === i ? '#3498db' : 'white'}; color: ${currentRating === i ? 'white' : 'var(--color-text-primary)'}; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
                      ${i}
                    </button>
                  `).join('')}
                </div>
                <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">1 = Confused | 3 = Understand | 5 = Clear</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 16px;">
              <button onclick="app.prevPassage()" style="padding: 8px 16px; background: white; border: 0.5px solid var(--color-border-secondary); border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;" ${this.currentPassageIndex === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                ← Previous
              </button>
              <button onclick="app.nextPassage()" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;" ${this.currentPassageIndex === this.passages.length - 1 ? 'disabled style="opacity: 0.5;"' : ''}>
                Next →
              </button>
              <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; font-size: 11px; color: var(--color-text-muted);">
                Session saved: ${new Date(this.state.lastSaved).toLocaleTimeString()}
              </div>
            </div>
          ` : '<div style="padding: 24px; color: var(--color-text-muted);">No passages loaded</div>'}
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
  }
}

let app;
async function loadPassages() {
  try {
    const response = await fetch('./data/passages-complete.json');
    const data = await response.json();
    app = new IntegrationApp(data.passages);
  } catch (error) {
    console.error('Error loading passages:', error);
    document.getElementById('app').innerHTML = '<div style="padding: 24px; color: red;">Error loading passages</div>';
  }
}

document.addEventListener('DOMContentLoaded', loadPassages);
