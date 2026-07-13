// FocusFlow - Lógica de la página de opciones (Español)

const DEFAULT_SETTINGS = {
  workdayStart: "08:00",
  workdayEnd: "17:00",
  lunchStart: "12:00",
  lunchEnd: "13:00",
  weekendTracking: false,
  postureInterval: 30,
  hydrationInterval: 60,
  waterGoal: 2000,
  notificationAlerts: true,
  audioAlerts: true
};

// Cargar opciones al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  
  // Asociar eventos de botones
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('restoreBtnSidebar').addEventListener('click', restoreDefaults);
  document.getElementById('restoreBtnFooter').addEventListener('click', restoreDefaults);
  document.getElementById('testSoundBtn').addEventListener('click', testSound);
  
  // Asociar eventos del Modal de Ayuda
  document.getElementById('helpBtn').addEventListener('click', openHelpModal);
  document.getElementById('closeHelpBtn').addEventListener('click', closeHelpModal);
  document.getElementById('closeHelpBtnFooter').addEventListener('click', closeHelpModal);
  
  // Interactividad de navegación en la barra lateral
  setupSidebarNavigation();
});

// Cargar valores del storage
async function loadSettings() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  
  document.getElementById('workdayStart').value = settings.workdayStart;
  document.getElementById('workdayEnd').value = settings.workdayEnd;
  document.getElementById('lunchStart').value = settings.lunchStart;
  document.getElementById('lunchEnd').value = settings.lunchEnd;
  document.getElementById('weekendTracking').checked = settings.weekendTracking;
  
  document.getElementById('postureInterval').value = settings.postureInterval;
  document.getElementById('hydrationInterval').value = settings.hydrationInterval;
  document.getElementById('waterGoal').value = settings.waterGoal;
  
  document.getElementById('notificationAlerts').checked = settings.notificationAlerts;
  document.getElementById('audioAlerts').checked = settings.audioAlerts;
}

// Guardar valores en el storage
async function saveSettings() {
  const workdayStart = document.getElementById('workdayStart').value;
  const workdayEnd = document.getElementById('workdayEnd').value;
  const lunchStart = document.getElementById('lunchStart').value;
  const lunchEnd = document.getElementById('lunchEnd').value;
  const weekendTracking = document.getElementById('weekendTracking').checked;
  
  const postureInterval = parseInt(document.getElementById('postureInterval').value, 10);
  const hydrationInterval = parseInt(document.getElementById('hydrationInterval').value, 10);
  const waterGoal = parseInt(document.getElementById('waterGoal').value, 10);
  
  const notificationAlerts = document.getElementById('notificationAlerts').checked;
  const audioAlerts = document.getElementById('audioAlerts').checked;
  
  // Validaciones básicas
  if (!workdayStart || !workdayEnd || !lunchStart || !lunchEnd) {
    alert("Por favor, completa todos los campos de horarios.");
    return;
  }
  
  if (postureInterval <= 0 || hydrationInterval <= 0 || waterGoal <= 0) {
    alert("Los intervalos y metas deben ser números mayores a 0.");
    return;
  }
  
  const settings = {
    workdayStart,
    workdayEnd,
    lunchStart,
    lunchEnd,
    weekendTracking,
    postureInterval,
    hydrationInterval,
    waterGoal,
    notificationAlerts,
    audioAlerts
  };
  
  await chrome.storage.local.set(settings);
  showSuccessToast("¡Configuración guardada con éxito!");
}

// Restaurar configuración por defecto
async function restoreDefaults() {
  if (confirm("¿Estás seguro de que deseas restaurar la configuración por defecto?")) {
    await chrome.storage.local.set(DEFAULT_SETTINGS);
    await loadSettings();
    showSuccessToast("Configuración restaurada con éxito");
  }
}

// Mostrar banner de guardado exitoso
function showSuccessToast(message) {
  const toast = document.getElementById('successToast');
  const toastText = toast.querySelector('span:not(.material-symbols-outlined)');
  if (toastText) {
    toastText.textContent = message;
  }
  
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3000);
}

// Sintetizar sonido local de prueba
function testSound() {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Pitido doble repetido (beep beep ... beep beep)
    const playBeep = (delay, duration) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, context.currentTime + delay);
      gain.gain.setValueAtTime(0.8, context.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(context.currentTime + delay);
      osc.stop(context.currentTime + delay + duration);
    };

    // Primer bloque (beep beep)
    playBeep(0.0, 0.15);
    playBeep(0.2, 0.15);
    
    // Segundo bloque (beep beep)
    playBeep(0.6, 0.15);
    playBeep(0.8, 0.15);
    
    setTimeout(() => {
      context.close();
    }, 1200);
  } catch (err) {
    console.error("Error al reproducir audio de prueba:", err);
  }
}

// Abrir Modal de Ayuda
function openHelpModal() {
  const modal = document.getElementById('helpModal');
  modal.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
  modal.classList.add('opacity-100');
  modal.querySelector('div').classList.add('scale-100');
}

// Cerrar Modal de Ayuda
function closeHelpModal() {
  const modal = document.getElementById('helpModal');
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0', 'invisible', 'pointer-events-none');
}

// Configuración de la navegación en la barra lateral
function setupSidebarNavigation() {
  const navSchedule = document.getElementById('navSchedule');
  const navGoals = document.getElementById('navGoals');
  const navAlerts = document.getElementById('navAlerts');
  
  const navItems = [navSchedule, navGoals, navAlerts];
  const sectionTitle = document.getElementById('sectionTitle');
  
  const sections = {
    schedule: { el: document.getElementById('schedule'), title: "Configuración de Horarios" },
    intervals: { el: document.getElementById('intervals'), title: "Configuración de Metas" },
    alerts: { el: document.getElementById('alerts'), title: "Configuración de Alertas" }
  };
  
  navItems.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Activar píldora visual en el sidebar
      navItems.forEach(i => {
        i.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'font-bold');
        i.classList.add('text-on-surface-variant');
      });
      item.classList.add('bg-secondary-container', 'text-on-secondary-container', 'font-bold');
      item.classList.remove('text-on-surface-variant');
      
      // Obtener sección correspondiente
      const secKey = Object.keys(sections)[idx];
      const targetSec = sections[secKey];
      
      if (targetSec && targetSec.el) {
        // Cambiar título del Header dinámicamente
        sectionTitle.textContent = targetSec.title;
        
        // Scroll suave a la sección
        targetSec.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
