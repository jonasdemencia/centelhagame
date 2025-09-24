class SistemaNarrativas {
    constructor() {
        this.narrativaAtual = null;
        this.secaoAtual = 1;
        this.inventarioJogador = this.carregarInventario();
        this.energiaJogador = this.carregarEnergia();
        this.atributosJogador = this.carregarAtributos();
        
        this.inicializar();
    }

    inicializar() {
        // Event listeners para seleção de narrativas
        document.querySelectorAll('.narrativa-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const narrativaId = e.currentTarget.dataset.narrativa;
                this.iniciarNarrativa(narrativaId);
            });
        });

        // Botão voltar
        document.getElementById('voltar-selecao').addEventListener('click', () => {
            this.voltarSelecao();
        });

        // Modal de teste
        document.getElementById('rolar-dados').addEventListener('click', () => {
            this.rolarDados();
        });

        document.getElementById('continuar-teste').addEventListener('click', () => {
            this.continuarAposTeste();
        });
    }

    carregarInventario() {
        // Integração com sistema de inventário existente
        return JSON.parse(localStorage.getItem('inventario') || '[]');
    }

    carregarEnergia() {
        return parseInt(localStorage.getItem('energia') || '20');
    }

    carregarAtributos() {
        return {
            força: parseInt(localStorage.getItem('forca') || '10'),
            agilidade: parseInt(localStorage.getItem('agilidade') || '10'),
            inteligência: parseInt(localStorage.getItem('inteligencia') || '10'),
            carisma: parseInt(localStorage.getItem('carisma') || '10')
        };
    }

    iniciarNarrativa(narrativaId) {
        this.narrativaAtual = NARRATIVAS[narrativaId];
        this.secaoAtual = 1;
        
        document.getElementById('selecao-narrativas').className = 'tela-oculta';
        document.getElementById('narrativa-ativa').className = 'tela-ativa';
        document.getElementById('titulo-narrativa').textContent = this.narrativaAtual.titulo;
        
        this.mostrarSecao(1);
    }

    mostrarSecao(numeroSecao) {
        const secao = this.narrativaAtual.secoes[numeroSecao];
        if (!secao) return;

        this.secaoAtual = numeroSecao;
        
        // Aplicar efeitos da seção
        if (secao.efeitos) {
            this.aplicarEfeitos(secao.efeitos);
        }

        // Mostrar conteúdo
        document.getElementById('numero-secao').textContent = numeroSecao;
        document.getElementById('texto-narrativa').textContent = secao.texto;
        
        // Criar opções
        this.criarOpcoes(secao.opcoes, secao.final);
    }

    criarOpcoes(opcoes, isFinal = false) {
        const container = document.getElementById('opcoes-container');
        container.innerHTML = '';

        if (isFinal) {
            const btnFinalizar = document.createElement('button');
            btnFinalizar.className = 'opcao-btn';
            btnFinalizar.textContent = 'Finalizar Aventura';
            btnFinalizar.addEventListener('click', () => this.voltarSelecao());
            container.appendChild(btnFinalizar);
            return;
        }

        opcoes.forEach((opcao, index) => {
            const btn = document.createElement('button');
            btn.className = 'opcao-btn';
            btn.textContent = opcao.texto;
            
            // Verificar requisitos
            if (opcao.requer && !this.temItem(opcao.requer)) {
                btn.disabled = true;
                btn.textContent += ' (Requer: ' + opcao.requer + ')';
            }

            btn.addEventListener('click', () => {
                if (opcao.teste) {
                    this.iniciarTeste(opcao.teste, opcao.dificuldade, opcao.secao);
                } else {
                    this.mostrarSecao(opcao.secao);
                }
            });

            container.appendChild(btn);
        });
    }

    temItem(itemId) {
        return this.inventarioJogador.some(item => item.id === itemId);
    }

    aplicarEfeitos(efeitos) {
        efeitos.forEach(efeito => {
            switch (efeito.tipo) {
                case 'energia':
                    this.energiaJogador += efeito.valor;
                    this.salvarEnergia();
                    break;
                case 'item':
                    this.adicionarItem(efeito.item);
                    break;
            }
        });
    }

    adicionarItem(itemId) {
        // Integração com sistema de inventário
        const novoItem = { id: itemId, nome: itemId.replace('-', ' '), quantidade: 1 };
        this.inventarioJogador.push(novoItem);
        localStorage.setItem('inventario', JSON.stringify(this.inventarioJogador));
    }

    salvarEnergia() {
        localStorage.setItem('energia', this.energiaJogador.toString());
    }

    iniciarTeste(atributo, dificuldade, secaoSucesso) {
        this.testeAtual = { atributo, dificuldade, secaoSucesso };
        
        document.getElementById('atributo-teste').textContent = atributo;
        document.getElementById('dificuldade-teste').textContent = dificuldade;
        document.getElementById('modal-teste').classList.remove('oculto');
        document.getElementById('resultado-teste').classList.add('oculto');
    }

    rolarDados() {
        const valorAtributo = this.atributosJogador[this.testeAtual.atributo];
        const dadoRolado = Math.floor(Math.random() * 20) + 1;
        const total = valorAtributo + dadoRolado;
        
        const sucesso = total >= this.testeAtual.dificuldade;
        
        document.getElementById('valor-rolado').textContent = `${dadoRolado} + ${valorAtributo} = ${total}`;
        document.getElementById('status-teste').textContent = sucesso ? 'SUCESSO!' : 'FALHA!';
        document.getElementById('status-teste').className = sucesso ? 'sucesso' : 'falha';
        
        this.resultadoTeste = sucesso;
        document.getElementById('resultado-teste').classList.remove('oculto');
        document.getElementById('rolar-dados').style.display = 'none';
    }

    continuarAposTeste() {
        document.getElementById('modal-teste').classList.add('oculto');
        document.getElementById('rolar-dados').style.display = 'block';
        
        if (this.resultadoTeste) {
            this.mostrarSecao(this.testeAtual.secaoSucesso);
        } else {
            // Em caso de falha, pode ir para seção de falha ou perder energia
            this.energiaJogador -= 2;
            this.salvarEnergia();
            // Por simplicidade, volta para seção anterior ou mostra opções alternativas
            this.mostrarSecao(this.secaoAtual);
        }
    }

    voltarSelecao() {
        document.getElementById('narrativa-ativa').className = 'tela-oculta';
        document.getElementById('selecao-narrativas').className = 'tela-ativa';
        this.narrativaAtual = null;
    }
}

// Inicializar sistema quando página carregar
document.addEventListener('DOMContentLoaded', () => {
    new SistemaNarrativas();
});
