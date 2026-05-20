class IntegrationApp {
  constructor(passages) {
    this.passages = passages;
    this.currentIndex = 0;
    this.state = this.loadState();
    this.init();
  }

  init() {
    this.render();
  }

  loadState() {
    const saved = localStorage.getItem('integrationState');
    return saved ? JSON.parse(saved) : {
      ratings: {},
      currentIndex: 0,
      lastSaved: new Date().toISOString()
    };
  }

  saveState() {
    this.state.currentIndex = this.currentIndex;
    this.state.lastSaved = new Date().toISOString();
    localStorage.setItem('integrationState', JSON.stringify(this.state));
  }

  getFrameworks() {
    const fw = {};
    this.passages.forEach(p => {
      if (!fw[p.framework]) fw[p.framework] = new Set();
      fw[p.framework].add(p.concept);
    });
    return fw;
  }

  getStats() {
    const total = this.passages.length;
    const rated = Object.keys(this.state.ratings).length;
    const avg = rated > 0 ? (Object.values(this.state.ratings).reduce((a,b) => a+b, 0) / rated).toFixed(1) : 0;
    const weak = this.passages.filter(p => this.state.ratings[p.id] && this.state.ratings[p.id] <= 2);
    return { total, rated, percent: Math.round((rated/total)*100), avg, weak };
  }

  getCurrentPassage() {
    return this.passages[this.currentIndex];
  }

  rate(rating) {
    const p = this.getCurrentPassage();
    this.state.ratings[p.id] = rating;
    this.saveState();
    this.render();
  }

  next() {
    if (this.currentIndex < this.passages.length - 1) {
      this.currentIndex++;
      this.saveState();
      this.render();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.saveState();
      this.render();
    }
  }

  goToFramework(fw) {
    const idx = this.passages.findIndex(p => p.framework === fw);
    if (idx !== -1) {
      this.currentIndex = idx;
      this.saveState();
      this.render();
    }
  }

  goToConcept(concept) {
    const idx = this.passages.findIndex(p => p.concept === concept);
    if (idx !== -1) {
      this.currentIndex = idx;
      this.saveState();
      this.render();
    }
  }

  goToPassage(id) {
    const idx = this.passages.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.currentIndex = idx;
      this.saveState();
      this.render();
    }
  }

  newSession() {
    if (confirm('Clear all progress and start fresh?')) {
      localStorage.clear();
      this.state = { ratings: {}, currentIndex: 0, lastSaved: new Date().toISOString() };
      this.currentIndex = 0;
      this.render();
    }
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const p = this.getCurrentPassage();
    const stats = this.getStats();
    const fw = this.getFrameworks();
    const rating = p ? this.state.ratings[p.id] || 0 : 0;

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.style.cssText = 'display:flex;flex-direction:column;gap:16px;width:300px;padding:16px;background:#f8f9fa;border-radius:8px;height:fit-content;position:sticky;top:16px;';

    // Framework selector
    const fwDiv = document.createElement('div');
    fwDiv.style.cssText = 'background:white;padding:16px;border-radius:8px;border:0.5px solid #ddd;';
    const fwTitle = document.createElement('h3');
    fwTitle.textContent = 'Framework';
    fwTitle.style.cssText = 'margin:0 0 12px 0;font-size:13px;color:#888;text-transform:uppercase;';
    fwDiv.appendChild(fwTitle);

    const fwGrid = document.createElement('div');
    fwGrid.style.cssText = 'display:grid;gap:6px;';
    
    Object.keys(fw).sort().forEach(f => {
      const btn = document.createElement('button');
      btn.textContent = f;
      btn.onclick = () => this.goToFramework(f);
      btn.style.cssText = `padding:8px 12px;border-radius:4px;border:0.5px solid ${p?.framework === f ? '#3498db' : '#ddd'};background:${p?.framework === f ? '#3498db' : 'white'};color:${p?.framework === f ? 'white' : '#333'};cursor:pointer;font-size:12px;`;
      fwGrid.appendChild(btn);
    });
    fwDiv.appendChild(fwGrid);
    sidebar.appendChild(fwDiv);

    // Concept selector
    if (p?.framework) {
      const conceptDiv = document.createElement('div');
      conceptDiv.style.cssText = 'background:white;padding:16px;border-radius:8px;border:0.5px solid #ddd;max-height:300px;overflow-y:auto;';
      const cTitle = document.createElement('h3');
      cTitle.textContent = 'Concept';
      cTitle.style.cssText = 'margin:0 0 12px 0;font-size:13px;color:#888;text-transform:uppercase;';
      conceptDiv.appendChild(cTitle);

      const cGrid = document.createElement('div');
      cGrid.style.cssText = 'display:grid;gap:6px;';
      
      Array.from(fw[p.framework]).sort().forEach(c => {
        const btn = document.createElement('button');
        btn.textContent = c;
        btn.onclick = () => this.goToConcept(c);
        btn.style.cssText = `padding:8px 12px;border-radius:4px;border:0.5px solid ${p.concept === c ? '#3498db' : '#ddd'};background:${p.concept === c ? '#3498db' : 'white'};color:${p.concept === c ? 'white' : '#333'};cursor:pointer;font-size:11px;`;
        cGrid.appendChild(btn);
      });
      conceptDiv.appendChild(cGrid);
      sidebar.appendChild(conceptDiv);
    }

    // Progress
    const progDiv = document.createElement('div');
    progDiv.style.cssText = 'background:white;padding:16px;border-radius:8px;border:0.5px solid #ddd;';
    const pTitle = document.createElement('h3');
    pTitle.textContent = 'Progress';
    pTitle.style.cssText = 'margin:0 0 12px 0;font-size:13px;';
    progDiv.appendChild(pTitle);

    const stat1 = document.createElement('div');
    stat1.style.cssText = 'margin-bottom:12px;';
    stat1.innerHTML = `<div style="font-size:11px;color:#888;margin-bottom:4px;">Studied</div><div style="font-size:20px;font-weight:600;color:#333;">${stats.rated}</div><div style="font-size:11px;color:#888;">of ${stats.total} (${stats.percent}%)</div><div style="background:#e0e0e0;height:4px;border-radius:2px;margin-top:6px;overflow:hidden;"><div style="background:#3498db;height:100%;width:${stats.percent}%;"></div></div>`;
    progDiv.appendChild(stat1);

    const stat2 = document.createElement('div');
    stat2.style.cssText = 'padding-top:12px;border-top:0.5px solid #ddd;';
    stat2.innerHTML = `<div style="font-size:11px;color:#888;margin-bottom:4px;">Comprehension</div><div style="font-size:20px;font-weight:600;color:#3498db;">${stats.avg}</div><div style="font-size:10px;color:#888;">of 5</div>`;
    progDiv.appendChild(stat2);

    if (stats.weak.length > 0) {
      const weakDiv = document.createElement('div');
      weakDiv.style.cssText = 'padding-top:12px;margin-top:12px;border-top:0.5px solid #ddd;';
      const wTitle = document.createElement('div');
      wTitle.style.cssText = 'font-size:11px;color:#e74c3c;font-weight:500;margin-bottom:6px;';
      wTitle.textContent = `Weak (1-2): ${stats.weak.length}`;
      weakDiv.appendChild(wTitle);

      const wGrid = document.createElement('div');
      wGrid.style.cssText = 'display:grid;gap:3px;max-height:120px;overflow-y:auto;';
      stats.weak.slice(0, 5).forEach(w => {
        const btn = document.createElement('button');
        btn.textContent = `${w.framework}: ${w.concept.substring(0,14)}`;
        btn.onclick = () => this.goToPassage(w.id);
        btn.style.cssText = 'padding:4px 8px;font-size:10px;background:#fadbd8;border:0.5px solid #f5b7b1;border-radius:3px;cursor:pointer;text-align:left;color:#c0392b;';
        wGrid.appendChild(btn);
      });
      weakDiv.appendChild(wGrid);
      progDiv.appendChild(weakDiv);
    }

    const newBtn = document.createElement('button');
    newBtn.textContent = 'New Session';
    newBtn.onclick = () => this.newSession();
    newBtn.style.cssText = 'padding:8px 12px;background:#e74c3c;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:500;margin-top:16px;';
    progDiv.appendChild(newBtn);
    sidebar.appendChild(progDiv);

    // Main content
    const content = document.createElement('div');
    content.style.cssText = 'display:flex;flex-direction:column;flex:1;';

    if (p) {
      const card = document.createElement('div');
      card.style.cssText = 'background:white;border-radius:8px;padding:24px;border:0.5px solid #ddd;flex:1;';

      const meta = document.createElement('div');
      meta.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:16px;border-bottom:0.5px solid #ddd;';
      meta.innerHTML = `<div><span style="font-size:12px;color:#888;">Passage ${this.currentIndex + 1} of ${this.passages.length}</span><span style="font-size:11px;background:#f0f4f8;color:#185fa5;padding:2px 8px;border-radius:4px;margin-left:8px;">Difficulty ${p.difficulty}</span></div>`;
      card.appendChild(meta);

      const author = document.createElement('div');
      author.style.cssText = 'font-size:14px;font-weight:500;color:#888;margin-bottom:8px;';
      author.textContent = `${p.author} — ${p.source}`;
      card.appendChild(author);

      const text = document.createElement('div');
      text.style.cssText = 'font-size:16px;line-height:1.7;font-style:italic;color:#333;margin-bottom:16px;padding-left:12px;border-left:3px solid #3498db;';
      text.textContent = `"${p.text}"`;
      card.appendChild(text);

      const intent = document.createElement('div');
      intent.style.cssText = 'background:#f0f4f8;padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;';
      intent.innerHTML = `<strong>Intent:</strong> ${p.intent}`;
      card.appendChild(intent);

      if (p.understanding && rating) {
        const u = p.understanding;
        let uText = '';
        if (typeof u === 'string') {
          uText = u;
        } else if (typeof u === 'object') {
          if (rating <= 2) uText = u.full || u.medium || u.brief || '';
          else if (rating === 3) uText = u.medium || u.full || u.brief || '';
          else uText = u.brief || u.medium || u.full || '';
        }
        if (uText) {
          const understand = document.createElement('div');
          understand.style.cssText = 'background:#f0f7ff;padding:12px;border-radius:8px;border-left:3px solid #3498db;margin-bottom:16px;font-size:13px;line-height:1.6;';
          understand.innerHTML = `<strong>Understanding:</strong> ${uText}`;
          card.appendChild(understand);
        }
      }

      const ratingDiv = document.createElement('div');
      ratingDiv.style.cssText = 'margin-bottom:16px;';
      const ratingLabel = document.createElement('label');
      ratingLabel.style.cssText = 'display:block;margin-bottom:8px;font-weight:500;font-size:13px;';
      ratingLabel.textContent = 'Rate your comprehension:';
      ratingDiv.appendChild(ratingLabel);

      const ratingBtns = document.createElement('div');
      ratingBtns.style.cssText = 'display:flex;gap:8px;';
      [1,2,3,4,5].forEach(r => {
        const btn = document.createElement('button');
        btn.textContent = r;
        btn.onclick = () => this.rate(r);
        btn.style.cssText = `width:40px;height:40px;border:0.5px solid ${rating === r ? '#3498db' : '#ddd'};background:${rating === r ? '#3498db' : 'white'};color:${rating === r ? 'white' : '#333'};border-radius:6px;cursor:pointer;font-weight:600;font-size:14px;`;
        ratingBtns.appendChild(btn);
      });
      ratingDiv.appendChild(ratingBtns);
      card.appendChild(ratingDiv);

      content.appendChild(card);

      const navDiv = document.createElement('div');
      navDiv.style.cssText = 'display:flex;gap:12px;margin-top:16px;';

      const prevBtn = document.createElement('button');
      prevBtn.textContent = '← Previous';
      prevBtn.onclick = () => this.prev();
      prevBtn.disabled = this.currentIndex === 0;
      prevBtn.style.cssText = `padding:8px 16px;background:white;border:0.5px solid #ddd;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;${this.currentIndex === 0 ? 'opacity:0.5;' : ''}`;
      navDiv.appendChild(prevBtn);

      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next →';
      nextBtn.onclick = () => this.next();
      nextBtn.disabled = this.currentIndex === this.passages.length - 1;
      nextBtn.style.cssText = `padding:8px 16px;background:#3498db;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;${this.currentIndex === this.passages.length - 1 ? 'opacity:0.5;' : ''}`;
      navDiv.appendChild(nextBtn);

      const saved = document.createElement('div');
      saved.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:flex-end;font-size:11px;color:#888;';
      saved.textContent = `Session saved: ${new Date(this.state.lastSaved).toLocaleTimeString()}`;
      navDiv.appendChild(saved);

      content.appendChild(navDiv);
    }

    const container = document.createElement('div');
    container.style.cssText = 'display:grid;grid-template-columns:300px 1fr;gap:16px;padding:16px;min-height:100vh;background:#f8f9fa;';
    container.appendChild(sidebar);
    container.appendChild(content);

    app.appendChild(container);
  }
}

let app;
async function loadPassages() {
  try {
    const url = window.location.hostname === 'localhost' 
      ? './passages-complete.json'
      : '/integration-under-constraint/passages-complete.json';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    app = new IntegrationApp(data.passages);
  } catch (error) {
    console.error('Fetch error:', error);
    document.getElementById('app').innerHTML = `<div style="padding:24px;color:red;">Error: ${error.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadPassages);
