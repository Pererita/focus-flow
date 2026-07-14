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
  
  // Botones de Cabecera (Historial y Configuración)
  document.getElementById('historyBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL('options.html#history') });
        }
      });
    });
  });
  
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
  
  // Iniciar la cuenta regresiva al segundo para refrescar ambas interfaces
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    updatePostureTimerUI();
    updateHydrationUI();
  }, 1000);
}

// Alternar entre las pestañas de la interfaz
function switchTab(tabName) {
  const ergoTabBtn = document.getElementById('ergoTabBtn');
  const hydraTabBtn = document.getElementById('hydraTabBtn');
  const ergoView = document.getElementById('ergoView');
  const hydraView = document.getElementById('hydraView');
  
  // Clases CSS diferenciadas para cada pestaña
  const ergoActiveClasses = ['bg-primary-container', 'text-on-primary-container', 'rounded-xl'];
  const ergoInactiveClasses = ['text-on-surface-variant', 'hover:bg-surface-container-high'];
  const hydraActiveClasses = ['bg-blue-600', 'text-white', 'rounded-xl'];
  const hydraInactiveClasses = ['text-on-surface-variant', 'hover:bg-blue-50', 'hover:text-blue-600'];
  
  if (tabName === 'ergo') {
    // Activar Ergonomía
    ergoTabBtn.classList.add(...ergoActiveClasses);
    ergoTabBtn.classList.remove(...ergoInactiveClasses);
    ergoTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    
    // Desactivar Hidratación
    hydraTabBtn.classList.remove(...hydraActiveClasses);
    hydraTabBtn.classList.add(...hydraInactiveClasses);
    hydraTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
    
    // Mostrar/ocultar vistas
    ergoView.classList.remove('hidden');
    hydraView.classList.add('hidden');
  } else {
    // Activar Hidratación
    hydraTabBtn.classList.add(...hydraActiveClasses);
    hydraTabBtn.classList.remove(...hydraInactiveClasses);
    hydraTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    
    // Desactivar Ergonomía
    ergoTabBtn.classList.remove(...ergoActiveClasses);
    ergoTabBtn.classList.add(...ergoInactiveClasses);
    ergoTabBtn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
    
    // Mostrar/ocultar vistas
    hydraView.classList.remove('hidden');
    ergoView.classList.add('hidden');
  }
}

