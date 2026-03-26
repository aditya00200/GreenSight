document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

function appShowView(viewId) {
  ['scan','history','detail'].forEach(v => {
    document.getElementById(`app-${v}`).classList.add('hidden');
  });
  document.getElementById(`app-${viewId}`).classList.remove('hidden');

  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  const sbMap = { scan: 'sb-scan', history: 'sb-history' };
  if (sbMap[viewId]) document.getElementById(sbMap[viewId]).classList.add('active');

  if (viewId === 'history') renderHistoryGrid();
}

const fileInput  = document.getElementById('file-input');
const dropZone   = document.getElementById('drop-zone');
const preview    = document.getElementById('preview');
const removeBtn  = document.getElementById('remove-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const placeholder = document.getElementById('upload-placeholder');

fileInput.addEventListener('change', e => handlePreview(e.target.files[0]));

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handlePreview(e.dataTransfer.files[0]);
});

function handlePreview(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.classList.add('show');
    placeholder.classList.add('hidden');
    removeBtn.classList.add('show');
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function resetUpload(e) {
  if (e) e.stopPropagation();
  fileInput.value = '';
  preview.src = '';
  preview.classList.remove('show');
  removeBtn.classList.remove('show');
  placeholder.classList.remove('hidden');
  analyzeBtn.disabled = true;
  const r = document.getElementById('analysis-result');
  r.classList.remove('show');
  r.innerHTML = '';
}

async function analyzeProduct() {
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  document.getElementById('loader').classList.add('show');
  const resultEl = document.getElementById('analysis-result');
  resultEl.classList.remove('show');
  resultEl.innerHTML = '';

  try {
    const resp = await fetch('/analyze', { method: 'POST', body: formData });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    saveToHistory(data);
    renderResult('analysis-result', data);
    resultEl.classList.add('show');
  } catch (err) {
    resultEl.innerHTML = `<div class="info-card" style="color:var(--red);">Error: ${err.message}</div>`;
    resultEl.classList.add('show');
  } finally {
    document.getElementById('loader').classList.remove('show');
  }
}

function saveToHistory(data) {
  let h = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
  h.unshift({ ...data, id: Date.now(), date: new Date().toLocaleString() });
  localStorage.setItem('ecoHistory', JSON.stringify(h));
}

function renderHistoryGrid() {
  const grid = document.getElementById('history-grid');
  const h = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
  if (!h.length) {
    grid.innerHTML = '<div class="empty-state"><div class="e-icon">🌱</div><p>No scans yet. Try analyzing a product!</p></div>';
    return;
  }
  grid.innerHTML = h.map(item => {
    const cls = scoreClass(item.sustainability_score);
    return `<div class="history-card" onclick="viewDetail(${item.id})">
      <button class="del-btn" onclick="deleteItem(event,${item.id})">✕</button>
      <h3>${item.product_name}</h3>
      <small>${item.date}</small>
      <div class="history-score ${cls}">${item.sustainability_score}</div>
    </div>`;
  }).join('');
}

function deleteItem(e, id) {
  e.stopPropagation();
  let h = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
  localStorage.setItem('ecoHistory', JSON.stringify(h.filter(i => i.id != id)));
  renderHistoryGrid();
}

function clearAllHistory() {
  localStorage.removeItem('ecoHistory');
  renderHistoryGrid();
}

function viewDetail(id) {
  const h = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
  const item = h.find(i => i.id == id);
  if (!item) return;
  renderResult('detail-content', item);
  appShowView('detail');
}

function renderResult(containerId, data) {
  const container = document.getElementById(containerId);
  const t = document.getElementById('result-template').content.cloneNode(true);

  const score = data.sustainability_score;
  const cls = scoreClass(score);

  t.querySelector('.res-name').textContent = data.product_name;
  t.querySelector('.res-category').textContent = data.category;
  t.querySelector('.res-score').textContent = score;
  t.querySelector('.res-score-circle').classList.add(cls);
  t.querySelector('.res-carbon').textContent = data.impact_metrics.carbon_saved;
  t.querySelector('.res-water').textContent = data.impact_metrics.water_saved;
  t.querySelector('.res-air').textContent = data.impact_metrics.air_impact;
  t.querySelector('.res-impact').textContent = data.environmental_impact;

  t.querySelector('.res-materials').innerHTML = data.materials_likely_used.map(m => `<li>${m}</li>`).join('');
  t.querySelector('.res-tips').innerHTML = data.sustainability_tips.map(tip => `<li>${tip}</li>`).join('');
  t.querySelector('.res-alternatives').innerHTML = data.sustainable_alternatives.map(a => `<li>🌿 ${a}</li>`).join('');

  container.innerHTML = '';
  container.appendChild(t);
}

function scoreClass(s) {
  if (s <= 30) return 'score-red';
  if (s <= 60) return 'score-amber';
  if (s <= 80) return 'score-lime';
  return 'score-green';
}
