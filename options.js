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
  await initHistory();
  
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

  // Escuchar si la URL tiene un hash específico para scroll
  handleUrlHash();

  // Reactividad: refrescar historial en tiempo real si cambia en background
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.history) {
      initHistory();
    }
  });
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
    
    // Tercer bloque (beep beep)
    playBeep(1.2, 0.15);
    playBeep(1.4, 0.15);
    
    setTimeout(() => {
      context.close();
    }, 1800);
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
  const navHistory = document.getElementById('navHistory');
  
  const navItems = [navSchedule, navGoals, navAlerts, navHistory];
  const sectionTitle = document.getElementById('sectionTitle');
  
  const sections = {
    schedule: { el: document.getElementById('schedule'), title: "Configuración de Horarios" },
    intervals: { el: document.getElementById('intervals'), title: "Configuración de Metas" },
    alerts: { el: document.getElementById('alerts'), title: "Configuración de Alertas" },
    history: { el: document.getElementById('history'), title: "Historial de Actividad" }
  };
  
  navItems.forEach((item, idx) => {
    if (!item) return;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Activar píldora visual en el sidebar
      navItems.forEach(i => {
        if (!i) return;
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

// Variables del Historial de Actividad
let historyData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 7;
let currentFilterDays = '7';

// Inicializar el historial
async function initHistory() {
  const data = await chrome.storage.local.get(['history']);
  const history = data.history || {};
  
  // Convertir el objeto de historial a un array ordenado descendentemente por fecha
  const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
  
  historyData = sortedDates.map(date => ({
    date,
    postureBreaks: history[date].postureBreaks || 0,
    waterIntake: history[date].waterIntake || 0,
    waterGoal: history[date].waterGoal || 2000
  }));
  
  // Asociar clics a los botones de filtro personalizados (píldoras)
  const btn7 = document.getElementById('filter7');
  const btn30 = document.getElementById('filter30');
  const btnAll = document.getElementById('filterAll');
  
  const handleFilterClick = (days, activeBtn) => {
    currentFilterDays = days;
    
    // Actualizar estados visuales de las píldoras
    [btn7, btn30, btnAll].forEach(btn => {
      if (!btn) return;
      btn.className = "px-4 py-1 rounded-full text-xs font-bold text-on-surface-variant hover:text-primary transition-all cursor-pointer";
    });
    activeBtn.className = "px-4 py-1 rounded-full text-xs font-bold bg-primary text-white transition-all cursor-pointer shadow-sm";
    
    filterHistory();
  };
  
  if (btn7) btn7.addEventListener('click', () => handleFilterClick('7', btn7));
  if (btn30) btn30.addEventListener('click', () => handleFilterClick('30', btn30));
  if (btnAll) btnAll.addEventListener('click', () => handleFilterClick('all', btnAll));
  
  // Manejadores de eventos de la tabla de historial
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const exportBtn = document.getElementById('exportCsvBtn');
  
  if (prevBtn) prevBtn.addEventListener('click', prevHistoryPage);
  if (nextBtn) nextBtn.addEventListener('click', nextHistoryPage);
  if (exportBtn) exportBtn.addEventListener('click', exportHistoryToCsv);
  
  // Renderizar la tabla con el filtro inicial
  filterHistory();
}

// Filtrar historial según selección
function filterHistory() {
  const data = [...historyData];
  
  if (currentFilterDays === '7') {
    filteredData = data.slice(0, 7);
  } else if (currentFilterDays === '30') {
    filteredData = data.slice(0, 30);
  } else {
    filteredData = data;
  }
  
  currentPage = 1;
  renderHistoryTable();
}

// Renderizar filas de la tabla
function renderHistoryTable() {
  const tableBody = document.getElementById('historyTableBody');
  const paginationInfo = document.getElementById('historyPaginationInfo');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  
  if (!tableBody) return;
  tableBody.innerHTML = '';
  
  const totalRows = filteredData.length;
  const totalPages = Math.max(Math.ceil(totalRows / rowsPerPage), 1);
  
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const pageRows = filteredData.slice(startIdx, endIdx);
  
  if (pageRows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="4" class="px-6 py-8 text-center text-on-surface-variant font-medium bg-surface-container-lowest">
        No hay registros de actividad guardados en este período.
      </td>
    `;
    tableBody.appendChild(tr);
    if (paginationInfo) paginationInfo.textContent = "Mostrando 0 de 0 días";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }
  
  pageRows.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-surface-container-low transition-colors";
    
    // Formatear Fecha (ej. 2026-07-14 -> Lunes, 14 Jul)
    const dateObj = new Date(row.date + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    const dateStr = dateObj.toLocaleDateString('es-ES', options);
    const capitalizedDateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    const waterProgress = Math.min((row.waterIntake / row.waterGoal) * 100, 100);
    const goalMet = row.waterIntake >= row.waterGoal;
    
    tr.innerHTML = `
      <td class="px-6 py-4 font-bold text-on-surface whitespace-nowrap">${capitalizedDateStr}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px] text-primary">accessibility_new</span>
          <span class="font-bold text-on-surface">${row.postureBreaks}</span>
          <span class="text-xs text-on-surface-variant">pausas</span>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-blue-500">local_drink</span>
            <span class="font-bold text-on-surface">${row.waterIntake} ml</span>
            <span class="text-xs text-on-surface-variant">(${waterProgress.toFixed(0)}%)</span>
          </div>
          <div class="w-24 h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full" style="width: ${waterProgress}%"></div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${goalMet 
          ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm">
              <span class="material-symbols-outlined text-[14px]">done</span> Cumplida
             </span>`
          : `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 text-blue-600 text-xs font-bold rounded-full border border-blue-100/70 shadow-sm">
              <span class="material-symbols-outlined text-[14px] text-blue-400">water_drop</span> Meta: ${row.waterGoal} ml
             </span>`
        }
      </td>
    `;
    tableBody.appendChild(tr);
  });
  
  if (paginationInfo) {
    paginationInfo.textContent = `Página ${currentPage} de ${totalPages} (Total: ${totalRows} días)`;
  }
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// Paginación anterior
function prevHistoryPage() {
  if (currentPage > 1) {
    currentPage--;
    renderHistoryTable();
  }
}

// Paginación siguiente
function nextHistoryPage() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderHistoryTable();
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

// Exportar historial a CSV
function exportHistoryToCsv() {
  if (filteredData.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }
  
  let csvContent = "\uFEFF"; // UTF-8 BOM para evitar problemas con acentos en Excel
  csvContent += "Fecha,Pausas Ergonomicas,Agua Consumida (ml),Meta Diaria (ml),Meta Cumplida\n";
  
  filteredData.forEach(row => {
    const goalMet = row.waterIntake >= row.waterGoal ? "SI" : "NO";
    csvContent += `"${row.date}",${row.postureBreaks},${row.waterIntake},${row.waterGoal},"${goalMet}"\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `focusflow_historial_${getLocalDateString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Activar la pestaña correcta basándose en el hash de la URL
function handleUrlHash() {
  if (window.location.hash === '#history') {
    setTimeout(() => {
      const navHistory = document.getElementById('navHistory');
      if (navHistory) {
        navHistory.click();
      }
    }, 150);
  }
}

