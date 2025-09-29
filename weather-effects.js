// Sistema Global de Efeitos Climáticos
class WeatherEffectsManager {
    constructor() {
        this.currentEffect = null;
        this.effects = {};
        this.init();
    }

    async init() {
        this.loadEffectDefinitions();
        await this.updateEffects();
        setInterval(() => this.updateEffects(), 30 * 60 * 1000);
    }

    loadEffectDefinitions() {
        // Efeito de Interferência Mágica (correto)
        this.effects.interference = {
            html: `<div class="weather-overlay interference-effect">
                <div class="static-overlay"></div>
            </div>`,
            css: `
                .interference-effect {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                }

                @keyframes static-flicker {
                    0% { filter: brightness(1) contrast(1); }
                    5% { filter: brightness(1.2) contrast(1.1); }
                    10% { filter: brightness(0.8) contrast(1); }
                    15% { filter: brightness(1.1) contrast(0.9); }
                    20% { filter: brightness(1) contrast(1); }
                    25% { filter: brightness(1.2) contrast(1.1); }
                    30% { filter: brightness(0.8) contrast(1); }
                    35% { filter: brightness(1.1) contrast(0.9); }
                    40% { filter: brightness(1) contrast(1); }
                    45% { filter: brightness(1.2) contrast(1.1); }
                    50% { filter: brightness(0.8) contrast(1); }
                    55% { filter: brightness(1.1) contrast(0.9); }
                    60% { filter: brightness(1) contrast(1); }
                    65% { filter: brightness(1.2) contrast(1.1); }
                    70% { filter: brightness(0.8) contrast(1); }
                    75% { filter: brightness(1.1) contrast(0.9); }
                    80% { filter: brightness(1) contrast(1); }
                    85% { filter: brightness(1.2) contrast(1.1); }
                    90% { filter: brightness(0.8) contrast(1); }
                    95% { filter: brightness(1.1) contrast(0.9); }
                    100% { filter: brightness(1) contrast(1); }
                }

                @keyframes pixel-glow {
                    0%, 100% { opacity: 0; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.5); }
                }
                
                @keyframes pixel-fade {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }

                .static-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 1px 1px;
                    animation: static-flicker 0.2s steps(20, end) infinite;
                }

                .pixel {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    pointer-events: none;
                    border-radius: 50%;
                    animation-iteration-count: infinite;
                    animation-timing-function: ease-in-out;
                }

                .pixel.purple {
                    background-color: #8a2be2;
                    box-shadow: 0 0 2px 1px #8a2be2, 0 0 4px #8a2be2;
                }

                .pixel.silver {
                    background-color: #c0c0c0;
                    box-shadow: 0 0 2px 1px #c0c0c0, 0 0 4px #c0c0c0;
                }
            `
        };

        this.effects.lowmagic = {
            html: `<div class="weather-overlay lowmagic-effect"><div class="scanline"></div></div>`,
            css: `
                .lowmagic-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: rgba(17, 17, 17, 0.1);
                }
                
                .lowmagic-effect::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        0deg,
                        rgba(255,255,255,0.03) 0px,
                        rgba(255,255,255,0.03) 1px,
                        transparent 1px,
                        transparent 3px
                    );
                    animation: noise 0.4s steps(2) infinite;
                    mix-blend-mode: overlay;
                }

                @keyframes noise {
                    from { transform: translateY(0); }
                    to   { transform: translateY(-1px); }
                }

                .scanline {
                    position: absolute;
                    width: 100%;
                    height: 1px;
                    background: rgba(255,255,255,0.08);
                    top: -2px;
                    animation: scan 6s linear infinite;
                }
                @keyframes scan {
                    0% { top: -2px; }
                    100% { top: 100%; }
                }
            `
        };

        this.effects.highmagic = {
            html: `<div class="weather-overlay highmagic-effect"><div class="scanline"></div><div class="waves"></div><div class="flash"></div></div>`,
            css: `
                .highmagic-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: rgba(17, 17, 17, 0.2);
                    filter: contrast(1.2) brightness(1.1) saturate(1.2);
                }
                
                .highmagic-effect::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        0deg,
                        rgba(255,255,255,0.04) 0px,
                        rgba(255,255,255,0.04) 1px,
                        transparent 1px,
                        transparent 2px
                    );
                    animation: noise 0.2s steps(2) infinite;
                    mix-blend-mode: overlay;
                }

                @keyframes noise {
                    from { transform: translateY(0); }
                    to   { transform: translateY(-2px); }
                }

                .scanline {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: rgba(255,255,255,0.15);
                    top: -2px;
                    animation: scan 5s linear infinite;
                }
                @keyframes scan {
                    0% { top: -2px; }
                    100% { top: 100%; }
                }

                .waves {
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        to bottom,
                        rgba(255,255,255,0.03) 0px,
                        rgba(255,255,255,0.03) 2px,
                        transparent 2px,
                        transparent 4px
                    );
                    animation: distort 5s infinite;
                    mix-blend-mode: overlay;
                }
                @keyframes distort {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-10px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(8px); }
                }

                .flash {
                    position: absolute;
                    inset: 0;
                    background: white;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.1s ease;
                }
            `
        };

        this.effects.storm = {
            html: `<div class="weather-overlay storm-effect"><div class="rain-container"></div></div>`,
            css: `
                .storm-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: rgba(27, 39, 53, 0.3);
                }
                .rain-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .drop {
                    position: absolute;
                    background: #fff;
                    border-radius: 50%;
                    opacity: 0.6;
                    animation: fall linear infinite;
                }
                @keyframes fall {
                    to { transform: translateY(100vh); }
                }
            `
        };

        this.effects.hot = {
            html: `<div class="weather-overlay hot-effect"><div class="particle-container"></div></div>`,
            css: `
                .hot-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: rgba(255, 87, 34, 0.1);
                }
                .particle-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .heat-particle {
                    position: absolute;
                    bottom: -20px;
                    background-color: rgba(255, 87, 34, 0.6);
                    border-radius: 50%;
                    animation: rise linear infinite;
                }
                @keyframes rise {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
                }
            `
        };

        this.effects.veryhot = {
            html: `<div class="weather-overlay veryhot-effect"><div class="embers-container"></div></div>`,
            css: `
                .veryhot-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: rgba(255, 60, 0, 0.15);
                }
                .embers-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .ember {
                    position: absolute;
                    bottom: -10px;
                    background: radial-gradient(circle at center, rgba(255, 120, 0, 0.9) 0%, rgba(255, 60, 0, 0.7) 50%, rgba(255, 0, 0, 0.5) 100%);
                    box-shadow: 0 0 5px rgba(255, 100, 0, 0.8), 0 0 10px rgba(255, 50, 0, 0.6);
                    border-radius: 50%;
                    animation: rise-ember linear infinite;
                    opacity: 0;
                }
                @keyframes rise-ember {
                    0% {
                        transform: translateY(0) scale(0.8);
                        opacity: 0;
                        filter: blur(0px);
                    }
                    20% {
                        opacity: 1;
                        transform: translateY(-10vh) scale(1);
                        filter: blur(0px);
                    }
                    80% {
                        opacity: 0.8;
                        transform: translateY(-80vh) scale(0.6);
                        filter: blur(1px);
                    }
                    100% {
                        transform: translateY(-100vh) scale(0.3);
                        opacity: 0;
                        filter: blur(2px);
                    }
                }
            `
        };

        this.effects.autumn = {
            html: `<div class="weather-overlay autumn-effect"><div class="leaves-container"></div></div>`,
            css: `
                .autumn-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: linear-gradient(to bottom, rgba(253, 228, 197, 0.1) 0%, rgba(216, 131, 112, 0.1) 50%, rgba(123, 75, 59, 0.1) 100%);
                }
                .leaves-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .autumn-leaf {
                    position: absolute;
                    top: -10px;
                    width: 2px;
                    height: 2px;
                    opacity: 0.8;
                    pointer-events: none;
                    animation: autumnFall linear;
                }
                @keyframes autumnFall {
                    0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 1; }
                    25% { transform: translateY(25vh) translateX(15px) rotate(90deg); }
                    50% { transform: translateY(50vh) translateX(-10px) rotate(180deg); }
                    75% { transform: translateY(75vh) translateX(20px) rotate(270deg); }
                    100% { transform: translateY(100vh) translateX(0) rotate(360deg); opacity: 0; }
                }
            `
        };

        this.effects.spring = {
            html: `
                <div class="weather-overlay spring-effect">
                    <div class="pollen-container"></div>
                    <div class="petal-container"></div>
                </div>
            `,
            css: `
                .spring-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: linear-gradient(
                        to bottom right,
                        rgba(240, 253, 244, 0.08),
                        rgba(255, 250, 230, 0.06)
                    );
                }

                .pollen-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                }

                .petal-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                }

                @keyframes pollen-float {
                    0%   { transform: translateY(-10vh) translateX(0); opacity: 0; }
                    10%  { opacity: 0.6; }
                    40%  { transform: translateY(40vh) translateX(6vw) rotate(10deg); opacity: 0.8; }
                    70%  { transform: translateY(75vh) translateX(-4vw) rotate(-15deg); opacity: 0.6; }
                    100% { transform: translateY(110vh) translateX(2vw) rotate(0deg); opacity: 0; }
                }

                .pollen {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0;
                    pointer-events: none;
                    animation-name: pollen-float;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    background: #ffff00;
                    box-shadow: 0 0 3px #ffff00;
                }

                .pollen.tiny  { width: 1px; height: 1px; }
                .pollen.small { width: 1.5px; height: 1.5px; }
                .pollen.medium { width: 2px; height: 2px; }

                @keyframes petal-fall {
                    0% {
                        transform: translateY(-10vh) translateX(0) rotateZ(0deg) rotateX(0deg);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    50% {
                        transform: translateY(50vh) translateX(15vw) rotateZ(90deg) rotateX(180deg);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translateY(120vh) translateX(-10vw) rotateZ(180deg) rotateX(360deg);
                        opacity: 0;
                    }
                }

                @keyframes petal-float {
                    0% {
                        transform: translateY(-10vh) translateX(0) rotateZ(0deg);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    30% {
                        transform: translateY(30vh) translateX(5vw) rotateZ(20deg);
                    }
                    60% {
                        transform: translateY(60vh) translateX(-3vw) rotateZ(-15deg);
                    }
                    100% {
                        transform: translateY(120vh) translateX(2vw) rotateZ(10deg);
                        opacity: 0;
                    }
                }

                .petal.green {
    background: radial-gradient(circle at 30% 30%, #90ee90 0%, #32cd32 60%, #228b22 100%);
}


                .petal {
                    position: absolute;
                    width: 5px;
                    height: 8px;
                    background: radial-gradient(circle at 30% 30%, #ff7f9f 0%, #ff4770 60%, #d62849 100%);
                    border-radius: 60% 60% 80% 80%;
                    opacity: 0;
                    animation: petal-fall linear infinite;
                    filter: blur(0.3px);
                }
            `
        };

        this.effects.winter = {
            html: `<div class="weather-overlay winter-effect"><div class="blizzard"></div><div class="snow-container"></div></div>`,
            css: `
                .winter-effect {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    background: linear-gradient(to bottom, rgba(26, 26, 46, 0.2), rgba(22, 33, 62, 0.2));
                }
                .blizzard {
                    position: absolute;
                    inset: -20%;
                    background-image: repeating-linear-gradient(
                        -20deg,
                        rgba(255,255,255,0.15) 0px,
                        rgba(255,255,255,0.15) 1px,
                        transparent 1px,
                        transparent 10px
                    );
                    animation: blow 3s linear infinite;
                    filter: blur(1px);
                    opacity: 0.15;
                }
                @keyframes blow {
                    from { transform: translateX(0) translateY(0) skewX(-6deg); }
                    to   { transform: translateX(-20vh) translateY(12vh) skewX(-6deg); }
                }
                .snow-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                @keyframes fall {
                    0%   { transform: translateY(-10vh) translateX(0); opacity: 0; }
                    10%  { opacity: 0.8; }
                    100% { transform: translateY(110vh) translateX(10vw); opacity: 0; }
                }
                @keyframes sway {
                    0%,100% { transform: translateX(0) rotate(0deg); }
                    50%     { transform: translateX(1vw) rotate(8deg); }
                }
                .flake {
                    position: absolute;
                    top: -20px;
                    animation: fall linear forwards;
                }
                .flake span {
                    display: block;
                    width: 3px;
                    height: 3px;
                    background: white;
                    border-radius: 50%;
                    animation: sway ease-in-out infinite;
                    opacity: 0.7;
                }
                .flake.small span { width: 1px; height: 1px; opacity: 0.5; }
                .flake.medium span { width: 2px; height: 2px; opacity: 0.6; }
                .flake.large span { width: 4px; height: 4px; opacity: 0.8; }
            `
        };

        this.effects.cloudy = {
    html: `<div class="weather-overlay cloudy-effect"><div class="fog-wrapper"><div class="fog-layer"></div><div class="fog-layer"></div></div></div>`,
    css: `
        .cloudy-effect {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999;
            background-color: rgba(74, 74, 74, 0.2);
        }
        
        @keyframes fog-drift {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        
        .fog-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            display: flex;
            animation: fog-drift 120s linear infinite;
        }

        .fog-layer {
            position: relative;
            width: 50%;
            height: 100%;
        }

        .fog-layer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
            
            box-shadow: 
                30vw 10vh 20vh 5vh,
                50vw 80vh 15vh 4vh,
                80vw 20vh 25vh 6vh,
                10vw 90vh 18vh 3vh,
                90vw 50vh 22vh 7vh,
                20vw 40vh 10vh 2vh,
                70vw 70vh 16vh 5vh,
                40vw 30vh 24vh 8vh,
                60vw 60vh 19vh 6vh;
            
            filter: blur(50px);
            opacity: 0.8;
            pointer-events: none;
        }
    `
};

    }

