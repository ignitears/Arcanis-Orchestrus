const SHEET_ID = '1_WmuacRIxJVBFx1FePFf8uRJBzvdYRSJBPmINQNToxo';
let cardsData = [];

// Load Google Sheet via JSONP script injection to bypass local file:// CORS blocks
function fetchArcanaCards() {
    const gallery = document.getElementById('major-gallery');
    console.log("Connecting to Google Sheets...");

    const oldScript = document.getElementById('sheet-jsonp');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = 'sheet-jsonp';
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:handleSheetData&headers=0&t=${Date.now()}`;
    script.onerror = () => {
        gallery.innerHTML = '<p style="color:red;">Failed to connect to Google Sheets. Check internet connection or Sheet ID.</p>';
    };
    document.body.appendChild(script);
}

// Callback triggered automatically when Google Sheets returns the data
function handleSheetData(response) {
    const gallery = document.getElementById('major-gallery');

    try {
        if (!response || !response.table || !response.table.rows) {
            throw new Error("Invalid response from Google Sheets.");
        }

        const parsedRows = response.table.rows.map(r =>
            (r.c || []).map(cell => (cell && cell.v !== null && cell.v !== undefined) ? String(cell.v).trim() : '')
        ).filter(row => row.some(cell => cell !== ''));

        if (parsedRows.length <= 1) {
            throw new Error("No card rows found in the spreadsheet.");
        }

        const headers = parsedRows.shift().map(h => h.toLowerCase());
        console.log("Detected Headers:", headers);
        console.log("Parsed Rows:", parsedRows);

        // Automatically match columns even if an ID column shifts Tab 1 to Column E
        const tab1Idx = headers.findIndex(h => h.includes('tab 1') || h.includes('tab1'));
        const offset = (tab1Idx > 3) ? (tab1Idx - 3) : 0;

        const findCol = (keywords, fallbackIdx) => {
            const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
            return idx !== -1 ? idx : fallbackIdx;
        };

        const nameIdx = findCol(['name', 'title', 'card'], 0 + offset);
        const typeIdx = findCol(['arcana', 'type', 'category', 'rank'], 1 + offset);
        const imgIdx  = findCol(['image', 'img', 'url', 'pic', 'art', 'link'], 2 + offset);
        const t1Idx   = tab1Idx !== -1 ? tab1Idx : 3;
        const t2Idx   = findCol(['tab 2', 'tab2'], t1Idx + 1);
        const t3Idx   = findCol(['tab 3', 'tab3'], t1Idx + 2);
        const t4Idx   = findCol(['tab 4', 'tab4'], t1Idx + 3);

        cardsData = parsedRows.map(columns => ({
            name: columns[nameIdx] || 'Unknown',
            arcanaType: columns[typeIdx] || 'Minor',
            imageUrl: columns[imgIdx] || '',
            tab1: columns[t1Idx] || 'No data recorded.',
            tab2: columns[t2Idx] || 'No data recorded.',
            tab3: columns[t3Idx] || 'No data recorded.',
            tab4: columns[t4Idx] || 'No data recorded.'
        })).filter(c => c.name !== 'Unknown');

        console.log("Cards loaded:", cardsData.length);
        renderGallery();

    } catch (error) {
        console.error("Data Hub Error:", error);
        gallery.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

function renderGallery() {
    const majorGallery = document.getElementById('major-gallery');
    const minorGallery = document.getElementById('minor-gallery');

    majorGallery.innerHTML = '';
    minorGallery.innerHTML = '';

    // 1. Separate cards and save their original Data Hub index for the modal
    let majorCards = [];
    let minorCards = [];

    cardsData.forEach((card, index) => {
        card.originalIndex = index;
        if (card.arcanaType.toLowerCase().includes('major')) {
            majorCards.push(card);
        } else {
            minorCards.push(card);
        }
    });

    // 2. Identify and label the suit of a card
    const getSuitInfo = (card) => {
        const text = (card.name + " " + card.arcanaType).toLowerCase();
        if (text.includes('wand')) return { weight: 1, name: "WANDS" };
        if (text.includes('cup')) return { weight: 2, name: "CUPS" };
        if (text.includes('sword')) return { weight: 3, name: "SWORDS" };
        if (text.includes('pentacle') || text.includes('coin')) return { weight: 4, name: "PENTACLES" };
        return { weight: 5, name: "OTHER MINOR ARCANA" };
    };

    // Sort Minor cards by suit so they group together natively
    minorCards.sort((a, b) => getSuitInfo(a).weight - getSuitInfo(b).weight);

    // 3. Helper to build the visual card HTML (with optional minor shrink)
    const buildCardHTML = (card, isMinor = false) => {
        const cardEl = document.createElement('div');
        cardEl.className = isMinor ? 'gallery-card minor-card' : 'gallery-card';
        
        cardEl.onclick = () => openModal(card.originalIndex); 

        if (card.imageUrl) {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.alt = card.name;
            cardEl.appendChild(img);
        } else {
            cardEl.innerText = card.name;
            cardEl.style.color = 'var(--accent)';
            cardEl.style.fontWeight = 'bold';
            cardEl.style.textAlign = 'center';
            cardEl.style.padding = '10px';
        }
        return cardEl;
    };

    // 4. Render Major Arcana normally (Untouched)
    majorCards.forEach(card => majorGallery.appendChild(buildCardHTML(card, false)));

    // 5. Render Minor Arcana with Headers and rigid 7-card row breaks
    let lastSuitWeight = -1;
    let suitCardCount = 0;

    minorCards.forEach(card => {
        const suitInfo = getSuitInfo(card);
        
        // Insert a Header Text Break when the suit changes
        if (lastSuitWeight !== suitInfo.weight) {
            const labelEl = document.createElement('div');
            labelEl.className = 'suit-label';
            labelEl.innerText = suitInfo.name;
            minorGallery.appendChild(labelEl);
            
            lastSuitWeight = suitInfo.weight;
            suitCardCount = 0; // Reset counter for the new suit group
        }
        
        // Enforce the "7 per row" layout by inserting an invisible break EVERY 7 cards
        if (suitCardCount > 0 && suitCardCount % 7 === 0) {
            const rowBreak = document.createElement('div');
            rowBreak.style.flexBasis = '100%';
            rowBreak.style.height = '5px'; 
            minorGallery.appendChild(rowBreak);
        }
        
        minorGallery.appendChild(buildCardHTML(card, true));
        suitCardCount++;
    });

    if (majorGallery.innerHTML === '') majorGallery.innerHTML = '<p class="loading-text">No Major Arcana Found</p>';
    if (minorGallery.innerHTML === '') minorGallery.innerHTML = '<p class="loading-text">No Minor Arcana Found</p>';
}

// --- MODAL & TAB LOGIC ---
function openModal(index) {
    const card = cardsData[index];
    document.getElementById('modal-card-name').innerText = card.name.toUpperCase();

    const imgEl = document.getElementById('modal-card-img');
    if (card.imageUrl) {
        imgEl.src = card.imageUrl;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    document.getElementById('tab-1').innerHTML = card.tab1;
    document.getElementById('tab-2').innerHTML = card.tab2;
    document.getElementById('tab-3').innerHTML = card.tab3;
    document.getElementById('tab-4').innerHTML = card.tab4;

    document.getElementById('card-modal').classList.add('show');
    switchTab(1);
}

function closeModal() {
    document.getElementById('card-modal').classList.remove('show');
    resetParallax();
}

function switchTab(tabIndex) {
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === (tabIndex - 1));
    });
    document.querySelectorAll('.tab-content').forEach((content, idx) => {
        content.classList.toggle('active', idx === (tabIndex - 1));
    });
}

// --- 3D PARALLAX TILT FX ---
const modalLeft = document.getElementById('modal-left');
const cardWrapper = document.getElementById('card-wrapper');

modalLeft.addEventListener('mousemove', (e) => {
    const rect = modalLeft.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    cardWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

modalLeft.addEventListener('mouseleave', resetParallax);

function resetParallax() {
    cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
}

// --- MODE TOGGLE & SPREAD LOGIC ---
let currentMode = 'show';

function toggleMode() {
    const showMode = document.getElementById('mode-show');
    const shuffleMode = document.getElementById('mode-shuffle');
    const toggleBtn = document.getElementById('mode-toggle-btn');
    const container = document.getElementById('drawn-card-container');

    if (currentMode === 'show') {
        currentMode = 'shuffle';
        showMode.style.display = 'none';
        shuffleMode.style.display = 'block';
        toggleBtn.innerText = 'MODE: SHUFFLE & PICK';
        container.innerHTML = ''; // Clear container when entering mode
        container.className = '';
    } else {
        currentMode = 'show';
        showMode.style.display = 'block';
        shuffleMode.style.display = 'none';
        toggleBtn.innerText = 'MODE: SHOW';
    }
}

function spreadCards() {
    const container = document.getElementById('drawn-card-container');
    
    if (cardsData.length === 0) {
        container.innerHTML = '<p style="color:red;">Data Hub is still syncing...</p>';
        return;
    }

    container.innerHTML = ''; 
    container.className = 'spread-layout'; 

    // Spreads EVERY card out from your loaded Google Sheet Data
    for (let i = 0; i < cardsData.length; i++) {
        const cardBack = document.createElement('div');
        cardBack.className = 'face-down-card';
        // Deal very fast so a large spread renders smoothly
        cardBack.style.animationDelay = `${i * 0.02}s`;
        
        cardBack.onclick = () => pickCardFromSpread();
        container.appendChild(cardBack);
    }
}

function pickCardFromSpread() {
    const container = document.getElementById('drawn-card-container');
    container.className = ''; // Remove spread layout to center the drawn card

    // Pick a random card from your loaded Google Sheet data
    const randomIndex = Math.floor(Math.random() * cardsData.length);
    const card = cardsData[randomIndex];

    container.innerHTML = ''; // Clear the spread

    // Create the card element reusing your existing gallery classes
    const cardEl = document.createElement('div');
    cardEl.className = 'gallery-card drawn-card-wrapper';
    
    // Clicking the drawn card opens your detailed modal
    cardEl.onclick = () => openModal(randomIndex);

    if (card.imageUrl) {
        const img = document.createElement('img');
        img.src = card.imageUrl;
        img.alt = card.name;
        cardEl.appendChild(img);
    } else {
        cardEl.innerText = card.name;
        cardEl.style.color = 'var(--accent)';
        cardEl.style.fontWeight = 'bold';
    }

    container.appendChild(cardEl);
}

window.onload = fetchArcanaCards;