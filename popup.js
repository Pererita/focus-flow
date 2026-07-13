// FocusFlow - Lógica del Panel Emergente (Popup)

let countdownInterval = null;
let currentIntervalMinutes = 30;

document.addEventListener('DOMContentLoaded', async () => {
  await initPopup();
  
  // Alternar pestañas (Ergonomía / Hidratación)
  document.getElementById('ergoTabBtn').addEventListener('click', () => switchTab('ergo'));
  document.getElementById('hydraTabBtn').addEventListener('click', () => switchTab('hydra'));
  
  // Botones de Ergonomía
  document.getElementById('pauseBtn').addEventListener('click', togglePausePosture);
  document.getElementById('skipBtn').addEventListener('click', skipPostureBreak);
  document.getElementById('doneBtn').addEventListener('click', donePostureBreak);
  
  // Botón de Opciones (Engranaje)
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Botones de Hidratación
  document.getElementById('add250').addEventListener('click', () => addWater(250));
  document.getElementById('add330').addEventListener('click', () => addWater(330));
  document.getElementById('add500').addEventListener('click', () => addWater(500));
  document.getElementById('addCustomBtn').addEventListener('click', addCustomWater);
  document.getElementById('resetWaterBtn').addEventListener('click', resetWater);
  
  // Asociar eventos clic a la checklist para evitar onclick inline (violación de CSP)
  document.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', () => toggleCheck(item));
  });
  
  // Escuchar cambios en el almacenamiento para actualizar la UI en tiempo real
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.waterIntake || changes.waterGoal) {
      updateHydrationUI();
    }
    if (changes.postureNextBreak || changes.isPosturePaused) {
      updatePostureTimerUI();
    }
  });
});

// Inicializar estado del popup
async function initPopup() {
  const data = await chrome.storage.local.get(null);
  
  currentIntervalMinutes = data.postureInterval || 30;
  
  // Inicializar estado de las vistas
  updatePostureTimerUI();
  updateHydrationUI();
  updateStatusFooter(data);
  
  // Iniciar la cuenta regresiva al segundo
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updatePostureTimerUI, 1000);
}

// Alternar entre las pestañas de la interfaz
function switchTab(tabName) {
  const ergoTabBtn = document.getElementById('ergoTabBtn');
  const hydraTabBtn = document.getElementById('hydraTabBtn');
  const ergoView = document.getElementById('ergoView');
  const hydraView = document.getElementById('hydraView');
  
  // Clases CSS para estado Activo/Inactivo
  const activeClasses = ['bg-primary-container', 'text-on-primary-container', 'rounded-xl'];
  const inactiveClasses = ['text-on-surface-variant', 'hover:bg-surface-container-high'];
  
  if (tabName === 'ergo') {
    // Activar Ergonomía
    ergoTabBtn.classList.add(...activeClasses);
    ergoTabBtn.classList.remove(...inactiveClasses);
    ergoTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    
    // Desactivar Hidratación
    hydraTabBtn.classList.remove(...activeClasses);
    hydraTabBtn.classList.add(...inactiveClasses);
    hydraTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
    
    // Mostrar/ocultar vistas
    ergoView.classList.remove('hidden');
    hydraView.classList.add('hidden');
  } else {
    // Activar Hidratación
    hydraTabBtn.classList.add(...activeClasses);
    hydraTabBtn.classList.remove(...inactiveClasses);
    hydraTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    
    // Desactivar Ergonomía
    ergoTabBtn.classList.remove(...activeClasses);
    ergoTabBtn.classList.add(...inactiveClasses);
    ergoTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
    
    // Mostrar/ocultar vistas
    hydraView.classList.remove('hidden');
    ergoView.classList.add('hidden');
  }
}

// Actualizar la interfaz del temporizador de postura
async function updatePostureTimerUI() {
  const data = await chrome.storage.local.get(['postureNextBreak', 'isPosturePaused', 'postureInterval']);
  const timerText = document.getElementById('timerText');
  const pauseBtn = document.getElementById('pauseBtn');
  const progressCircle = document.getElementById('progressCircle');
  
  if (data.isPosturePaused) {
    timerText.textContent = "Pausado";
    timerText.classList.add('text-on-surface-variant');
    timerText.classList.remove('text-primary');
    pauseBtn.textContent = "Reanudar";
    progressCircle.style.setProperty('--progress', '100');
    return;
  }
  
  pauseBtn.textContent = "Pausar";
  timerText.classList.remove('text-on-surface-variant');
  timerText.classList.add('text-primary');
  
  if (!data.postureNextBreak) {
    timerText.textContent = "--:--";
    progressCircle.style.setProperty('--progress', '100');
    return;
  }
  
  const now = Date.now();
  const diffMs = data.postureNextBreak - now;
  
  if (diffMs <= 0) {
    timerText.textContent = "00:00";
    progressCircle.style.setProperty('--progress', '0');
    return;
  }
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Renderizado del formato MM:SS
  timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Calcular porcentaje de progreso circular
  const intervalMinutes = data.postureInterval || currentIntervalMinutes;
  const totalIntervalSeconds = intervalMinutes * 60;
  const progressPct = (totalSeconds / totalIntervalSeconds) * 100;
  
  progressCircle.style.setProperty('--progress', progressPct.toFixed(2));
}

