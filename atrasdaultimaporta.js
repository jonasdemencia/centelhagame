const contentData = {
    grimorio: "Grimório com informações das magias e treino de magia - exclusivo para magos",
    cruzar: "Cruzar animais",
    sacrificar: "Sacrificar animais (Berço e Lâmina)",
    silencio: "Silêncio (entrecorda)",
    dormir: "Dormir para dentro - não existe sono, a pessoa dorme se quiser",
    cagar: "Necessidades fisiológicas - caso coma, tem que cagar",
    comer: "Comer - não existe fome, a pessoa come se quiser",
    alambique: "Alambique",
    sombra: "Jogos com a sua sombra - exclusivo para ladinos (Roubar de si mesmo)",
    semente: "Semente de si mesmo (para depois)",
    sangue: "Sangue Recursivo (para depois)"
};

document.querySelectorAll('.menu-btn').forEach(button => {
    button.addEventListener('click', function() {
        const content = this.getAttribute('data-content');
        document.getElementById('content-area').textContent = contentData[content];
    });
});
