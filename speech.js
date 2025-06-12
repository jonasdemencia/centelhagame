// Sistema de narração e reconhecimento de voz
console.log("Carregando módulo speech.js");

export function narrate(text, lang = 'pt-BR') {
    console.log("Função narrate chamada com texto:", text?.substring(0, 50) + (text?.length > 50 ? "..." : ""));
    
    if (!('speechSynthesis' in window)) {
        console.error("API de síntese de voz não disponível");
        return;
    }
    
    console.log("Cancelando síntese anterior");
    window.speechSynthesis.cancel();
    
    // Remove tags HTML, se houver
    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    if (!cleanText) {
        console.log("Texto vazio após limpeza, abortando narração");
        return;
    }
    
    console.log("Criando utterance com texto limpo");
    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => console.log("Narração iniciada");
    utterance.onend = () => console.log("Narração finalizada");
    utterance.onerror = (e) => console.error("Erro na narração:", e);
    
    console.log("Iniciando narração");
    window.speechSynthesis.speak(utterance);
}

export function isSpeaking() {
    const speaking = window.speechSynthesis.speaking;
    console.log("Verificação isSpeaking:", speaking);
    return speaking;
}