// Pausar/Reanudar temporizador de postura
async function togglePausePosture() {
  const data = await chrome.storage.local.get(['isPosturePaused']);
  const newState = !data.isPosturePaused;
  await chrome.storage.local.set({ isPosturePaused: newState });
}

// Saltar la pausa actual
function skipPostureBreak() {
  chrome.runtime.sendMessage({ action: 'skip_posture' }, () => {
    initPopup();
  });
}

// Registrar como terminada la pausa de estiramientos
function donePostureBreak() {
  // Desmarcar los estiramientos de la checklist
  resetChecklist();
  
  chrome.runtime.sendMessage({ action: 'reset_posture' }, () => {
    initPopup();
  });
}

// Desmarcar todos los ítems de la checklist de estiramientos
function resetChecklist() {
  const items = document.querySelectorAll('.checklist-item');
  items.forEach(el => {
    const box = el.querySelector('.check-box');
    const icon = el.querySelector('.check-icon');
    const text = el.querySelector('.check-text');
    
    if (icon && !icon.classList.contains('hidden')) {
      icon.classList.add('hidden');
      box.classList.remove('bg-primary-container', 'border-primary-container');
      box.classList.add('bg-white', 'border-outline-variant');
      icon.classList.replace('text-white', 'text-primary');
      text.classList.remove('line-through', 'opacity-60');
    }
  });
}

// Actualizar la interfaz de hidratación
async function updateHydrationUI() {
  const data = await chrome.storage.local.get(['waterIntake', 'waterGoal']);
  const waterIntake = data.waterIntake || 0;
  const waterGoal = data.waterGoal || 2000;
  
  document.getElementById('waterText').textContent = `${waterIntake} ml`;
  document.getElementById('waterGoalText').textContent = `de ${waterGoal} ml`;
  
  // Actualizar círculo de progreso de agua
  const progressPct = Math.min((waterIntake / waterGoal) * 100, 100);
  const waterProgressCircle = document.getElementById('waterProgressCircle');
  if (waterProgressCircle) {
    waterProgressCircle.style.setProperty('--progress-water', progressPct.toFixed(2));
  }
}

// Agregar agua
async function addWater(amount) {
  const data = await chrome.storage.local.get(['waterIntake']);
  const current = data.waterIntake || 0;
  await chrome.storage.local.set({ waterIntake: current + amount });
}

// Agregar cantidad de agua personalizada
async function addCustomWater() {
  const input = document.getElementById('customWaterInput');
  const amount = parseInt(input.value, 10);
  
  if (isNaN(amount) || amount <= 0) {
    alert("Por favor, introduce una cantidad válida.");
    return;
  }
  
  await addWater(amount);
  input.value = ''; // Limpiar campo
}

// Resetear consumo de agua
async function resetWater() {
  if (confirm("¿Deseas reiniciar tu registro de agua de hoy?")) {
    await chrome.storage.local.set({ waterIntake: 0 });
  }
}

// Actualizar el footer con el estado del horario
function updateStatusFooter(settings) {
  const footerText = document.getElementById('statusText');
  if (footerText) {
    const tracking = settings.weekendTracking ? "Lunes a Domingo" : "Lunes a Viernes";
    footerText.textContent = `Activo: ${tracking} (${settings.workdayStart} - ${settings.workdayEnd})`;
  }
}

// Función local para alternar el estado visual de la checklist
function toggleCheck(el) {
  const box = el.querySelector('.check-box');
  const icon = el.querySelector('.check-icon');
  const text = el.querySelector('.check-text');
  
  if (icon.classList.contains('hidden')) {
    icon.classList.remove('hidden');
    box.classList.add('bg-primary-container', 'border-primary-container');
    box.classList.remove('bg-white', 'border-outline-variant');
    icon.classList.replace('text-primary', 'text-white');
    text.classList.add('line-through', 'opacity-60');
  } else {
    icon.classList.add('hidden');
    box.classList.remove('bg-primary-container', 'border-primary-container');
    box.classList.add('bg-white', 'border-outline-variant');
    icon.classList.replace('text-white', 'text-primary');
    text.classList.remove('line-through', 'opacity-60');
  }
}

