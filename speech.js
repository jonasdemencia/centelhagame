// speech.js - versão ultra simplificada
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

// Funções vazias para compatibilidade
export function playActivationSound() {}
export function playSuccessSound() {}
