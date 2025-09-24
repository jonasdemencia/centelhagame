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
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.userId = user.uid;
                this.configurarEventListeners();
            } else {
                window.location.href = "index.html";
            }
        });
    }
    
    configurarEventListeners() {
        // Event listeners para seleção de narrativas
        document.querySelectorAll('.narrativa-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                const narrativaId = e.currentTarget.dataset.narrativa;
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
        
        // Definições dos itens das narrativas
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
            
            // Verifica se já existe no inventário
            const existeItem = chest.find(item => item.id === itemId);
            if (existeItem) {
                existeItem.quantity = (existeItem.quantity || 1) + 1;
            } else {
                // Cria item com propriedades completas
                const novoItem = {
                    id: itemId,
                    content: itemData.content,
                    uuid: crypto.randomUUID(),
                    quantity: 1,
                    description: itemData.description,
                    image: `https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/${itemId}.png`,
                    thumbnailImage: `https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thu${itemId}.png`
                };
                
                // Adiciona propriedades específicas se existirem
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
            
            // Atualiza dados locais
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
            
            // Atualiza dados locais
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
                    // Reduz quantidade
                    chest[itemIndex].quantity -= 1;
                } else {
                    // Remove item completamente
                    chest.splice(itemIndex, 1);
                }
                
                await updateDoc(playerDocRef, {
                    "inventory.itemsInChest": chest
                });
                
                // Atualiza dados locais
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
        let valorAtributo = 10; // valor padrão
        
        // Mapeia nomes de atributos para os campos do Firestore
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
            // Em caso de falha, perde energia
            await this.modificarEnergia(-2);
            this.mostrarSecao(this.secaoAtual);
        }
    }
async processarOpcao(opcao) {
    // Consome item se necessário
    if (opcao.requer) {
        await this.consumirItem(opcao.requer);
    }
    
    if (opcao.batalha) {
    // Salva destinos de vitória/derrota
    sessionStorage.setItem('narrativa-vitoria', opcao.vitoria);
    sessionStorage.setItem('narrativa-derrota', opcao.derrota);
    window.location.href = `batalha.html?monstros=${opcao.batalha}`;
    } else if (opcao.teste) {
        this.iniciarTeste(opcao.teste, opcao.dificuldade, opcao.secao);
    } else {
        await this.mostrarSecao(opcao.secao);
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


