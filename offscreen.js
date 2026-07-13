chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'play_sound') {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Beep 1
      const osc1 = context.createOscillator();
      const gain1 = context.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1500, context.currentTime);
      gain1.gain.setValueAtTime(0.4, context.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(context.destination);
      
      // Beep 2
      const osc2 = context.createOscillator();
      const gain2 = context.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1500, context.currentTime + 0.20);
      gain2.gain.setValueAtTime(0.4, context.currentTime + 0.20);
      gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(context.destination);
      
      osc1.start(context.currentTime);
      osc1.stop(context.currentTime + 0.15);
      
      osc2.start(context.currentTime + 0.20);
      osc2.stop(context.currentTime + 0.35);
      
      // Cerrar el contexto de audio tras finalizar para liberar recursos
      setTimeout(() => {
        context.close();
      }, 500);
      
      sendResponse({ status: "success" });
    } catch (e) {
      console.error("Error al reproducir audio sintetizado:", e);
      sendResponse({ status: "error", message: e.message });
    }
    return true; // Mantener canal abierto para respuesta asíncrona
  }
});