// Actualizar la interfaz del temporizador de postura
async function updatePostureTimerUI() {
  const data = await chrome.storage.local.get(['postureNextBreak', 'isPosturePaused', 'postureInterval', 'postureRemainingMs']);
  const timerText = document.getElementById('timerText');
  const pauseBtn = document.getElementById('pauseBtn');
  const progressCircle = document.getElementById('progressCircle');
  const doneBtn = document.getElementById('doneBtn');
  
  if (data.isPosturePaused) {
    const remainingMs = data.postureRemainingMs || (data.postureInterval || 30) * 60 * 1000;
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const intervalMinutes = data.postureInterval || currentIntervalMinutes;
    const totalIntervalSeconds = intervalMinutes * 60;
    const progressPct = totalIntervalSeconds > 0 ? (totalSeconds / totalIntervalSeconds) * 100 : 100;
    progressCircle.style.setProperty('--progress', progressPct.toFixed(2));

    timerText.classList.add('text-on-surface-variant');
    timerText.classList.remove('text-primary');
    pauseBtn.textContent = "Reanudar";
    
    // Deshabilitar botón "Listo" en pausa
    if (doneBtn) {
      doneBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    }
    return;
  }
  
  // Habilitar botón "Listo" cuando está activo
  if (doneBtn) {
    doneBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
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
  
  timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const intervalMinutes = data.postureInterval || currentIntervalMinutes;
  const totalIntervalSeconds = intervalMinutes * 60;
  const progressPct = (totalSeconds / totalIntervalSeconds) * 100;
  
  progressCircle.style.setProperty('--progress', progressPct.toFixed(2));
}

// Pausar/Reanudar temporizador de postura al segundo
async function togglePausePosture() {
  const data = await chrome.storage.local.get(['isPosturePaused', 'postureNextBreak', 'postureInterval', 'postureRemainingMs']);
  const isPaused = data.isPosturePaused || false;
  
  if (!isPaused) {
    // Pausar: calcular tiempo restante y guardar en storage
    const now = Date.now();
    let remainingMs = data.postureNextBreak ? (data.postureNextBreak - now) : (data.postureInterval || 30) * 60 * 1000;
    if (remainingMs < 0) remainingMs = 0;
    
    await chrome.storage.local.set({
      isPosturePaused: true,
      postureRemainingMs: remainingMs
    });
  } else {
    // Reanudar: calcular nueva fecha de break en base al tiempo restante
    const remainingMs = data.postureRemainingMs || (data.postureInterval || 30) * 60 * 1000;
    const newNextBreak = Date.now() + remainingMs;
    
    await chrome.storage.local.set({
      isPosturePaused: false,
      postureNextBreak: newNextBreak
    });
    await chrome.storage.local.remove('postureRemainingMs');
  }
}

// Saltar la pausa actual
function skipPostureBreak() {
  chrome.runtime.sendMessage({ action: 'skip_posture' }, () => {
    initPopup();
  });
}

// Registrar como terminada la pausa de estiramientos
async function donePostureBreak() {
  await logPostureBreakToHistory();

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
  const data = await chrome.storage.local.get(['waterIntake', 'waterGoal', 'hydrationNextBreak']);
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

  // Actualizar cuenta regresiva de agua
  const waterTimeText = document.getElementById('waterTimeRemainingText');
  if (waterTimeText) {
    if (!data.hydrationNextBreak) {
      waterTimeText.textContent = "Siguiente recordatorio: -- min";
    } else {
      const now = Date.now();
      const diffMs = data.hydrationNextBreak - now;
      if (diffMs <= 0) {
        waterTimeText.textContent = "Siguiente recordatorio: ¡Ya!";
      } else {
        const totalMinutes = Math.ceil(diffMs / 60000);
        waterTimeText.textContent = `Siguiente recordatorio en: ${totalMinutes} min`;
      }
    }
  }
}

// Agregar agua
async function addWater(amount) {
  const data = await chrome.storage.local.get(['waterIntake', 'waterGoal']);
  const current = data.waterIntake || 0;
  const goal = data.waterGoal || 2000;
  const newIntake = current + amount;
  
  await chrome.storage.local.set({ waterIntake: newIntake });
  await logWaterIntakeToHistory(newIntake);
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
    await logWaterIntakeToHistory(0);
  }
}

// Función auxiliar para convertir formato HH:MM (24h) a hh:mm AM/PM (12h)
function convertTo12Hour(timeStr) {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 debe ser 12
  return `${String(hours).padStart(2, '0')}:${minutesStr} ${ampm}`;
}

// Actualizar el footer con el estado del horario
function updateStatusFooter(settings) {
  const footerText = document.getElementById('statusText');
  if (footerText) {
    const tracking = settings.weekendTracking ? "Lunes a Domingo" : "Lunes a Viernes";
    const start12 = convertTo12Hour(settings.workdayStart);
    const end12 = convertTo12Hour(settings.workdayEnd);
    footerText.textContent = `Activo: ${tracking} (${start12} - ${end12})`;
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

// Obtener string de fecha local YYYY-MM-DD
function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Guardar pausa ergonómica en el historial
async function logPostureBreakToHistory() {
  const todayStr = getLocalDateString();
  const data = await chrome.storage.local.get(['history', 'waterGoal']);
  const history = data.history || {};
  const goal = data.waterGoal || 2000;
  
  if (!history[todayStr]) {
    history[todayStr] = { postureBreaks: 0, waterIntake: 0, waterGoal: goal };
  }
  history[todayStr].postureBreaks = (history[todayStr].postureBreaks || 0) + 1;
  
  await chrome.storage.local.set({ history });
}

// Guardar consumo de agua en el historial
async function logWaterIntakeToHistory(newIntake) {
  const todayStr = getLocalDateString();
  const data = await chrome.storage.local.get(['history', 'waterGoal']);
  const history = data.history || {};
  const goal = data.waterGoal || 2000;
  
  if (!history[todayStr]) {
    history[todayStr] = { postureBreaks: 0, waterIntake: 0, waterGoal: goal };
  }
  history[todayStr].waterIntake = newIntake;
  history[todayStr].waterGoal = goal;
  
  await chrome.storage.local.set({ history });
}


