chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'play_sound') {
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
      
      // Cerrar el contexto de audio tras finalizar la secuencia (1.2 segundos en total)
      setTimeout(() => {
        context.close();
      }, 1200);
      
      sendResponse({ status: "success" });
    } catch (e) {
      console.error("Error al reproducir audio sintetizado:", e);
      sendResponse({ status: "error", message: e.message });
    }
    return true; // Mantener canal abierto para respuesta asíncrona
  }
});
