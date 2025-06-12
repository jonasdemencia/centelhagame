// Sistema de narração e reconhecimento de voz
let speechSynthesisActive = false;

// Função para narrar texto usando a Web Speech API
export function narrate(text, lang = 'pt-BR') {
    if (!('speechSynthesis' in window) || !text || !text.trim()) return;
    
    try {
        // Cancela qualquer fala anterior
        window.speechSynthesis.cancel();
        
        // Remove tags HTML e limpa o texto
        const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
        if (!cleanText) return;
        
        const utterance = new window.SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 1;
        utterance.pitch = 1.1;
        
        // Simplifica o tratamento de eventos
        speechSynthesisActive = true;
        utterance.onend = utterance.onerror = () => {
            speechSynthesisActive = false;
        };
        
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.error("Erro na narração:", e);
        speechSynthesisActive = false;
    }
}

// Verifica se a síntese de voz está ativa
export function isSpeaking() {
    return speechSynthesisActive;
}
