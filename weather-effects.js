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
                    pointer-events: none;
                }
                .autumn-leaf.small { width: 1px; height: 1px; }
                .autumn-leaf.medium { width: 2px; height: 2px; }
                .autumn-leaf.large { width: 3px; height: 3px; }
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
        if (conditions.temperatura === 'quente') return 'hot';
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

        // Adiciona gotas de chuva para tempestade
        if (effectName === 'storm') {
            this.createRainDrops(overlay.querySelector('.rain-container'));
        }

        // Adiciona partículas de calor para dia quente
        if (effectName === 'hot') {
            this.createHeatParticles(overlay.querySelector('.particle-container'));
        }

        // Adiciona folhas de outono
        if (effectName === 'autumn') {
            this.createAutumnLeaves(overlay.querySelector('.leaves-container'));
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

    createAutumnLeaves(container) {
        const colors = ['#8b0000', '#d2691e', '#ff8c00', '#ffd700', '#800000'];
        const sizes = ['small', 'medium', 'large'];
        const counts = [20, 12, 6];
        
        sizes.forEach((size, index) => {
            for (let i = 0; i < counts[index]; i++) {
                setTimeout(() => {
                    const leaf = document.createElement('div');
                    leaf.className = `autumn-leaf ${size}`;
                    leaf.style.left = Math.random() * window.innerWidth + 'px';
                    leaf.style.top = '-50px';
                    leaf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    leaf.style.opacity = Math.random() * 0.3 + 0.1;
                    
                    container.appendChild(leaf);
                    
                    const duration = 25000 + Math.random() * 15000;
                    const swaySpeed = 0.0002 + Math.random() * 0.0008;
                    const swayAmount = 15 + Math.random() * 25;
                    const rotationSpeed = 0.5 + Math.random() * 1;
                    const driftX = (Math.random() - 0.5) * 60;
                    
                    let startTime = Date.now();
                    let rotation = 0;
                    
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = elapsed / duration;
                        
                        if (progress >= 1) {
    leaf.remove();
    // Cria uma nova folha para substituir
    setTimeout(() => {
        const newLeaf = document.createElement('div');
        newLeaf.className = `autumn-leaf ${size}`;
        newLeaf.style.left = Math.random() * window.innerWidth + 'px';
        newLeaf.style.top = '-50px';
        newLeaf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        newLeaf.style.opacity = Math.random() * 0.3 + 0.1;
        
        container.appendChild(newLeaf);
        
        // Reinicia a animação com a nova folha
        startTime = Date.now();
        rotation = 0;
        leaf = newLeaf;
        animate();
    }, Math.random() * 2000);
    return;
}

                        
                        const easeProgress = progress * progress * (3 - 2 * progress);
                        const y = -50 + (window.innerHeight + 100) * easeProgress;
                        const x = Math.sin(elapsed * swaySpeed) * swayAmount + (driftX * progress);
                        rotation += rotationSpeed;
                        
                        leaf.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
                        requestAnimationFrame(animate);
                    };
                    
                    animate();
                }, i * (size === 'small' ? 500 : size === 'medium' ? 700 : 1000));
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