    async updateEffects() {
        try {
            const conditions = await window.ArcanumConditions.getConditions();
            const newEffect = this.determineEffect(conditions);
            
            if (newEffect !== this.currentEffect) {
                this.removeCurrentEffect();
                if (newEffect) {
                    this.applyEffect(newEffect);
                }
                this.currentEffect = newEffect;
            }
        } catch (error) {
            console.error('Erro ao atualizar efeitos climáticos:', error);
        }
    }

    determineEffect(conditions) {
        if (conditions.energiaMagica === 'interferencia') return 'interference';
        if (conditions.energiaMagica === 'alta') return 'highmagic';
        if (conditions.energiaMagica === 'baixa') return 'lowmagic';
        if (conditions.clima === 'tempestade') return 'storm';
        if (conditions.clima === 'nublado') return 'cloudy';
        if (conditions.temperatura === 'muito-quente') return 'veryhot';
        if (conditions.temperatura === 'quente') return 'hot';
        if (conditions.estacao === 'primavera') return 'spring';
        if (conditions.estacao === 'inverno') return 'winter';
        if (conditions.estacao === 'outono') return 'autumn';
        return null;
    }

    applyEffect(effectName) {
        const effect = this.effects[effectName];
        if (!effect) return;

        this.injectCSS(effect.css, `weather-${effectName}`);
        
        const container = document.createElement('div');
        container.innerHTML = effect.html;
        const overlay = container.firstElementChild;
        document.body.appendChild(overlay);

        // Adiciona pixels mágicos para interferência
        if (effectName === 'interference') {
            this.createMagicPixels(overlay, 15, 4, 7);
        }

        // Adiciona flash aleatório para energia mágica alta
        if (effectName === 'highmagic') {
            this.createRandomFlash(overlay);
        }

        // Adiciona gotas de chuva para tempestade
        if (effectName === 'storm') {
            this.createRainDrops(overlay.querySelector('.rain-container'));
        }

        // Adiciona partículas de calor para dia quente
        if (effectName === 'hot') {
            this.createHeatParticles(overlay.querySelector('.particle-container'));
        }

        // Adiciona brasas para muito quente
        if (effectName === 'veryhot') {
            this.createEmbers(overlay.querySelector('.embers-container'));
        }

        // Adiciona pólen e pétalas para primavera
        if (effectName === 'spring') {
            this.createPollen(overlay.querySelector('.pollen-container'));
            this.createPetals(overlay.querySelector('.petal-container'));
        }

        // Adiciona flocos de neve para inverno
        if (effectName === 'winter') {
            this.createSnowflakes(overlay.querySelector('.snow-container'));
        }

        // Adiciona folhas de outono
        if (effectName === 'autumn') {
            this.createAutumnLeaves(overlay.querySelector('.leaves-container'));
        }
    }

