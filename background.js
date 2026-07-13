// FocusFlow - Service Worker de Fondo (Manifest V3)

// Configuración por defecto
const DEFAULT_SETTINGS = {
  workdayStart: "08:00",
  workdayEnd: "17:00",
  lunchStart: "12:00",
  lunchEnd: "13:00",
  weekendTracking: false,
  postureInterval: 30, // en minutos
  hydrationInterval: 60, // en minutos
  waterGoal: 2000, // en ml
  waterIntake: 0, // en ml
  notificationAlerts: true,
  audioAlerts: true,
  isPosturePaused: false,
  lastWaterResetDate: ""
};

// Al instalar, inicializar almacenamiento
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(null);
  
  // Rellenar configuraciones faltantes
  const settings = { ...DEFAULT_SETTINGS, ...data };
  
  // Establecer fecha inicial de reset de agua si no existe
  if (!settings.lastWaterResetDate) {
    settings.lastWaterResetDate = getLocalDateString();
  }
  
  await chrome.storage.local.set(settings);
  
  // Programar las primeras alarmas
  await rescheduleAlarms();
});

// Escuchar cambios en el almacenamiento para reprogramar alarmas si cambian intervalos u horarios
chrome.storage.onChanged.addListener(async (changes) => {
  const needsReschedule = [
    'workdayStart', 'workdayEnd', 'lunchStart', 'lunchEnd',
    'weekendTracking', 'postureInterval', 'hydrationInterval',
    'isPosturePaused'
  ].some(key => changes[key]);
  
  if (needsReschedule) {
    await rescheduleAlarms();
  }
});

// Escuchar las alarmas
chrome.alarms.onAlarm.addListener(async (alarm) => {
  await checkDailyWaterReset();
  
  const settings = await chrome.storage.local.get(null);
  const now = new Date();
  
  // Verificar si actualmente estamos en horario permitido
  if (!isTimeAllowed(now, settings)) {
    // Si no estamos en horario permitido, simplemente reprogramamos la alarma para el futuro válido
    await rescheduleAlarms();
    return;
  }

  if (alarm.name === 'postureAlarm') {
    if (settings.notificationAlerts) {
      chrome.notifications.create('posture-notif', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '🧘 ¡Hora de levantarse!',
        message: 'Llevas demasiado tiempo sentado. Levántate, camina y haz estiramientos leves por 2 minutos.',
        priority: 2
      });
    }
    
    if (settings.audioAlerts) {
      await playAlertSound();
    }
    
    // Programar el siguiente intervalo de postura
    await scheduleNextAlarm('postureAlarm', settings.postureInterval, settings);
  } 
  
  else if (alarm.name === 'hydrationAlarm') {
    if (settings.notificationAlerts) {
      chrome.notifications.create('hydration-notif', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '💧 ¡Hora de hidratarse!',
        message: 'Toma un sorbo de agua para mantener tu enfoque y energía en la oficina.',
        priority: 1
      });
    }
    
    if (settings.audioAlerts) {
      await playAlertSound();
    }
    
    // Programar el siguiente intervalo de agua
    await scheduleNextAlarm('hydrationAlarm', settings.hydrationInterval, settings);
  }
});

// Función para sintetizar y reproducir sonido de fondo a través de Offscreen
async function playAlertSound() {
  try {
    // Si no existe el documento offscreen, crearlo
    if (!await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Reproducir alertas sonoras sintetizadas para recordatorios de salud'
      });
    }
    
    // Enviar mensaje para reproducir sonido
    chrome.runtime.sendMessage({ action: 'play_sound' }, (response) => {
      // Ignorar errores de respuesta si el canal se cierra antes
      if (chrome.runtime.lastError) {
        // Silencioso
      }
    });
  } catch (err) {
    console.error("Error al gestionar el audio en segundo plano:", err);
  }
}

// Comprobar si corresponde reiniciar el registro de agua hoy
async function checkDailyWaterReset() {
  const data = await chrome.storage.local.get(['lastWaterResetDate']);
  const todayStr = getLocalDateString();
  if (data.lastWaterResetDate !== todayStr) {
    await chrome.storage.local.set({
      waterIntake: 0,
      lastWaterResetDate: todayStr
    });
  }
}

// Reprograma todas las alarmas
async function rescheduleAlarms() {
  await checkDailyWaterReset();
  const settings = await chrome.storage.local.get(null);
  
  // Limpiar alarmas existentes
  await chrome.alarms.clearAll();
  
  if (!settings.isPosturePaused) {
    await scheduleNextAlarm('postureAlarm', settings.postureInterval, settings);
  } else {
    await chrome.storage.local.remove('postureNextBreak');
  }
  
  await scheduleNextAlarm('hydrationAlarm', settings.hydrationInterval, settings);
}

