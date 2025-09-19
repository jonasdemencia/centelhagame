// Sistema Global de Efeitos Climáticos
class WeatherEffectsManager {
    constructor() {
        this.currentEffect = null;
        this.effects = {};
        this.init();
    }

    async init() {
        // Carrega efeitos disponíveis
        this.loadEffectDefinitions();
        
        // Aplica efeitos baseado nas condições atuais
        await this.updateEffects();
        
        // Atualiza a cada 30 minutos
        setInterval(() => this.updateEffects(), 30 * 60 * 1000);
    }

    loadEffectDefinitions() {
        // Efeito de Interferência (você vai substituir depois)
        this.effects.interference = {
            html: `<div class="weather-overlay interference-effect">
                <div class="embers-overlay">
                    ${Array(15).fill().map(() => '<div class="ember"></div>').join('')}
                </div>
            </div>`,
            css: `
                .interference-effect { /* CSS temporário - você vai substituir */ }
                .embers-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; }
                .ember { position: absolute; bottom: -10px; width: 3px; height: 3px; background: orange; border-radius: 50%; }
            `
        };

        // Placeholder para outros efeitos
        this.effects.storm = {
            html: `<div class="weather-overlay storm-effect"><div class="rain-lines"></div></div>`,
            css: `.storm-effect { position: fixed; inset: 0; pointer-events: none; z-index: 9999; background: rgba(0,0,50,0.3); }`
        };

        this.effects.fog = {
            html: `<div class="weather-overlay fog-effect"></div>`,
            css: `.fog-effect { position: fixed; inset: 0; pointer-events: none; z-index: 9999; background: rgba(200,200,200,0.4); }`
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
        // Prioridade dos efeitos
        if (conditions.energiaMagica === 'interferencia') return 'interference';
        if (conditions.clima === 'tempestade') return 'storm';
        if (conditions.clima === 'neblina') return 'fog';
        return null;
    }

    applyEffect(effectName) {
        const effect = this.effects[effectName];
        if (!effect) return;

        // Adiciona CSS
        this.injectCSS(effect.css, `weather-${effectName}`);
        
        // Adiciona HTML
        const container = document.createElement('div');
        container.innerHTML = effect.html;
        document.body.appendChild(container.firstElementChild);
    }

    removeCurrentEffect() {
        // Remove overlay HTML
        const overlay = document.querySelector('.weather-overlay');
        if (overlay) overlay.remove();
        
        // Remove CSS
        const styleSheets = document.querySelectorAll('style[data-weather]');
        styleSheets.forEach(sheet => sheet.remove());
    }

    injectCSS(css, id) {
        const style = document.createElement('style');
        style.setAttribute('data-weather', id);
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Método para adicionar novos efeitos dinamicamente
    addEffect(name, definition) {
        this.effects[name] = definition;
    }

    // Método para forçar atualização manual
    async forceUpdate() {
        await this.updateEffects();
    }
}

// Inicializa automaticamente quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    window.WeatherEffects = new WeatherEffectsManager();
});

// Torna disponível globalmente
window.WeatherEffectsManager = WeatherEffectsManager;
