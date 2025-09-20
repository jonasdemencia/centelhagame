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
        if (conditions.clima === 'tempestade') return 'storm';
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

        // Adiciona gotas de chuva para tempestade
        if (effectName === 'storm') {
            this.createRainDrops(overlay.querySelector('.rain-container'));
        }
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





