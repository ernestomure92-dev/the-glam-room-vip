let currentClient = null;
let currentCode = null;

// Navegación inputs código
document.querySelectorAll('.digit').forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < 3) {
            document.querySelectorAll('.digit')[index + 1].focus();
        }
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            document.querySelectorAll('.digit')[index - 1].focus();
        }
    });
});

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById('panel-' + tab).classList.add('active');
    document.getElementById('clientFound').style.display = 'none';
}

async function verifyCode() {
    const code = Array.from(document.querySelectorAll('.digit')).map(i => i.value).join('');
    
    if (code.length !== 4) {
        alert('Ingresa los 4 dígitos');
        return;
    }
    
    const snap = await codesRef.child(code).once('value');
    const data = snap.val();
    
    if (!data || data.used) {
        alert('Código inválido o usado');
        return;
    }
    
    currentCode = code;
    const clientSnap = await clientsRef.child(data.phone).once('value');
    currentClient = clientSnap.val();
    
    showClient();
}

async function searchPhone() {
    const phone = document.getElementById('staffPhone').value.trim();
    
    if (phone.length !== 10) {
        alert('Ingresa 10 dígitos');
        return;
    }
    
    const snap = await clientsRef.child(phone).once('value');
    if (!snap.val()) {
        alert('Cliente no encontrado');
        return;
    }
    
    currentClient = snap.val();
    showClient();
}

function showClient() {
    document.getElementById('clientFound').style.display = 'block';
    document.getElementById('foundName').textContent = currentClient.name;
    document.getElementById('foundPhone').textContent = '+52 ' + formatPhone(currentClient.phone);
    
    const stamps = currentClient.stamps || 0;
    const inCycle = stamps % 10;
    document.getElementById('miniHearts').textContent = '💕'.repeat(inCycle) + '🤍'.repeat(10 - inCycle);
}

async function confirmStamp() {
    if (!currentClient) return;
    
    const newStamps = (currentClient.stamps || 0) + 1;
    const newTotal = (currentClient.totalStamps || 0) + 1;
    const now = Date.now();
    
    // Actualizar cliente
    await clientsRef.child(currentClient.phone).update({
        stamps: newStamps,
        totalStamps: newTotal,
        lastVisit: now
    });
    
    // Registrar visita
    await visitsRef.push({
        phone: currentClient.phone,
        name: currentClient.name,
        stampNumber: newStamps,
        timestamp: now
    });
    
    // Marcar código usado
    if (currentCode) {
        await codesRef.child(currentCode).update({ used: true });
    }
    
    // Mostrar éxito
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    const inCycle = newStamps % 10;
    document.getElementById('successMsg').textContent = 
        `${currentClient.name} - Sello ${inCycle === 0 ? 10 : inCycle} de 10`;
    
    // ¿Nueva recompensa?
    if (inCycle === 5 || inCycle === 0) {
        document.getElementById('newReward').style.display = 'block';
        document.getElementById('rewardText').textContent = 
            inCycle === 0 ? '¡Completó 10 sellos! 15% OFF' : '¡Llegó a 5 sellos! 10% OFF';
    }
    
    loadRecent();
}

function nextClient() {
    currentClient = null;
    currentCode = null;
    
    document.querySelectorAll('.digit').forEach(i => i.value = '');
    document.getElementById('staffPhone').value = '';
    document.getElementById('clientFound').style.display = 'none';
    document.getElementById('newReward').style.display = 'none';
    
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
}

function cancelSearch() {
    document.getElementById('clientFound').style.display = 'none';
    currentClient = null;
}

async function loadRecent() {
    const snap = await visitsRef.orderByChild('timestamp').limitToLast(5).once('value');
    const visits = [];
    snap.forEach(child => visits.unshift(child.val()));
    
    const container = document.getElementById('recentList');
    container.innerHTML = visits.map(v => `
        <div class="recent-item">
            <div>
                <strong>${v.name}</strong>
                <div class="time">${formatTime(v.timestamp)}</div>
            </div>
            <span>💕</span>
        </div>
    `).join('');
}

function formatPhone(phone) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// Cargar recientes al iniciar
loadRecent();
visitsRef.orderByChild('timestamp').limitToLast(5).on('value', loadRecent);
