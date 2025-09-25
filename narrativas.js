// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

class SistemaNarrativas {
    constructor() {
        this.narrativaAtual = null;
        this.secaoAtual = 1;
        this.playerData = null;
        this.userId = null;
        this.inicializar();
    }

    inicializar() {
        // Verifica autenticação
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.userId = user.uid;
                await this.configurarEventListeners();
            } else {
                window.location.href = "index.html";
            }
        });
    }

    async configurarEventListeners() {
        // Verifica se há progresso salvo
        await this.verificarProgressoSalvo();

        // Event listeners para seleção de narrativas
        document.querySelectorAll('.narrativa-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                const narrativaId = e.currentTarget.dataset.narrativa;

                // Verifica se aventura foi completada
                const playerDocRef = doc(db, "players", this.userId);
                const docSnap = await getDoc(playerDocRef);
                if (docSnap.exists()) {
                    // AJUSTE 1: VERIFICA O PROGRESSO DA NARRATIVA ESPECÍFICA
                    const allProgress = docSnap.data().narrativeProgress;
                    if (allProgress && allProgress[narrativaId] && allProgress[narrativaId].completed) {
                        alert("Você já completou esta aventura!");
                        return;
                    }
                }

                await this.iniciarNarrativa(narrativaId);
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

    async carregarDadosJogador() {
        if (!this.userId) return;
        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);
        if (docSnap.exists()) {
            this.playerData = docSnap.data();
            console.log('Dados do jogador carregados:', this.playerData);
        } else {
            console.log('Nenhum dado do jogador encontrado');
        }
    }

    async iniciarNarrativa(narrativaId) {
        await this.carregarDadosJogador();
        this.narrativaAtual = NARRATIVAS[narrativaId];
        this.secaoAtual = 1;
        document.getElementById('selecao-narrativas').className = 'tela-oculta';
        document.getElementById('narrativa-ativa').className = 'tela-ativa';
        document.getElementById('titulo-narrativa').textContent = this.narrativaAtual.titulo;
        this.mostrarSecao(1);
    }

    async mostrarSecao(numeroSecao) {
        const secao = this.narrativaAtual.secoes[numeroSecao];
        if (!secao) return;
        this.secaoAtual = numeroSecao;

        // Salva progresso no Firestore
        await this.salvarProgresso(numeroSecao, secao.final);

        // Aplicar efeitos da seção
        if (secao.efeitos) {
            await this.aplicarEfeitos(secao.efeitos);
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
                this.processarOpcao(opcao);
            });
            container.appendChild(btn);
        });
    }

    temItem(itemId) {
        if (!this.playerData?.inventory?.itemsInChest) {
            console.log('Inventário não encontrado ou vazio');
            return false;
        }
        const temItem = this.playerData.inventory.itemsInChest.some(item => {
            return item.id === itemId && (item.quantity || 1) > 0;
        });
        console.log(`Item '${itemId}': ${temItem ? 'POSSUI' : 'NÃO POSSUI'}`);
        return temItem;
    }

    async aplicarEfeitos(efeitos) {
        for (const efeito of efeitos) {
            switch (efeito.tipo) {
                case 'energia':
                    await this.modificarEnergia(efeito.valor);
                    break;
                case 'item':
                    await this.adicionarItem(efeito.item);
                    break;
            }
        }
    }

    async adicionarItem(itemId) {
        if (!this.userId) return;

        const itensNarrativas = {
            'chave-runica': { content: 'Chave Rúnica', description: 'Chave de prata com runas brilhantes' },
            'amuleto-proteção': { content: 'Amuleto de Proteção', description: 'Amuleto que pulsa com energia mágica', slot: 'amulet', defense: 1 },
            'anel-aquático': { content: 'Anel Aquático', description: 'Anel mágico encontrado nas águas', slot: 'ring', bonuses: { magic: 2 } },
            'chave-dourada': { content: 'Chave Dourada', description: 'Pequena chave dourada dada pelo lobo' },
            'tesouro-lobo': { content: 'Tesouro do Lobo', description: 'Tesouro encontrado com a ajuda do lobo' },
            'conhecimento-antigo': { content: 'Conhecimento Antigo', description: 'Sabedoria ancestral do círculo de pedras' },
            'pergaminho-sabedoria': { content: 'Pergaminho da Sabedoria', description: 'Pergaminho com segredos da torre' },
            'cristal-luminoso': { content: 'Cristal Luminoso', description: 'Cristal que brilha com luz azulada' },
            'pepitas-ouro': { content: 'Pepitas de Ouro', description: 'Pequenas pepitas de ouro da mina' },
            'tesouro-principal': { content: 'Tesouro Principal', description: 'O grande tesouro das cavernas perdidas' },
            'corda': { content: 'Corda', description: 'Corda resistente para escaladas' },
            'ração': { content: 'Ração', description: 'Comida para viagem', consumable: true, effect: 'heal', value: 2 },
            'tocha': { content: 'Tocha', description: 'Bastão de madeira envolto em trapos embebidos em óleo', consumable: true }
        };

        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const playerData = docSnap.data();
            const inventory = playerData.inventory || {};
            const chest = inventory.itemsInChest || [];
            const itemData = itensNarrativas[itemId];

            if (!itemData) {
                console.error(`Item '${itemId}' não encontrado nas narrativas`);
                return;
            }

            const existeItem = chest.find(item => item.id === itemId);
            if (existeItem) {
                existeItem.quantity = (existeItem.quantity || 1) + 1;
            } else {
                const novoItem = {
                    id: itemId,
                    content: itemData.content,
                    uuid: crypto.randomUUID(),
                    quantity: 1,
                    description: itemData.description,
                    image: `https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/${itemId}.png`,
                    thumbnailImage: `https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thu${itemId}.png`
                };
                if (itemData.slot) novoItem.slot = itemData.slot;
                if (itemData.defense) novoItem.defense = itemData.defense;
                if (itemData.bonuses) novoItem.bonuses = itemData.bonuses;
                if (itemData.consumable) {
                    novoItem.consumable = true;
                    if (itemData.effect) novoItem.effect = itemData.effect;
                    if (itemData.value) novoItem.value = itemData.value;
                }
                chest.push(novoItem);
            }

            await updateDoc(playerDocRef, {
                "inventory.itemsInChest": chest
            });

            this.playerData.inventory.itemsInChest = chest;
            console.log('Item adicionado:', itemId, 'Inventário atual:', chest);
        }
    }

    async modificarEnergia(valor) {
        if (!this.userId) return;
        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);
        if (docSnap.exists()) {
            const playerData = docSnap.data();
            const energiaAtual = playerData.energy?.total || 20;
            const novaEnergia = Math.max(0, energiaAtual + valor);
            await updateDoc(playerDocRef, {
                "energy.total": novaEnergia
            });
            this.playerData.energy.total = novaEnergia;
            console.log('Energia modificada:', valor, 'Nova energia:', novaEnergia);
        }
    }

    async consumirItem(itemId) {
        if (!this.userId) return;
        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);
        if (docSnap.exists()) {
            const playerData = docSnap.data();
            const inventory = playerData.inventory || {};
            const chest = inventory.itemsInChest || [];
            const itemIndex = chest.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                const item = chest[itemIndex];
                if (item.quantity > 1) {
                    chest[itemIndex].quantity -= 1;
                } else {
                    chest.splice(itemIndex, 1);
                }
                await updateDoc(playerDocRef, {
                    "inventory.itemsInChest": chest
                });
                this.playerData.inventory.itemsInChest = chest;
                console.log('Item consumido:', itemId, 'Inventário atualizado:', chest);
            }
        }
    }

    iniciarTeste(atributo, dificuldade, secaoSucesso) {
        this.testeAtual = { atributo, dificuldade, secaoSucesso };
        document.getElementById('atributo-teste').textContent = atributo;
        document.getElementById('dificuldade-teste').textContent = dificuldade;
        document.getElementById('modal-teste').classList.remove('oculto');
        document.getElementById('resultado-teste').classList.add('oculto');
    }

    rolarDados() {
        const atributoNome = this.testeAtual.atributo;
        let valorAtributo = 10;
        const mapeamentoAtributos = {
            'magia': 'magic',
            'carisma': 'charisma',
            'habilidade': 'skill',
            'sorte': 'luck'
        };
        const campoFirestore = mapeamentoAtributos[atributoNome] || atributoNome;
        if (this.playerData && this.playerData[campoFirestore]?.total) {
            valorAtributo = this.playerData[campoFirestore].total;
        }
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

    async continuarAposTeste() {
        document.getElementById('modal-teste').classList.add('oculto');
        document.getElementById('rolar-dados').style.display = 'block';
        if (this.resultadoTeste) {
            this.mostrarSecao(this.testeAtual.secaoSucesso);
        } else {
            await this.modificarEnergia(-2);
            this.mostrarSecao(this.secaoAtual);
        }
    }

    async verificarProgressoSalvo() {
        if (!this.userId) return;

        const urlParams = new URLSearchParams(window.location.search);
        const secaoUrl = urlParams.get('secao');

        if (secaoUrl) {
            for (const [narrativaId, narrativa] of Object.entries(NARRATIVAS)) {
                if (narrativa.secoes[secaoUrl]) {
                    await this.iniciarNarrativa(narrativaId);
                    await this.mostrarSecao(parseInt(secaoUrl));
                    return;
                }
            }
        }

        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const allProgress = docSnap.data().narrativeProgress;
            if (allProgress) {
                const inProgressNarrativeId = Object.keys(allProgress).find(
                    id => allProgress[id] && !allProgress[id].completed
                );

                if (inProgressNarrativeId) {
                    const progress = {
                        ...allProgress[inProgressNarrativeId],
                        narrativeId: inProgressNarrativeId
                    };
                    this.mostrarOpcaoContinuar(progress);
                }
            }
        }
    }

    mostrarAventuraCompleta() {
        const container = document.getElementById('selecao-narrativas');
        const completeDiv = document.createElement('div');
        completeDiv.style.cssText = 'text-align: center; margin: 20px; padding: 20px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 10px; color: #155724;';
        completeDiv.innerHTML = `
            <h3>🎉 Aventura Completada!</h3>
            <p>Você já completou esta aventura com sucesso!</p>
            <button id="new-adventure" style="background: #28a745; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer;">Escolher Nova Aventura</button>
        `;
        container.insertBefore(completeDiv, container.firstChild);
        document.getElementById('new-adventure').addEventListener('click', async () => {
            await this.limparProgresso();
            completeDiv.remove();
        });
    }

    mostrarOpcaoContinuar(progress) {
        const container = document.getElementById('selecao-narrativas');
        const continueDiv = document.createElement('div');
        continueDiv.style.cssText = 'text-align: center; margin: 20px; padding: 20px; background: #f0f0f0; border-radius: 10px;';
        continueDiv.innerHTML = `
            <h3>Aventura em Progresso</h3>
            <p>Você tem uma aventura em andamento na seção ${progress.currentSection}</p>
            <button id="continue-saved" style="background: #4CAF50; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer;">Continuar</button>
            <button id="new-adventure" style="background: #f44336; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer;">Nova Aventura</button>
        `;
        container.insertBefore(continueDiv, container.firstChild);
        document.getElementById('continue-saved').addEventListener('click', async () => {
            await this.iniciarNarrativa(progress.narrativeId);
            await this.mostrarSecao(progress.currentSection);
            continueDiv.remove();
        });
        document.getElementById('new-adventure').addEventListener('click', async () => {
            await this.limparProgresso();
            continueDiv.remove();
        });
    }

    async limparProgresso() {
        if (!this.userId) return;
        const playerDocRef = doc(db, "players", this.userId);
        await updateDoc(playerDocRef, {
            "narrativeProgress": null
        });
    }

    // AJUSTE 2: SALVA O PROGRESSO DENTRO DE UM OBJETO DA NARRATIVA
    async salvarProgresso(numeroSecao, isFinal = false) {
        if (!this.userId || !this.narrativaAtual) return;

        const playerDocRef = doc(db, "players", this.userId);
        const narrativeId = Object.keys(NARRATIVAS).find(key => NARRATIVAS[key] === this.narrativaAtual);

        const progressData = {
            lastUpdated: new Date().toISOString()
        };

        if (isFinal) {
            console.log('SALVANDO AVENTURA COMO COMPLETADA:', numeroSecao);
            progressData.completed = true;
            progressData.currentSection = numeroSecao;
        } else {
            progressData.completed = false;
            progressData.currentSection = numeroSecao;
        }

        await setDoc(playerDocRef, {
            narrativeProgress: {
                [narrativeId]: progressData
            }
        }, { merge: true });
    }

    async processarOpcao(opcao) {
        if (opcao.requer) {
            await this.consumirItem(opcao.requer);
        }
        if (opcao.batalha) {
            const playerDocRef = doc(db, "players", this.userId);
            await updateDoc(playerDocRef, {
                "narrativeProgress.battleReturn": {
                    vitoria: opcao.vitoria,
                    derrota: opcao.derrota,
                    active: true
                }
            });
            window.location.href = `batalha.html?monstros=${opcao.batalha}`;
        } else if (opcao.teste) {
            this.iniciarTeste(opcao.teste, opcao.dificuldade, opcao.secao);
        } else {
            await this.mostrarSecao(opcao.secao);
        }
    }

    async voltarSelecao() {
        document.getElementById('narrativa-ativa').className = 'tela-oculta';
        document.getElementById('selecao-narrativas').className = 'tela-ativa';
        this.narrativaAtual = null;
    }
}

window.createContinueAdventureButton = async function(db, userId) {
    try {
        const playerDocRef = doc(db, "players", userId);
        const docSnap = await getDoc(playerDocRef);
        if (!docSnap.exists()) return false;
        const playerData = docSnap.data();
        const battleReturn = playerData.narrativeProgress?.battleReturn;
        if (!battleReturn || !battleReturn.active) return false;
        const button = document.createElement('button');
        button.textContent = 'Continuar Aventura';
        button.style.cssText = 'background: #4CAF50; color: white; padding: 10px 20px; margin: 10px; border: none; border-radius: 5px; cursor: pointer;';
        button.addEventListener('click', async () => {
            const targetSection = battleReturn.vitoria;
            await updateDoc(playerDocRef, {
                "narrativeProgress.currentSection": targetSection,
                "narrativeProgress.battleReturn.active": false
            });
            window.location.href = `narrativas.html?secao=${targetSection}`;
        });
        const lootButton = document.getElementById('loot-button');
        if (lootButton && lootButton.parentNode) {
            lootButton.parentNode.insertBefore(button, lootButton.nextSibling);
        }
        return true;
    } catch (error) {
        console.error('Erro ao criar botão:', error);
        return false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new SistemaNarrativas();
});
