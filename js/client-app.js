let currentClient = null;
let currentCode = null;

// Login/Registro
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('phoneInput').value.trim();
    const nameInput = document.getElementById('nameInput');
    
    if (phone.length !== 10) {
        alert('Ingresa 10 dígitos válidos');
        return;
    }
    
    showLoading(true);
    
    try {
        const snapshot = await clientsRef.child(phone).once('value');
        let client = snapshot.val();
        
        if (!client) {
            if (!nameInput.value.trim()) {
                document.getElementById('nameGroup').style.display = 'block';
                nameInput.focus();
                showLoading(false);
                return;
            }
            
            client = {
                name: nameInput.value.trim(),
                phone: phone,
                stamps: 0,
                totalStamps: 0,
                rewardsClaimed: { 5: false, 10: false },
                created: Date.now(),
                lastVisit: null
            };
            
            await clientsRef.child(phone).set(client);
        }
        
        currentClient = client;
        localStorage.setItem('glamRoomPhone', phone);
        showCard();
        
    } catch (error) {
        alert('Error de conexión');
        console.error(error);
    }
    
    showLoading(false);
});

function showCard() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('card-screen').classList.add('active');
    
    updateCardDisplay();
    
    // Escuchar cambios en tiempo real
    clientsRef.child(currentClient.phone).on('value', (snapshot) => {
        if (snapshot.val()) {
            currentClient = snapshot.val();
            updateCardDisplay();
        }
    });
}

function updateCardDisplay() {
    const stamps = currentClient.stamps || 0;
    const inCycle = stamps % 10;
    
    // Nombre y teléfono
    document.getElementById('clientName').textContent = currentClient.name;
    document.getElementById('cardPhone').textContent = '•••• ' + currentClient.phone.slice(-4);
    
    // Corazones
    const grid = document.getElementById('heartsGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-slot';
        if (i < inCycle) {
            heart.classList.add('filled');
        }
        grid.appendChild(heart);
    }
    
    // Recompensas
    updateRewards(stamps);
    
    // Historial
    loadHistory();
}

function updateRewards(stamps) {
    const inCycle = stamps % 10;
    const cycles = Math.floor(stamps / 10);
    
    // Recompensa 5 sellos
    const r5 = document.getElementById('reward5');
    const check5 = document.getElementById('check5');
    const has5Reward = inCycle >= 5 || cycles > (currentClient.rewardsClaimed?.10 || 0);
    
    if (has5Reward && !(currentClient.rewardsClaimed?.5 >= cycles + (inCycle >= 5 ? 1 : 0))) {
        r5.classList.add('unlocked');
        check5.textContent = '✨';
    } else {
        r5.classList.remove('unlocked');
        check5.textContent = '🔒';
    }
    
    // Recompensa 10 sellos
    const r10 = document.getElementById('reward10');
    const check10 = document.getElementById('check10');
    const has10Reward = inCycle === 0 && stamps > 0;
    
    if (has10Reward && !(currentClient.rewardsClaimed?.10 >= cycles)) {
        r10.classList.add('unlocked');
        check10.textContent = '🎁';
    } else {
        r10.classList.remove('unlocked');
        check10.textContent = '🔒';
    }
}

async function generateCode() {
    if (!currentClient) return;
    
    currentCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    await codesRef.child(currentCode).set({
        phone: currentClient.phone,
        created: Date.now(),
        used: false
    });
    
    document.getElementById('getStampBtn').style.display = 'none';
    document.getElementById('codeReveal').style.display = 'block';
    document.getElementById('stampCode').textContent = currentCode;
    
    setTimeout(hideCode, 300000); // 5 minutos
}

function hideCode() {
    document.getElementById('codeReveal').style.display = 'none';
    document.getElementById('getStampBtn').style.display = 'block';
    if (currentCode) {
        codesRef.child(currentCode).remove();
        currentCode = null;
    }
}

async function loadHistory() {
    const snapshot = await visitsRef.orderByChild('phone').equalTo(currentClient.phone).limitToLast(5).once('value');
    const visits = [];
    snapshot.forEach(child => visits.unshift(child.val()));
    
    const container = document.getElementById('visitHistory');
    container.innerHTML = visits.map(v => `
        <div class="history-item">
            <span>Visita #${v.stampNumber || '?'}</span>
            <span class="history-date">${formatDate(v.timestamp)}</span>
        </div>
    `).join('');
}

function formatDate(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

// Al final del archivo, debe estar así:

function logout() {
    localStorage.removeItem('glamRoomPhone');
    location.reload();
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

// Auto-login
window.addEventListener('load', async () => {
    const saved = localStorage.getItem('glamRoomPhone');
    if (saved && document.getElementById('card-screen')) {
        const snap = await clientsRef.child(saved).once('value');
        if (snap.val()) {
            currentClient = snap.val();
            showCard();
        }
    }
});
