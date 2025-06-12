// Sistema de narração e reconhecimento de voz
let speechSynthesisActive = false;
let lastSpeechTime = 0;

// Função para narrar texto usando a Web Speech API
export function narrate(text, lang = 'pt-BR') {
    // Cancela qualquer fala anterior
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Remove tags HTML, se houver
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        if (!cleanText.trim()) return;
        
        const utterance = new window.SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 1;
        utterance.pitch = 1.1;
        
        // Marca que a síntese de voz está ativa
        speechSynthesisActive = true;
        lastSpeechTime = Date.now();
        
        // Adiciona eventos para monitorar o estado da síntese
        utterance.onend = () => {
            console.log("Narração concluída");
            speechSynthesisActive = false;
        };
        
        utterance.onerror = (event) => {
            console.error("Erro na narração:", event);
            speechSynthesisActive = false;
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

// Verifica se a síntese de voz está ativa
export function isSpeaking() {
    // Se passou mais de 10 segundos desde a última fala, considera inativo
    // mesmo que o evento onend não tenha sido disparado
    if (speechSynthesisActive && Date.now() - lastSpeechTime > 10000) {
        speechSynthesisActive = false;
    }
    
    return speechSynthesisActive || window.speechSynthesis.speaking;
}

// Função para pausar o reconhecimento de voz durante a narração
export function shouldPauseRecognition() {
    return isSpeaking();
}