    createPollen(container) {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'pollen ' + (['tiny','small','medium'][Math.floor(Math.random()*3)]);
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (10 + Math.random() * 15) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(p);
        }
    }

    createPetals(container) {
    const movements = ['petal-fall', 'petal-float'];
    
    for (let i = 0; i < 5; i++) {
        const petal = document.createElement('div');
        const isGreen = i === 0; // 1 de cada 5 pétalas será verde
        petal.className = isGreen ? 'petal green' : 'petal';
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.animationDuration = `${10 + Math.random() * 8}s`;
        petal.style.animationDelay = `${Math.random() * 10}s`;
        petal.style.animationName = movements[Math.floor(Math.random() * movements.length)];
        container.appendChild(petal);
    }
}


    createRandomFlash(container) {
        const flash = container.querySelector('.flash');
        
        const randomFlash = () => {
            flash.style.opacity = 0.4 + Math.random() * 0.6;
            setTimeout(() => {
                flash.style.opacity = 0;
            }, 100 + Math.random() * 200);
            
            const next = 2000 + Math.random() * 5000;
            setTimeout(randomFlash, next);
        };
        
        setTimeout(randomFlash, 2000);
    }

    createMagicPixels(container, count, minDuration, maxDuration) {
        for (let i = 0; i < count; i++) {
            const pixel = document.createElement('div');
            const isSilver = Math.random() < 0.5;
            
            pixel.className = `pixel ${isSilver ? 'silver' : 'purple'}`;
            
            const duration = Math.random() * (maxDuration - minDuration) + minDuration;
            const delay = Math.random() * -duration;
            
            // Posição inicial aleatória
            let leftPosition = Math.random() * 100;
            let topPosition = Math.random() * 100;
            
            pixel.style.left = `${leftPosition}vw`;
            pixel.style.top = `${topPosition}vh`;
            pixel.style.animationDuration = `${duration}s`;
            pixel.style.animationDelay = `${delay}s`;
            pixel.style.animationName = isSilver ? 'pixel-glow' : 'pixel-fade';
            
            container.appendChild(pixel);
            
            // Move o pixel para nova posição a cada ciclo de animação
            pixel.addEventListener('animationiteration', () => {
                leftPosition = Math.random() * 100;
                topPosition = Math.random() * 100;
                pixel.style.left = `${leftPosition}vw`;
                pixel.style.top = `${topPosition}vh`;
            });
        }
    }

    createRainDrops(container) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const layers = isMobile ? [
            { count: 20, minSize: 0.5, maxSize: 1, minDuration: 2, maxDuration: 3 },
            { count: 30, minSize: 0.8, maxSize: 1.5, minDuration: 1.5, maxDuration: 2.5 },
            { count: 25, minSize: 1, maxSize: 2, minDuration: 1, maxDuration: 2 }
        ] : [
            { count: 80, minSize: 0.5, maxSize: 1, minDuration: 2, maxDuration: 3 },
            { count: 150, minSize: 0.8, maxSize: 1.5, minDuration: 1.5, maxDuration: 2.5 },
            { count: 100, minSize: 1, maxSize: 2, minDuration: 1, maxDuration: 2 }
        ];
        
        layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                const drop = document.createElement('div');
                drop.className = 'drop';
                const size = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize;
                const duration = Math.random() * (layer.maxDuration - layer.minDuration) + layer.minDuration;
                const delay = Math.random() * -duration;
                
                drop.style.width = `${size}px`;
                drop.style.height = `${size * 2}px`;
                drop.style.left = `${Math.random() * 100}vw`;
                drop.style.animationDuration = `${duration}s`;
                drop.style.animationDelay = `${delay}s`;
                drop.style.opacity = Math.random() * 0.4 + 0.2;
                drop.style.filter = `blur(${size / 4}px)`;
                
                container.appendChild(drop);
            }
        });
    }

    createHeatParticles(container) {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'heat-particle';
            const size = Math.random() * 4 + 2;
            const duration = Math.random() * 10 + 9;
            const delay = Math.random() * -duration;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            container.appendChild(particle);
        }
    }

    createEmbers(container) {
        const emberData = [
            { width: 3, height: 3, left: 10, duration: 10, delay: -1 },
            { width: 2, height: 2, left: 20, duration: 8, delay: -4 },
            { width: 4, height: 4, left: 30, duration: 12, delay: -2 },
            { width: 2.5, height: 2.5, left: 40, duration: 9, delay: -6 },
            { width: 3.5, height: 3.5, left: 50, duration: 11, delay: -3 },
            { width: 2, height: 2, left: 60, duration: 7, delay: -5 },
            { width: 4, height: 4, left: 70, duration: 13, delay: -0.5 },
            { width: 2.8, height: 2.8, left: 80, duration: 10.5, delay: -7 },
            { width: 3, height: 3, left: 90, duration: 9.5, delay: -2.5 },
            { width: 2.2, height: 2.2, left: 15, duration: 8.5, delay: -1.5 },
            { width: 3.8, height: 3.8, left: 35, duration: 14, delay: -4.5 },
            { width: 2.7, height: 2.7, left: 55, duration: 9, delay: -0.8 },
            { width: 3.2, height: 3.2, left: 75, duration: 11.5, delay: -3.5 },
            { width: 2.3, height: 2.3, left: 95, duration: 7.5, delay: -6.5 },
            { width: 3.6, height: 3.6, left: 5, duration: 10, delay: -1.8 }
        ];

        emberData.forEach(data => {
            const ember = document.createElement('div');
            ember.className = 'ember';
            ember.style.width = `${data.width}px`;
            ember.style.height = `${data.height}px`;
            ember.style.left = `${data.left}%`;
            ember.style.animationDuration = `${data.duration}s`;
            ember.style.animationDelay = `${data.delay}s`;
            container.appendChild(ember);
        });
    }

    createSnowflakes(container) {
        const spawnFlake = (size, count) => {
            for (let i = 0; i < count; i++) {
                const flake = document.createElement('div');
                flake.className = `flake ${size}`;
                const inner = document.createElement('span');
                flake.appendChild(inner);

                flake.style.left = Math.random() * 100 + 'vw';
                const fallDur = 12 + Math.random() * 10;
                const swayDur = 4 + Math.random() * 3;
                const delay = Math.random() * 8;

                flake.style.animationDuration = fallDur + 's';
                flake.style.animationDelay = delay + 's';
                inner.style.animationDuration = swayDur + 's';

                container.appendChild(flake);

                flake.addEventListener('animationend', () => {
                    flake.remove();
                    spawnFlake(size, 1);
                });
            }
        };

        spawnFlake('small', 40);
        spawnFlake('medium', 25);
        spawnFlake('large', 10);
    }

    createAutumnLeaves(container) {
        const colors = ['#8b0000', '#d2691e', '#ff8c00', '#ffd700', '#800000'];
        
        const spawnLeaf = () => {
            const leaf = document.createElement('div');
            leaf.className = 'autumn-leaf';
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            const duration = Math.random() * 15 + 25;
            leaf.style.animationDuration = `${duration}s, 3s`;
            
            container.appendChild(leaf);
            
            leaf.addEventListener('animationend', () => {
                leaf.remove();
                spawnLeaf();
            });
        };
        
        for (let i = 0; i < 15; i++) {
            spawnLeaf();
        }
    }

    removeCurrentEffect() {
        const overlay = document.querySelector('.weather-overlay');
        if (overlay) overlay.remove();
        
        const styleSheets = document.querySelectorAll('style[data-weather]');
        styleSheets.forEach(sheet => sheet.remove());
    }

    injectCSS(css, id) {
        const style = document.createElement('style');
        style.setAttribute('data-weather', id);
        style.textContent = css;
        document.head.appendChild(style);
    }

    addEffect(name, definition) {
        this.effects[name] = definition;
    }

    async forceUpdate() {
        await this.updateEffects();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Aguarda o Firebase carregar
    setTimeout(() => {
        window.WeatherEffects = new WeatherEffectsManager();
    }, 1000);
});

window.WeatherEffectsManager = WeatherEffectsManager;