// Calcula y programa la siguiente alarma válida en base al horario
async function scheduleNextAlarm(alarmName, intervalMinutes, settings) {
  const now = new Date();
  let nextTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
  
  nextTime = adjustTimeToAllowedSchedule(nextTime, settings);
  
  const timestamp = nextTime.getTime();
  await chrome.alarms.create(alarmName, { when: timestamp });
  
  // Guardar en storage para que la interfaz sepa cuándo sonará
  const storageKey = alarmName === 'postureAlarm' ? 'postureNextBreak' : 'hydrationNextBreak';
  await chrome.storage.local.set({ [storageKey]: timestamp });
}

// Ajustar una fecha tentativa para que encaje en el horario laboral y fuera de almuerzos
function adjustTimeToAllowedSchedule(date, settings) {
  let adjusted = new Date(date.getTime());
  let loops = 0;
  
  // Bucle de ajuste por si al mover la fecha caemos en otra exclusión (máx. 10 para evitar bucles infinitos)
  while (loops < 10) {
    const day = adjusted.getDay();
    const isWeekend = (day === 0 || day === 6);
    
    // 1. Ajuste de fin de semana
    if (isWeekend && !settings.weekendTracking) {
      // Avanzar al lunes
      const daysToAdd = (day === 6) ? 2 : 1;
      adjusted.setDate(adjusted.getDate() + daysToAdd);
      
      const [startHour, startMin] = settings.workdayStart.split(':').map(Number);
      adjusted.setHours(startHour, startMin, 0, 0);
      loops++;
      continue;
    }
    
    // Obtener los horarios límites de ese día
    const [startHour, startMin] = settings.workdayStart.split(':').map(Number);
    const [endHour, endMin] = settings.workdayEnd.split(':').map(Number);
    const [lunchStartHour, lunchStartMin] = settings.lunchStart.split(':').map(Number);
    const [lunchEndHour, lunchEndMin] = settings.lunchEnd.split(':').map(Number);
    
    const timeVal = adjusted.getHours() * 60 + adjusted.getMinutes();
    const startVal = startHour * 60 + startMin;
    const endVal = endHour * 60 + endMin;
    const lunchStartVal = lunchStartHour * 60 + lunchStartMin;
    const lunchEndVal = lunchEndHour * 60 + lunchEndMin;
    
    // 2. Antes de la jornada laboral
    if (timeVal < startVal) {
      adjusted.setHours(startHour, startMin, 0, 0);
      loops++;
      continue;
    }
    
    // 3. Durante el almuerzo
    if (timeVal >= lunchStartVal && timeVal < lunchEndVal) {
      adjusted.setHours(lunchEndHour, lunchEndMin, 0, 0);
      loops++;
      continue;
    }
    
    // 4. Después de la jornada laboral
    if (timeVal >= endVal) {
      // Avanzar al día siguiente
      adjusted.setDate(adjusted.getDate() + 1);
      adjusted.setHours(startHour, startMin, 0, 0);
      loops++;
      continue;
    }
    
    break; // Fecha válida encontrada
  }
  
  return adjusted;
}

// Validar si un tiempo dado está dentro de los límites
function isTimeAllowed(date, settings) {
  const day = date.getDay();
  const isWeekend = (day === 0 || day === 6);
  
  if (isWeekend && !settings.weekendTracking) {
    return false;
  }
  
  const [startHour, startMin] = settings.workdayStart.split(':').map(Number);
  const [endHour, endMin] = settings.workdayEnd.split(':').map(Number);
  const [lunchStartHour, lunchStartMin] = settings.lunchStart.split(':').map(Number);
  const [lunchEndHour, lunchEndMin] = settings.lunchEnd.split(':').map(Number);
  
  const timeVal = date.getHours() * 60 + date.getMinutes();
  const startVal = startHour * 60 + startMin;
  const endVal = endHour * 60 + endMin;
  const lunchStartVal = lunchStartHour * 60 + lunchStartMin;
  const lunchEndVal = lunchEndHour * 60 + lunchEndMin;
  
  return (timeVal >= startVal && timeVal < endVal && !(timeVal >= lunchStartVal && timeVal < lunchEndVal));
}

// Obtener string de fecha local YYYY-MM-DD
function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Escuchar mensajes desde el popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'skip_posture' || message.action === 'reset_posture') {
    (async () => {
      const settings = await chrome.storage.local.get(null);
      await scheduleNextAlarm('postureAlarm', settings.postureInterval, settings);
      sendResponse({ status: 'success' });
    })();
    return true; // Asíncrono
  }
});

