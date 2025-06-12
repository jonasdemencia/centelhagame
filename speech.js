// speech.js - versão otimizada com modo de atenção
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

// Sons de feedback
export function playActivationSound() {
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDA4ODg4ODg4ODg4ODg4ODg4P//////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCkAAAAAAAAAGwxaDPiTEAAAAAAAAAAAAAAAAAAP/jOMAAAAAAAAAAAABJbmZvAAAADwAAAAMAAAGwAJCQkJCQkJCQkJCQkJCQkMDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg4OD//////////////////////////wAAAABMYXZjNTguMTMAAAAAAAAAAAAAAACQAlAAAAAAAAABsMWgz4kxAAAAAAAAAAAAAAAAAAAAAAD/4zjMAAAAAAAAAAAASW5mbwAAAA8AAAADAAABsACQkJCQkJCQkJCQkJCQkJDAwMDAwMDAwMDAwMDAwMDg4ODg4ODg4ODg4ODg4ODg//////////////////////////8AAAAALAV2YzU4LjEzAAAAAAAAAAAAAAAAkAJQAAAAAAAAABDFoM+JMQAAAAAAAAAAAAAAAAAAAAA=');
    audio.play();
}

export function playSuccessSound() {
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAABwAUFBQUFBQUFBQUFBQUFBQgICAgICAgICAgICAgICAsMDAwMDAwMDAwMDAwMDAwP//////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQEkAAAAAAAAAEcxUhqiTEAAAAAAAAAAAAAAAAAAP/jOMAAAAAAAAAAAABJbmZvAAAADwAAAAMAAABwAFBQUFBQUFBQUFBQUFBQUICAgICAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMD//////////////////////////wAAAABMYXZjNTguMTMAAAAAAAAAAAAAAACQBJAAAAAAAAABHMVIaokxAAAAAAAAAAAAAAAAAAAAAAD/4zjMAAAAAAAAAAAASW5mbwAAAA8AAAADAAABsABQUFBQUFBQUFBQUFBQUFCAgICAgICAgICAgICAgIDAwMDAwMDAwMDAwMDAwMDA//////////////////////////8AAAAALAV2YzU4LjEzAAAAAAAAAAAAAAAAkASQAAAAAAAAABzFSGqJMQAAAAAAAAAAAAAAAAAAAAAA');
    audio.play();
}
