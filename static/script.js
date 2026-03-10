function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    
    if (viewId === 'analyzer' || viewId === 'history') {
        const btnIdx = viewId === 'analyzer' ? 0 : 1;
        document.querySelectorAll('.nav-item')[btnIdx].classList.add('active');
    }

    if (viewId === 'history') renderHistoryGrid();
}

const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const analyzeBtn = document.getElementById('analyze-btn');

dropZone.onclick = () => fileInput.click();
fileInput.onchange = (e) => handlePreview(e.target.files[0]);

function handlePreview(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('preview');
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        document.getElementById('upload-placeholder').classList.add('hidden');
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

analyzeBtn.onclick = async () => {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('analysis-result').classList.add('hidden');
    
    try {
        const response = await fetch('/analyze', { method: 'POST', body: formData });
        const data = await response.json();
        
        saveToLocalStorage(data);
        renderResultTemplate('analysis-result', data);
        document.getElementById('analysis-result').classList.remove('hidden');
    } catch (err) {
        alert("Error analyzing product.");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
};

function saveToLocalStorage(data) {
    let history = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
    const newEntry = { ...data, id: Date.now(), date: new Date().toLocaleString() };
    history.unshift(newEntry);
    localStorage.setItem('ecoHistory', JSON.stringify(history));
}

function renderHistoryGrid() {
    const grid = document.getElementById('history-grid');
    const history = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
    
    if (history.length === 0) {
        grid.innerHTML = '<div class="card" style="grid-column: 1/-1; text-align:center;">' +
                         '<p>No scans found. Start by analyzing a product!</p></div>';
        return;
    }

    grid.innerHTML = history.map(item => {
        const historyColorClass = getScoreColorClass(item.sustainability_score);

        return `
            <div class="history-card" onclick="viewDetail('${item.id}')">
                <button class="delete-history-btn" onclick="deleteHistoryItem(event, '${item.id}')" title="Delete Scan">✕</button>
                <h3>${item.product_name}</h3>
                <p><small>${item.date}</small></p>
                <div class="${historyColorClass}" style="font-weight: bold;">
                    Score: ${item.sustainability_score}
                </div>
            </div>
        `;
    }).join('');
}

function deleteHistoryItem(event, id) {
    event.stopPropagation();

    let history = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
    history = history.filter(item => item.id != id);
    localStorage.setItem('ecoHistory', JSON.stringify(history));

    renderHistoryGrid();
}

function clearAllHistory() {
        localStorage.removeItem('ecoHistory');
        renderHistoryGrid();
}


function viewDetail(id) {
    const history = JSON.parse(localStorage.getItem('ecoHistory') || '[]');
    const item = history.find(i => i.id == id);
    
    if (item) {
        renderResultTemplate('detail-content', item);
        showView('detail');
    }
}

function renderResultTemplate(containerId, data) {
    const container = document.getElementById(containerId);
    const template = document.getElementById('result-template').content.cloneNode(true);

    const score = data.sustainability_score;
    const scoreElement = template.querySelector('.score-val');
    const colorClass = getScoreColorClass(score);

    scoreElement.innerText = score;
    scoreElement.classList.add(colorClass);
    
    template.querySelector('.res-name').innerText = data.product_name;
    template.querySelector('.res-category').innerText = data.category;
    template.querySelector('.score-val').innerText = data.sustainability_score;
    template.querySelector('.res-carbon').innerText = data.impact_metrics.carbon_saved;
    template.querySelector('.res-water').innerText = data.impact_metrics.water_saved;
    template.querySelector('.res-air').innerText = data.impact_metrics.air_impact;
    template.querySelector('.res-impact').innerText = data.environmental_impact;
    
    template.querySelector('.res-materials').innerHTML = data.materials_likely_used.map(m => `<li>${m}</li>`).join('');
    template.querySelector('.res-tips').innerHTML = data.sustainability_tips.map(t => `<li>${t}</li>`).join('');
    template.querySelector('.res-alternatives').innerHTML = data.sustainable_alternatives.map(a => `<li>🌿 ${a}</li>`).join('');
    container.innerHTML = '';
    container.appendChild(template);
}

function getScoreColorClass(score) {
    if (score <= 30) return 'score-red';
    if (score <= 60) return 'score-yellow';
    if (score <= 80) return 'score-light-green';
    return 'score-green';
}



const removeBtn = document.getElementById('remove-img-btn');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const preview = document.getElementById('preview');

function handlePreview(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        uploadPlaceholder.classList.add('hidden');
        removeBtn.classList.remove('hidden');
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

removeBtn.onclick = (e) => {
    e.stopPropagation(); 
    resetUpload();
};

function resetUpload() {
    fileInput.value = ""; 
    preview.src = "";
    preview.classList.add('hidden');
    removeBtn.classList.add('hidden');
    uploadPlaceholder.classList.remove('hidden');
    analyzeBtn.disabled = true;
    
    document.getElementById('analysis-result').classList.add('hidden');
}


window.onload = () => showView('analyzer');