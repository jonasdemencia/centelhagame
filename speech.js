// Sistema de narração e reconhecimento de voz
export function narrate(text, lang = 'pt-BR') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    if (!cleanText) return;
    
    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
}

export function isSpeaking() {
    return window.speechSynthesis.speaking;
}

// Funções de feedback sonoro simplificadas
export function playActivationSound() {
    // Som simples usando AudioContext
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 880; // Nota A5
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
        console.log("Feedback sonoro não disponível");
    }
}

export function playSuccessSound() {
    // Som simples usando AudioContext
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nota D5
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // Nota A5
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 300);
    } catch (e) {
        console.log("Feedback sonoro não disponível");
    }
}
