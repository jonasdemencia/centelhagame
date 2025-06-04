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
        window.speechSynthesis.speak(utterance);
    }
}
