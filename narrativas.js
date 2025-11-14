// Importa NARRATIVAS do arquivo de dados
import { NARRATIVAS } from './narrativas-data.js';
import { Visao3D } from './visao3d.js';
import { SistemaEmergencia } from './emergencia.js';

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
        this.itemPendente = null;
        this.visao3d = null;
        this.secaoEmergentePai = null;
        this.contadorSecoesParaEmergencia = 0;
        this.ultimaEscolhaFeita = null; // Para rastreamento de padrões
        this.statsOcultos = {}; // Vamos manter isso vazio por enquanto, mas o código futuro pode precisar

        // IMPORTANTE: Definir itensNarrativas ANTES de criar SistemaEmergencia
        this.itensNarrativas = {
            // === ARMAS DE FOGO ===
            "ak-47": { id: "ak-47", content: "AK 47", uuid: "extra-ak-47", slot: "weapon", large: true, twoHanded: true, description: "Fuzil de assalto da União Soviética. Fabricada em 1945.", damage: "2d10", ammoType: "municao-762", ammoCapacity: 30, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/ak-47.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuak-47.png" },
            "amt-502d": { id: "amt-502d", content: "AMT-502D", uuid: "extra-amt-502d", slot: "weapon", description: "Protótipo fabricado supostamente em 2032(?), calíbre 50, 2 gatilhos.", damage: "3d12", ammoType: "municao-50", ammoCapacity: 14, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amt-502d.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamt-502d.png" },
            "beretta-92": { id: "beretta-92", content: "Beretta 92", uuid: "extra-beretta-92", slot: "weapon", description: "Pistola semiautomática italiana. Fabricada em 1972.", damage: "1d8", ammoType: "municao-9mm", ammoCapacity: 10, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/beretta-92.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuberetta-92.png" },
            "colt1848": { id: "colt1848", content: "Colt 1848", uuid: "extra-colt1848", slot: "weapon", description: "Calíbre 45.", damage: "1d10", ammoType: "municao-45", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/colt1848.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucolt1848.png" },
            "colt-python": { id: "colt-python", content: "Colt Python", uuid: "extra-colt-python", slot: "weapon", description: "Modelo topo de linha da Colt. Fabricada em 1955.", damage: "1d10", ammoType: "municao-357", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/colt-python.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucolt-python.png" },
            "desert-eagle": { id: "desert-eagle", content: "Desert Eagle", uuid: "extra-desert-eagle", slot: "weapon", description: "Semiautomática, calíbre 50.", damage: "1d12", ammoType: "municao-50", ammoCapacity: 8, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/desert-eagle.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thudesert-eagle.png" },
            "escopeta-12": { id: "escopeta-12", content: "Escopeta 12", uuid: "extra-escopeta12", large: true, twoHanded: true, slot: "weapon", description: "Uma espingarda calibre 12.", damage: "1d12+2", ammoType: "municao-12", ammoCapacity: 5, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/escopeta-12.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuescopeta-12.png" },
            "hekg11": { id: "hekg11", content: "H&K G11", uuid: "extra-hekg11", slot: "weapon", large: true, twoHanded: true, description: "Fuzil protótipo raro. Fabricada em 1960.", damage: "2d18", ammoType: "municao-473", ammoCapacity: 50, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/hekg11.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuhekg11.png" },
            "lugerp08": { id: "lugerp08", content: "Luger P08", uuid: "extra-lugerp08", slot: "weapon", description: "Pistola 9mm rara, fabricada para a guerra.", damage: "1d8", ammoType: "municao-9mm", ammoCapacity: 8, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/lugerp08.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thulugerp08.png" },
            "revolver-38": { id: "revolver-38", content: "Revolver 38", uuid: "extra-revolver38", slot: "weapon", description: "Calibre 38.", damage: "1d8", ammoType: "municao-38", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/revolver-38.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thurevolver-38.png" },

            // === ARMAS BRANCAS ===
            "Adaga": { id: "Adaga", content: "Adaga", uuid: "extra-adaga", slot: "weapon", description: "Um punhal afiado.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/adaga.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuadaga.png" },
            "canivete": { id: "canivete", content: "Canivete", uuid: "extra-canivete", slot: "weapon", description: "Uma pequena lâmina afiada.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/canivete.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucanivete.png" },
            "clava-grande": { id: "clava-grande", content: "Clava Grande", uuid: "extra-clava-grande", large: true, twoHanded: true, slot: "weapon", description: "Clava para matar monstros. 8kg.", damage: "1D10", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/clava-grande.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuclava-grande.png" },
            "espada-duas-maos": { id: "espada-duas-maos", content: "Espada de Duas Mãos", uuid: "extra-espada-duas-maos", large: true, slot: "weapon", twoHanded: true, description: "Espada pesada que requer ambas as mãos para uso.", damage: "2D6", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/espada-duas-maos.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuespada-duas-maos.png" },
            "espadaexecutora": { id: "espadaexecutora", content: "Executora", uuid: "extra-espadaexecutora", large: true, slot: "weapon", twoHanded: true, description: "Instrumento de ferro com ponta quadrada. Preferência de alguns algozes.", damage: "2D6+1", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/espadaexecutora.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuespadaexecutora.png" },
            "espadalonga": { id: "espadalonga", content: "Espada Longa", uuid: "extra-espadalonga", slot: "weapon", description: "Usada para degolar infiéis.", damage: "1D8", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/espadalonga.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuespadalonga.png" },
            "marreta": { id: "marreta", content: "Marreta", uuid: "extra-marreta", slot: "weapon", description: "Martelo de forja. 10kg.", damage: "1D10", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/marreta.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumarreta.png" },
            "martelodeguerra": { id: "martelodeguerra", content: "Martelo de Guerra", uuid: "extra-martelodeguerra", slot: "weapon", description: "10kg, projetados para destruir ossos.", damage: "1D8", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/martelodeguerra.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumartelodeguerra.png" },
            "motoserra": { id: "motoserra", content: "motoserra", uuid: "extra-motoserra", large: true, twoHanded: true, slot: "weapon", description: "Serra acionada por motor, utilizada no corte de árvores.. e monstros.", damage: "3d6", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/motoserra.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumotoserra.png" },
            "punhal-ceremonial": { id: "punhal-ceremonial", content: "Punhal Ceremonial", uuid: "extra-punhal-ceremonial", slot: "weapon", description: "Punhal usado para sacrifícios.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/punhal-ceremonial.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupunhal-ceremonial.png" },

            // === AMULETOS ===
            "amuletodaarmaduranatual": { id: "amuletodaarmaduranatual", content: "Amuleto da Armadura Natural", uuid: "extra-amuletodaarmaduranatural", slot: "amulet", description: "Colar mágico contra sugadores.", bonuses: { couraca: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amuletodaarmaduranatural.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamuletodaarmaduranatural.png" },
            "amuletodaserpentedourada": { id: "amuletodaserpentedourada", content: "Amuleto da Serpente Dourada", uuid: "extra-amuletodaserpentedourada", slot: "amulet", description: "Aumenta a energia vital.", bonuses: { energy: 5 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amuletodaserpentedourada.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamuletodaserpentedourada.png" },

            // === ANÉIS ===
            "aneldafe": { id: "aneldafe", content: "Anel da Fé", uuid: "extra-anel-da-fé", slot: "ring", description: "Relíquia sagrada de um santo desconhecido.", bonuses: { couraca: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/aneldafe.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuaneldafe.png" },

            // === ARMADURAS ===
            "armaduradecouro": { id: "armaduradecouro", content: "Armadura de Couro", uuid: "extra-armaduradecouro", slot: "armor", description: "Armadura leve, para manobras artistícas.", defense: 2, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/armaduradecouro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuarmaduradecouro.png" },
            "habito-monastico": { id: "habito-monastico", content: "Hábito Monástico", uuid: "extra-habito-monastico", slot: "armor", description: "Túnica de burel com forro reforçado, para monges viajantes.", defense: 1, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/habito-monastico.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuhabito-monastico.png" },
            "peitoral-de-aço": { id: "peitoral-de-aço", content: "Peitoral de aço", uuid: "extra-peitoral-de-aço", slot: "armor", description: "Armadura média, de peso considerável.", defense: 5, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/peitoral-de-aço.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupeitoral-de-aço.png" },

            // === ESCUDOS ===
            "escudo-pequeno-de-madeira": { id: "escudo-pequeno-de-madeira", content: "Escudo pequeno de madeira", uuid: "extra-escudo-pequeno-de-madeira", slot: "shield", description: "Escudo leve, feito de cedro.", defense: 1, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/escudopequenodemadeira.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuescudopequenodemadeira.png" },
            "escudograndedemetal": { id: "escudograndedemetal", content: "Escudo Grande de Metal", uuid: "extra-escudograndedemetal", slot: "shield", description: "Escudo robusto, feito de ferro.", defense: 2, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/escudograndedemetal.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuescudograndedemetal.png" },

            // === CAPACETES ===
            "mascara-de-gas": { id: "mascara-de-gas", content: "Máscara de Gás", uuid: "extra-mascara-de-gas", slot: "helmet", defense: 1, description: "Modelo soviético, filtro cilíndrico frontal. Da segunda guerra.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/mascara-de-gas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumascara-de-gas.png" },

            // === MUNIÇÕES ===
            "municao-12": { id: "municao-12", content: "Munição de 12.", uuid: "extra-municao12", quantity: 10, projectile: true, description: "Projéteis letais calíbre 12.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-12.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-12.png" },
            "municao-38": { id: "municao-38", content: "Munição de 38.", uuid: "extra-municao38", quantity: 20, projectile: true, description: "Projéteis letais calíbre 38.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-38.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-38.png" },
            "municao-45": { id: "municao-45", content: "Munição de 45", uuid: "extra-municao-45", quantity: 25, projectile: true, description: "Projéteis letais calíbre 45.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-45.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-45.png" },
            "municao-50": { id: "municao-50", content: "Munição de 50AE", uuid: "extra-municao-50", quantity: 20, projectile: true, description: "Projéteis letais calíbre 50AE.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-50.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-50.png" },
            "municao-357": { id: "municao-357", content: "Munição de 357", uuid: "extra-municao-357", quantity: 20, projectile: true, description: "Projéteis letais calíbre 357.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-357.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-357.png" },
            "municao-473": { id: "municao-473", content: "Munição 473", uuid: "extra-municao-473", quantity: 20, projectile: true, description: "Projéteis letais calíbre 4,73.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-473.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-473.png" },
            "municao-762": { id: "municao-762", content: "Munição 7,62", uuid: "extra-municao-762", quantity: 20, projectile: true, description: "Projéteis letais calíbre 7,62.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-762.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-762.png" },
            "municao-9mm": { id: "municao-9mm", content: "Munição de 9mm", uuid: "extra-municao9mm", quantity: 10, projectile: true, description: "Projéteis letais calíbre 9mm.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-9mm.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-9mm.png" },

            // === CONSUMÍVEIS ===
            "bolsa-de-escriba": { id: "bolsa-de-escriba", content: "Bolsa de escriba", uuid: "extra-bolsa-de-escriba", consumable: true, quantity: 1, effect: "expand_inventory", value: 2, description: "Bolsa para guardar pergaminhos e penas.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/bolsa-de-escriba.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thubolsa-de-escriba.png" },
            "granada-de-concussao": { id: "granada-de-concussao", stackable: true, content: "Granada de Concussão", uuid: "extra-granada-de-concussao", consumable: true, quantity: 3, effect: "stun", damage: "3D4", description: "Explosivo de concussão de área (raio 2).", areaEffect: true, areaRadius: 2, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-de-concussao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-de-concussao.png" },
            "granada-incendiaria": { id: "granada-incendiaria", stackable: true, content: "Granada Incendiária", uuid: "extra-granada-incendiaria", consumable: true, quantity: 3, effect: "explosion", damage: "2D6", description: "Explosivo incendiário de área (raio 3).", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-incendiaria.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-incendiaria.png" },
            "granada-mao": { id: "granada-mao", stackable: true, content: "Granada de Mão", uuid: "extra-granada-mao", consumable: true, quantity: 3, effect: "explosion", damage: "3D8", description: "Explosivo portátil de área (raio 3).", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-mao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-mao.png" },
            "kitmedico": { id: "kitmedico", content: "Kit Médico", stackable: true,  consumable: true, uuid: "extra-kitmedico", quantity: 2, effect: "heal", value: 5, description: "Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/kitmedico.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thukitmedico.png" },
            "latadesardinha": { id: "latadesardinha", content: "Lata de Sardinha", stackable: true, consumable: true, uuid: "extra-latadesardinha", quantity: 2, effect: "heal", value: 4, description: "Iguaria do mar. Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/latadesardinha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thulatadesardinha.png" },
            "pao-mofado": { id: "pao-mofado", content: "Pão Mofado", uuid: "extra-pao-mofado", stackable: true, consumable: true, quantity: 3, effect: "damage", value: 5, description: "Pedaço de pão velho e mofado.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pao-mofado.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupao-mofado.png" },
            "pequeno-saco-ervas": { id: "pequeno-saco-ervas", stackable: true, content: "Pequeno saco com ervas medicinais", consumable: true, uuid: "extra-pequeno-saco-ervas", quantity: 5, effect: "heal", value: 1, description: "Plantas capazes de curar feridas leves.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pequeno-saco-ervas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupequeno-saco-ervas.png" },
            "pocao-cura-completa": { id: "pocao-cura-completa", stackable: true, content: "Poção de Cura Completa", consumable: true, uuid: "extra-pocao-cura-completa", quantity: 10, effect: "heal", value: 150, description: "Restaura uma massiva quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pocao-cura-completa.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupocao-cura-completa.png" },
            "pocao-cura-menor": { id: "pocao-cura-menor", stackable: true, content: "Poção de Cura Menor", consumable: true, uuid: "extra-pocao-cura-menor", quantity: 2, effect: "heal", value: 3, description: "Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pocao-cura-menor.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupocao-cura-menor.png" },
            "tocha": { id: "tocha", content: "Tocha", uuid: "extra-tocha", stackable: true, consumable: true, quantity: 3, description: "Bastão de madeira envolto em trapos embebidos em óleo.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/tocha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thutocha.png" },

            // === COMPONENTES ===
            "grilo": { id: "grilo", content: "Grilo", uuid: "extra-grilo", description: "Um pequeno inseto saltitante.", componente: true, energia: { total: 1, inicial: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/grilo.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugrilo.png" },
            "la": { id: "la", content: "Lã", stackable: true, uuid: "extra-la", description: "Componente mágico para magias de atordoamento.", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/la.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thula.png" },
            "pedaco-couro": { id: "pedaco-couro", stackable: true, content: "Pedaço de couro", uuid: "extra-pedaco-couro", description: "Tira endurecida para magias.", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pedaco-couro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupedaco-couro.png" },
            "velas": { id: "velas", content: "Velas", stackable: true, description: "Fontes de luz portáteis.", uuid: "extra-velas", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/velas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuvelas.png" },

            // === TESOUROS E RELÍQUIAS ===
            "calicereliquia": { id: "calicereliquia", content: "Calíce Relíquia", uuid: "extra-calicereliquia", description: "O gênio de Granul um dia bebeu nela. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/calicereliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucalicereliquia.png" },
            "coroareliquia": { id: "coroareliquia", content: "Coroa Relíquia", uuid: "extra-coroareliquia", description: "Uma dinastia de reis loucos a usou. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/coroareliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucoroareliquia.png" },
            "estatuetaareliquia": { id: "estatuetaareliquia", content: "Estatueta A. Relíquia", uuid: "extra-estatuetaareliquia", description: "Um deus humanoide feito de bronze. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/estatuetaareliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuestatuetaareliquia.png" },
            "estatuetabreliquia": { id: "estatuetabreliquia", content: "Estatueta B. Relíquia", uuid: "extra-estatuetabreliquia", description: "Um deus humanoide feito de bronze. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/estatuetabreliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuestatuetabreliquia.png" },
            "estatuetacreliquia": { id: "estatuetacreliquia", content: "Estatueta C. Relíquia", uuid: "extra-estatuetacreliquia", description: "Um deus feito de marfim. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/estatuetacreliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuestatuetacreliquia.png" },
            "pequenabolsaouro": { id: "pequenabolsaouro", content: "Pequena Bolsa de Ouro", uuid: "extra-pequenabolsaouro", stackable: false, consumable: true, description: "Uma quantia modesta de Dracmas.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pequenabolsaouro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupequenabolsaouro.png" },

            // === UTILITÁRIOS ===
            "corda": { id: "corda", content: "Corda", uuid: "extra-corda", description: "Corda resistente para escaladas.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/corda.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucorda.png" },
            "esqueiro": { id: "esqueiro", content: "Esqueiro", uuid: "extra-esqueiro", description: "Produz chama contínua.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/esqueiro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuesqueiro.png" },
        };

        // AGORA criar SistemaEmergencia com itensNarrativas já definido
        this.sistemaEmergencia = new SistemaEmergencia(this.itensNarrativas);

        this.inicializar();
    }

    inicializar() {
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
        await this.verificarProgressoSalvo();

        document.querySelectorAll('.narrativa-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                const narrativaId = e.currentTarget.dataset.narrativa;
                const playerDocRef = doc(db, "players", this.userId);
                const docSnap = await getDoc(playerDocRef);
                if (docSnap.exists()) {
                    const allProgress = docSnap.data().narrativeProgress;
                    if (allProgress && allProgress[narrativaId] && allProgress[narrativaId].completed) {
                        alert("Você já completou esta aventura!");
                        return;
                    }
                }
                await this.iniciarNarrativa(narrativaId);
            });
        });

        document.getElementById('voltar-selecao').addEventListener('click', () => {
            this.voltarSelecao();
        });

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
        
        // 🆕 INICIALIZA OS OBJETOS DE ESTADO CORRETAMENTE
        if (!this.playerData.worldState) {
            this.playerData.worldState = {};
        }
        if (!this.playerData.patches) {
            this.playerData.patches = {};
        }
        
        console.log('Dados do jogador carregados:', this.playerData);
        console.log('[PATCH] WorldState:', this.playerData.worldState);
        console.log('[PATCH] Patches:', this.playerData.patches);
    } else {
        console.log('Nenhum dado do jogador encontrado');
    }
}
    async iniciarNarrativa(narrativaId) {
        await this.carregarDadosJogador();
        this.narrativaAtual = NARRATIVAS[narrativaId];
        this.secaoAtual = 1;
        this.sistemaEmergencia.resetar();
        document.getElementById('selecao-narrativas').className = 'tela-oculta';
        document.getElementById('narrativa-ativa').className = 'tela-ativa';
        document.getElementById('titulo-narrativa').textContent = this.narrativaAtual.titulo;

        document.getElementById('abrir-inventario-btn').onclick = () => {
            this.abrirInventarioSemItem();
        };

        if (!this.visao3d) {
            this.visao3d = new Visao3D('canvas-container');
        }

        document.addEventListener('opcaoClicada3D', (e) => {
            this.processarOpcao(e.detail);
        });

        this.mostrarSecao(1);
    }

    // =======================================================================
    // === INÍCIO DO NOVO MÉTODO (aplicarPatchPersistente) ===
    // =======================================================================
    aplicarPatchPersistente(numeroSecao, secaoOriginal) {
        // 1. Verifica se this.playerData e patches existem
        if (!this.playerData || !this.playerData.patches) {
            return secaoOriginal;
        }

        // 2. Tenta encontrar um patch para esta seção
        const patch = this.playerData.patches[numeroSecao];

        // 3. Se não houver patch, retorna a seção original intacta
        if (!patch) {
            return secaoOriginal;
        }

        console.log(`[PATCH] Aplicando patch persistente salvo na Seção ${numeroSecao}`);

        // 4. Clona a seção original para não modificar o NARRATIVAS-DATA
        const secaoModificada = JSON.parse(JSON.stringify(secaoOriginal));

        // 5. Aplica as novas opções do patch
        if (patch.novas_opcoes && Array.isArray(patch.novas_opcoes)) {
            secaoModificada.opcoes.push(...patch.novas_opcoes);
        }

        // 6. Injeta as novas subseções na árvore da narrativa ATUAL
        // Isso as torna "reais" para esta sessão de jogo
        if (patch.novas_secoes && typeof patch.novas_secoes === 'object') {
            for (const [idSecaoNova, dadosSecaoNova] of Object.entries(patch.novas_secoes)) {
                // Adiciona verificando se já não existe (evita duplicação em recargas)
                if (!this.narrativaAtual.secoes[idSecaoNova]) {
                    this.narrativaAtual.secoes[idSecaoNova] = dadosSecaoNova;
                    console.log(`[PATCH] Subseção persistente "${idSecaoNova}" injetada.`);
                }
            }
        }
        
        // 7. Retorna a seção "remendada"
        return secaoModificada;
    }
    // =======================================================================
    // === FIM DO NOVO MÉTODO ===
    // =======================================================================

    async mostrarSecao(numeroSecao, secaoDeOrigem = null) {
        console.log(`[NARRATIVAS] mostrarSecao chamado com: ${numeroSecao}`);
    
        // ... (o bloco de checagem de morte permanece igual)
        if (this.playerData && this.playerData.energy && this.playerData.energy.total <= 0) {
            if (numeroSecao != 320 && numeroSecao != 99999) {
                console.log(`[MORTE] Energia <= 0 detectada. Forçando seção 320.`);
                numeroSecao = 320; 
                secaoDeOrigem = null; 
            }
        }
        
        let secao;

        if (typeof numeroSecao === 'string' && numeroSecao.startsWith('emergente_')) {
            // ... (lógica de buscar seção emergente)
            secao = this.sistemaEmergencia.secoesEmergentes.get(numeroSecao);
        } else if (typeof numeroSecao === 'string' && numeroSecao.startsWith('persistente_')) {
            // 🆕 LÓGICA PARA CARREGAR SEÇÕES DO PATCH (se já não foram injetadas)
            console.log(`[PATCH] Buscando seção persistente: ${numeroSecao}`);
            secao = this.narrativaAtual.secoes[numeroSecao];
        } else {
            // É uma seção do esqueleto (número)
            secao = this.narrativaAtual.secoes[numeroSecao];
            
            // 🆕 APLICA O PATCH ANTES DE CONTINUAR
            // Só aplica se os dados do jogador estiverem carregados
            if (this.playerData) {
                 secao = this.aplicarPatchPersistente(numeroSecao, secao);
            }
        }

        if (!secao) {
            console.error('Seção não encontrada:', numeroSecao);
            return;
        }

    this.secaoAtual = numeroSecao;

    // 🔹 ADICIONE LOG AQUI
    // Só incrementa se não for seção emergente
    if (typeof numeroSecao === 'number' || !numeroSecao.startsWith('emergente_')) {
        this.contadorSecoesParaEmergencia++;
        console.log(`[NARRATIVAS] 📊 Contador para emergência: ${this.contadorSecoesParaEmergencia}/6`);
    }

    const contextoAtual = this.sistemaEmergencia.analisarSecao(
        secao, 
        numeroSecao, 
        this.ultimaEscolhaFeita
    );
    const emergenciaHabilitada = this.narrativaAtual.emergenciaHabilitada !== false;

    const pontoDeRetorno = secaoDeOrigem || numeroSecao;

    // CÓDIGO CORRIGIDO
    const resultadoEmergencia = await this.sistemaEmergencia.verificarEAtivarEmergencia(
        this.contadorSecoesParaEmergencia,
        this.narrativaAtual.titulo,
        secao,
        pontoDeRetorno,
        emergenciaHabilitada
    );

    // 🔹 INÍCIO DA CORREÇÃO
    // Se a emergência FOI ATIVADA, reseta o contador e mostra a seção
    if (resultadoEmergencia && resultadoEmergencia.ativada) {
        console.log(`[NARRATIVAS] 🎯 EXIBINDO SEÇÃO DA IA: ${resultadoEmergencia.idSecao}`);
        this.contadorSecoesParaEmergencia = 0; // 🔹 RESET NO SUCESSO
        console.log(`[NARRATIVAS] 🔄 Contador resetado após ATIVAR emergência: ${this.contadorSecoesParaEmergencia}`);
        
        this.secaoEmergentePai = resultadoEmergencia.secao;

        const secaoAMostrar = resultadoEmergencia.secao;
        document.getElementById('numero-secao').textContent = `${numeroSecao} [EMERGÊNCIA]`;
        this.renderizarTextoComItens(secaoAMostrar);
        this.criarOpcoes(secaoAMostrar.opcoes, secaoAMostrar.final);

        if (secaoAMostrar.efeitos) {
            for (const efeito of secaoAMostrar.efeitos) {
                if (efeito.tipo === 'energia') {
                    await this.modificarEnergia(efeito.valor);
                }
            }
        }
        return;
    } 
    // Se a emergência DEVERIA TER SIDO ATIVADA (contador >= 4) mas FALHOU (API error, etc.)
    // E a emergência não está já ativa (garantia extra)
    else if (this.contadorSecoesParaEmergencia >= 6 && !this.sistemaEmergencia.emergenciaAtiva) {
        console.log(`[NARRATIVAS] ⚠️ Emergência falhou (API?) ou foi desativada. Resetando contador.`);
        this.contadorSecoesParaEmergencia = 0; // 🔹 RESET NA FALHA
        console.log(`[NARRATIVAS] 🔄 Contador resetado após FALHA na emergência: ${this.contadorSecoesParaEmergencia}`);
    }
   
    // 🔹 FIM DA MODIFICAÇÃO

    await this.salvarProgresso(numeroSecao, secao.final);

    if (secao.efeitos) {
        for (const efeito of secao.efeitos) {
            if (efeito.tipo === 'energia') {
                await this.modificarEnergia(efeito.valor);
            }
        }
    }

    document.getElementById('numero-secao').textContent = numeroSecao;
    this.renderizarTextoComItens(secao);

    if (secao.batalha && !secao.opcoes) {
        await this.processarBatalhaAutomatica(secao);
        return;
    }

    this.criarOpcoes(secao.opcoes, secao.final);
}

// 🔍 === ADIÇÃO DO MÉTODO DE DEBUG ===
    debugContadorEmergencia() {
        console.log('===== DEBUG EMERGÊNCIA =====');
        console.log('Contador atual:', this.contadorSecoesParaEmergencia);
        console.log('Emergência ativa:', this.sistemaEmergencia.emergenciaAtiva);
        console.log('Próxima emergência em:', 4 - this.contadorSecoesParaEmergencia, 'seções');
        console.log('============================');
    }
    // 🔍 === FIM DO MÉTODO DE DEBUG ===
    
    renderizarTextoComItens(secao) {
        const textoContainer = document.getElementById('texto-narrativa');
        let textoHTML = secao.texto;
        if (secao.efeitos) {
            secao.efeitos.forEach(efeito => {
                if (efeito.tipo === 'item') {
                    const itemNome = this.obterNomeItem(efeito.item);
                    textoHTML += `<span class="item-coletavel" data-item-id="${efeito.item}" style="color: #90EE90; cursor: pointer; text-decoration: underline;">${itemNome}</span>`;
                }
            });
        }
        textoContainer.innerHTML = textoHTML;

        textoContainer.querySelectorAll('.item-coletavel').forEach(span => {
            span.addEventListener('click', () => {
                const itemId = span.dataset.itemId;
                this.abrirInventarioComItem(itemId, span);
            });
        });
    }

    obterNomeItem(itemId) {
        return this.itensNarrativas[itemId]?.content || itemId;
    }

    async abrirInventarioComItem(itemId, spanElement) {
        const itemData = this.itensNarrativas[itemId];
        const slotsNecessarios = itemData.large ? 2 : 1;

        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const inventoryData = docSnap.data().inventory;
            const totalSlots = inventoryData.inventorySpaces || 50;
            const itemsInChest = inventoryData.itemsInChest || [];

            let slotsOcupados = 0;
            itemsInChest.forEach(item => {
                const itemInfo = this.itensNarrativas[item.id];
                slotsOcupados += itemInfo?.large ? 2 : 1;
            });

            const slotsDisponiveis = totalSlots - slotsOcupados;

            if (slotsDisponiveis < slotsNecessarios) {
                const textoContainer = document.getElementById('texto-narrativa');
                const mensagem = document.createElement('p');
                mensagem.textContent = 'Você não tem espaço suficiente para mais itens.';
                mensagem.style.color = '#ff6b6b';
                mensagem.style.marginTop = '20px';
                textoContainer.appendChild(mensagem);
                setTimeout(() => mensagem.remove(), 3000);
                return;
            }
        }

        window.narrativeActionInProgress = true;
        this.itemPendente = { id: itemId, span: spanElement };

        const overlay = document.createElement('div');
        overlay.className = 'fade-overlay';
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('active'), 10);

        setTimeout(() => {
            document.getElementById('narrativa-ativa').style.display = 'none';
            document.getElementById('inventario-narrativa').classList.add('ativo');
            document.getElementById('fechar-inventario-btn').onclick = () => this.fecharInventario();

            const expandBtn = document.querySelector('#inventario-narrativa #expand-btn');
            const container = document.querySelector('#inventario-narrativa .container');
            if (expandBtn && container) {
                expandBtn.onclick = () => container.classList.toggle('expanded');
            }

            document.getElementById('preview-image').src = itemData.image;
            document.getElementById('preview-image').style.display = 'block';
            const previewContainer = document.querySelector('#inventario-narrativa .preview-image-window');
            if (previewContainer) {
                previewContainer.style.display = 'block';
            }
            const imageContainer = document.querySelector('#inventario-narrativa .preview-image-container');
            if (imageContainer) {
                imageContainer.style.display = 'flex';
            }
            document.getElementById('preview-name').textContent = '';

            const texto = `Você pegará a ${itemData.content}?`;
            const previewDesc = document.getElementById('preview-description');
            previewDesc.innerHTML = '';
            let i = 0;
            const typeWriter = setInterval(() => {
                if (i < texto.length) {
                    previewDesc.textContent += texto.charAt(i);
                    i++;
                } else {
                    clearInterval(typeWriter);
                    previewDesc.innerHTML += '<br><button id="btn-sim-inv">Sim</button> <button id="btn-nao-inv">Não</button>';
                    document.getElementById('btn-sim-inv').addEventListener('click', () => this.confirmarPegarItem());
                    document.getElementById('btn-nao-inv').addEventListener('click', () => {
                        document.getElementById('preview-image').style.display = 'none';
                        document.getElementById('preview-image').src = '';
                        document.getElementById('preview-description').innerHTML = '';
                        const imageContainer = document.querySelector('#inventario-narrativa .preview-image-container');
                        if (imageContainer) {
                            imageContainer.style.display = 'none';
                        }
                        this.itemPendente = null;
                        window.narrativeActionInProgress = false;
                    });
                }
            }, 50);

            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
        }, 1500);
    }

    async confirmarPegarItem() {
        await this.adicionarItem(this.itemPendente.id);
        this.itemPendente.span.remove();

        const itemNome = this.itensNarrativas[this.itemPendente.id].content;
        const texto = `Você pegou ${itemNome}.`;
        const previewDesc = document.getElementById('preview-description');
        previewDesc.innerHTML = '';
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < texto.length) {
                previewDesc.textContent += texto.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
                setTimeout(() => {
                    document.getElementById('preview-image').style.display = 'none';
                    document.getElementById('preview-image').src = '';
                    document.getElementById('preview-description').innerHTML = '';
                    const imageContainer = document.querySelector('#inventario-narrativa .preview-image-container');
                    if (imageContainer) {
                        imageContainer.style.display = 'none';
                    }
                    this.itemPendente = null;
                    window.narrativeActionInProgress = false;
                }, 2000);
            }
        }, 30);
    }

    abrirInventarioSemItem() {
        const overlay = document.createElement('div');
        overlay.className = 'fade-overlay';
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('active'), 10);

        setTimeout(() => {
            document.getElementById('narrativa-ativa').style.display = 'none';
            document.getElementById('inventario-narrativa').classList.add('ativo');
            document.getElementById('fechar-inventario-btn').onclick = () => this.fecharInventario();

            const expandBtn = document.querySelector('#inventario-narrativa #expand-btn');
            const container = document.querySelector('#inventario-narrativa .container');
            if (expandBtn && container) {
                expandBtn.onclick = () => container.classList.toggle('expanded');
            }

            document.getElementById('preview-image').style.display = 'none';
            document.getElementById('preview-name').textContent = '';
            document.getElementById('preview-description').textContent = '';
            const imageContainer = document.querySelector('#inventario-narrativa .preview-image-container');
            if (imageContainer) {
                imageContainer.style.display = 'none';
            }

            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
        }, 1200);
    }

    fecharInventario() {
        document.getElementById('inventario-narrativa').classList.remove('ativo');
        document.getElementById('narrativa-ativa').style.display = 'block';
        document.getElementById('preview-image').style.display = 'none';
        document.getElementById('preview-image').src = '';
        document.getElementById('preview-name').textContent = '';
        document.getElementById('preview-description').innerHTML = '';
        const imageContainer = document.querySelector('#inventario-narrativa .preview-image-container');
        if (imageContainer) {
            imageContainer.style.display = 'none';
        }
        this.itemPendente = null;
        window.narrativeActionInProgress = false;
    }

    criarOpcoes(opcoes, isFinal = false) {
    const container = document.getElementById('opcoes-container');
    container.innerHTML = '';

    // === SEÇÃO 99999 - BUFFER DE RETORNO DE BATALHA EMERGENTE ===
    if (this.secaoAtual == 99999) {
        const urlParams = new URLSearchParams(window.location.search);
        const secaoRetorno = urlParams.get('retorno');
        
        if (secaoRetorno) {
            const btn = document.createElement('button');
            btn.className = 'opcao-btn';
            btn.textContent = 'Continuar jornada';
            btn.addEventListener('click', () => {
                this.mostrarSecao(parseInt(secaoRetorno));
            });
            container.appendChild(btn);
            return; // Para aqui - não renderiza outras opções
        }
    }

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

            if (opcao.requer && !this.temItem(opcao.requer)) {
                btn.disabled = true;
                btn.textContent += ' (Requer: ' + opcao.requer + ')';
            }

            btn.addEventListener('click', () => {
                this.processarOpcao(opcao);
            });
            container.appendChild(btn);
        });

        if (this.visao3d) {
            this.visao3d.carregarOpcoes(opcoes);
        }
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

        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const playerData = docSnap.data();
            const inventory = playerData.inventory || {};
            const chest = inventory.itemsInChest || [];
            const itemData = this.itensNarrativas[itemId];

            if (!itemData) {
                console.error(`Item '${itemId}' não encontrado nas narrativas`);
                return;
            }

            const totalSlots = inventory.inventorySpaces || 50;
            const slotsNecessarios = itemData.large ? 2 : 1;

            let slotsOcupados = 0;
            chest.forEach(item => {
                const itemInfo = this.itensNarrativas[item.id];
                slotsOcupados += itemInfo?.large ? 2 : 1;
            });

            if (slotsOcupados + slotsNecessarios > totalSlots) {
                console.error('Sem espaço suficiente no inventário');
                return;
            }

            if (itemData.stackable === true) {
    const existeItem = chest.find(item => item.id === itemId);
    if (existeItem) {
        existeItem.quantity = (existeItem.quantity || 1) + 1;
    } else {
        chest.push({ ...itemData, quantity: 1, uuid: crypto.randomUUID() });
    }
} else {
    const novoItem = { ...itemData, uuid: crypto.randomUUID() };

    if (itemId === "pequenabolsaouro") {
        novoItem.goldValue = Math.floor(Math.random() * 10) + 1;
    }

    chest.push(novoItem);
}


            await updateDoc(playerDocRef, {
                "inventory.itemsInChest": chest
            });

            this.playerData.inventory.itemsInChest = chest;
            console.log('Item adicionado:', itemId);
        }
    }

   async modificarEnergia(valor) {
    if (!this.userId) return;
    const playerDocRef = doc(db, "players", this.userId);
    const docSnap = await getDoc(playerDocRef);
    if (docSnap.exists()) {
        const playerData = docSnap.data();
        const energiaAtual = playerData.energy?.total || 20;
        const energiaMaxima = playerData.energy?.initial || 20;
        
        // LÓGICA DE MORTE CORRIGIDA
        let novaEnergia;
        if (valor === -999) {
            novaEnergia = -999; // Permite morte instantânea
        } else {
            const calculada = energiaAtual + valor;
            // Clampa o dano normal em 0, e a cura no máximo.
            novaEnergia = Math.max(0, Math.min(energiaMaxima, calculada));
        }

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

                if (itemId === "pequenabolsaouro" && item.goldValue) {
                    const ouroAtual = playerData.p?.ouro || 0;
                    await updateDoc(playerDocRef, {
                        "p.ouro": ouroAtual + item.goldValue
                    });
                    this.playerData.p = this.playerData.p || {};
                    this.playerData.p.ouro = ouroAtual + item.goldValue;
                }

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

    iniciarTeste(atributo, dificuldade, secaoSucesso, falha_mortal = false) {
    this.testeAtual = { atributo, dificuldade, secaoSucesso, falha_mortal };
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
            // 🆕 Se for teste emergente, GERA AGORA com resultado
            if (this.sistemaEmergencia.emergenciaAtiva) {
                const secaoAtual = this.sistemaEmergencia.secoesEmergentes.get(this.secaoAtual) || 
                                   this.secaoEmergentePai;
                
                if (secaoAtual) {
                    const opcaoOriginal = secaoAtual.opcoes.find(op => op.secao === this.testeAtual.secaoSucesso);
                    
                    if (opcaoOriginal && opcaoOriginal.emergente) {
                        const resultadoParaIA = {
                            atributo: this.testeAtual.atributo,
                            dificuldade: this.testeAtual.dificuldade,
                            sucesso: true
                        };
                        
                        console.log('[TESTE] Gerando seção de sucesso COM resultado:', resultadoParaIA);
                        
                        const resultado = await this.sistemaEmergencia.processarOpcaoEmergente(
                            opcaoOriginal,
                            secaoAtual,
                            resultadoParaIA
                        );
                        
                        if (resultado && resultado.ativada) {
                            this.secaoEmergentePai = resultado.secao;
                            await this.mostrarSecao(resultado.idSecao);
                            return;
                        }
                    }
                }
            }
            
            // Fluxo normal (não-emergente)
            this.mostrarSecao(this.testeAtual.secaoSucesso);
        
        } else {
            // ☠️ VERIFICA SE É TESTE MORTAL (LÓGICA CORRIGIDA)
            if (this.testeAtual.falha_mortal) {
                console.log('[TESTE] ☠️ FALHA MORTAL');
                await this.modificarEnergia(-999); // Seta energia para -999
        
                // 🆕 DEIXA A IA NARRAR A MORTE
                if (this.sistemaEmergencia.emergenciaAtiva) {
                    const secaoAtual = this.sistemaEmergencia.secoesEmergentes.get(this.secaoAtual) || 
                                       this.secaoEmergentePai;
                    
                    if (secaoAtual) {
                        const opcaoOriginal = secaoAtual.opcoes.find(op => 
                            op.teste && op.dificuldade === this.testeAtual.dificuldade
                        );
                        
                        if (opcaoOriginal && opcaoOriginal.emergente) {
                            const resultadoParaIA = {
                                atributo: this.testeAtual.atributo,
                                dificuldade: this.testeAtual.dificuldade,
                                sucesso: false,
                                mortal: true // <-- 🆕 FLAG DE MORTE ENVIADA PARA IA
                            };
                            
                            console.log('[TESTE] Gerando seção de MORTE COM resultado:', resultadoParaIA);
                            
                            const resultado = await this.sistemaEmergencia.processarOpcaoEmergente(
                                opcaoOriginal,
                                secaoAtual,
                                resultadoParaIA
                            );
                            
                            if (resultado && resultado.ativada) {
                                this.secaoEmergentePai = resultado.secao;
                                await this.mostrarSecao(resultado.idSecao); // Mostra a descrição da morte
                                return;
                            }
                        }
                    }
                }
                
                // Fallback (se não for emergente ou IA falhar)
                this.mostrarSecao(320); 
                return;
            }
            
            // 🆕 APLICA DANO VARIÁVEL (10-25)
            const danoAleatorio = -(Math.floor(Math.random() * 16) + 10);
            console.log(`[TESTE] Dano por falha: ${danoAleatorio}`);
            await this.modificarEnergia(danoAleatorio);
        
        
            // 🆕 SE FOR TESTE EMERGENTE, GERA SEÇÃO DE FALHA
            if (this.sistemaEmergencia.emergenciaAtiva) {
                const secaoAtual = this.sistemaEmergencia.secoesEmergentes.get(this.secaoAtual) || 
                                   this.secaoEmergentePai;
                
                if (secaoAtual) {
                    const opcaoOriginal = secaoAtual.opcoes.find(op => 
                        op.teste && op.dificuldade === this.testeAtual.dificuldade
                    );
                    
                    if (opcaoOriginal && opcaoOriginal.emergente) {
                        const resultadoParaIA = {
                            atributo: this.testeAtual.atributo,
                            dificuldade: this.testeAtual.dificuldade,
                            sucesso: false, // 🆕 DIFERENÇA: Agora é false
                            mortal: false // 🆕 DIFERENÇA: Não é mortal
                        };
                        
                        console.log('[TESTE] Gerando seção de FALHA COM resultado:', resultadoParaIA);
                        
                        const resultado = await this.sistemaEmergencia.processarOpcaoEmergente(
                            opcaoOriginal,
                            secaoAtual,
                            resultadoParaIA
                        );
                        
                        if (resultado && resultado.ativada) {
                            this.secaoEmergentePai = resultado.secao;
                            await this.mostrarSecao(resultado.idSecao);
                            return;
                        }
                    }
                }
            }
            
            // 🆕 FALLBACK: Se não gerou seção emergente, volta para seção atual
            this.mostrarSecao(this.secaoAtual);
        }
    }


    // =======================================================================
    // === SUBSTITUA ESTE MÉTODO (verificarProgressoSalvo) ===
    // =======================================================================
    async verificarProgressoSalvo() {
        if (!this.userId) return;

        const urlParams = new URLSearchParams(window.location.search);
        const secaoUrl = urlParams.get('secao');
        const narrativaUrl = urlParams.get('narrativa');

        // 1. Se a URL tiver ?narrativa=...&secao=... (Ex: vindo da batalha)
        if (narrativaUrl && secaoUrl) {
            if (NARRATIVAS[narrativaUrl]) {
                // 🆕 CORREÇÃO: Remove parseInt() de secaoUrl
                await this.restaurarNarrativaAposRetorno(narrativaUrl, secaoUrl);
                return;
            }
        }

        // 2. Se a URL tiver SÓ ?secao=... (legado, mas corrigido)
        if (secaoUrl) {
            // 🆕 CORREÇÃO LÓGICA: Encontra o narrativaId PRIMEIRO
            const foundNarrativaId = Object.keys(NARRATIVAS).find(id => NARRATIVAS[id].secoes[secaoUrl]);
            
            if (foundNarrativaId) {
                await this.iniciarNarrativa(foundNarrativaId);
                // 🆕 CORREÇÃO: Remove parseInt()
                await this.mostrarSecao(secaoUrl);
                return;
            }
        }

        // 3. Se não houver URL, verifica o progresso salvo no Firebase
        const playerDocRef = doc(db, "players", this.userId);
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const allProgress = docSnap.data().narrativeProgress;
            if (allProgress) {
                const inProgressNarrativeId = Object.keys(allProgress).find(
                    id => NARRATIVAS[id] && allProgress[id] && !allProgress[id].completed
                );

                if (inProgressNarrativeId) {
                    const progress = {
                        ...allProgress[inProgressNarrativeId],
                        narrativeId: inProgressNarrativeId
                    };
                    this.mostrarOpcaoContinuar(progress);
                    return;
                }
            }
        }
    }
    // =======================================================================
    // === FIM DA SUBSTITUIÇÃO (verificarProgressoSalvo) ===
    // =======================================================================

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
        // MUDANÇA: Usar o novo método que restaura corretamente
        await this.restaurarNarrativaAposRetorno(progress.narrativeId, progress.currentSection);
        continueDiv.remove();
    });
    document.getElementById('new-adventure').addEventListener('click', async () => {
        await this.limparProgresso();
        continueDiv.remove();
    });
}

async restaurarNarrativaAposRetorno(narrativeId, secao) {
    // Restaura a narrativa corretamente após retorno de batalha
    if (!NARRATIVAS[narrativeId]) {
        console.error(`Narrativa ${narrativeId} não encontrada`);
        return false;
    }

    this.narrativaAtual = NARRATIVAS[narrativeId];
    this.secaoAtual = secao;
    
    // Restaura a interface
    document.getElementById('selecao-narrativas').className = 'tela-oculta';
    document.getElementById('narrativa-ativa').className = 'tela-ativa';
    document.getElementById('titulo-narrativa').textContent = this.narrativaAtual.titulo;

    // Restaura listeners
    document.getElementById('abrir-inventario-btn').onclick = () => {
        this.abrirInventarioSemItem();
    };

    if (!this.visao3d) {
        this.visao3d = new Visao3D('canvas-container');
    }

    document.addEventListener('opcaoClicada3D', (e) => {
        this.processarOpcao(e.detail);
    });

    // Carrega dados do jogador
    await this.carregarDadosJogador();
    
    // Mostra a seção
    await this.mostrarSecao(secao);
    
    return true;
}

    
    async limparProgresso() {
        if (!this.userId) return;
        const playerDocRef = doc(db, "players", this.userId);
        await updateDoc(playerDocRef, {
            "narrativeProgress": null
        });
    }

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
        this.ultimaEscolhaFeita = opcao.texto;

        // 1. LÓGICA DE RECUO (Se for opção de sair da emergência)
        if (this.sistemaEmergencia && this.sistemaEmergencia.emergenciaAtiva) {
            if (opcao.tipo === 'recuar' || opcao.convergencia) {
                console.log(`[NARRATIVAS] ✅ Desativando emergência - ${opcao.tipo}`);
                this.sistemaEmergencia.emergenciaAtiva = false;
                this.contadorSecoesParaEmergencia = 0; // 🔹 RESET DO CONTADOR
                console.log(`[NARRATIVAS] 🔄 Contador resetado ao sair da emergência: ${this.contadorSecoesParaEmergencia}`);
            }
        }

        // 2. FADE OUT E SOM
        const overlay = document.createElement('div');
        overlay.className = 'fade-overlay';
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('active'), 10);
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const audio = new Audio(opcao.som || 'https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/passos.mp3');
            await audio.play();
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.log('Erro ao tocar som:', error);
        }

        // 3. APLICAR CUSTOS
        if (opcao.custo_oculto) {
            console.log('[NARRATIVAS] Aplicando custo oculto:', opcao.custo_oculto);
            if (opcao.custo_oculto.tipo === 'energia') {
                await this.modificarEnergia(opcao.custo_oculto.valor);
            }
        }
        if (opcao.requer) {
            await this.consumirItem(opcao.requer);
        }

        // 4. PROCESSAR AÇÃO (ORDEM CORRIGIDA)
        
        // 4a. SE FOR UM TESTE (Prioridade máxima)
if (opcao.teste) {
    console.log(`[TESTE] Iniciando teste: ${opcao.teste}`);
    
    // 🆕 NÃO PRÉ-GERA MAIS - Apenas verifica limite
    if (this.sistemaEmergencia.emergenciaAtiva && this.sistemaEmergencia.profundidadeAtual >= 5) {
        console.log('[NARRATIVAS] ⚠️ Profundidade máxima - forçando convergência');
        const convergencia = this.sistemaEmergencia.gerarConvergenciaForcada();
        
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 1200);
        
        this.iniciarTeste(opcao.teste, opcao.dificuldade, convergencia.idSecao);
        return;
    }
    
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 1200);
    
    this.iniciarTeste(opcao.teste, opcao.dificuldade, opcao.secao, opcao.falha_mortal);
    return;
}


        
        // 4b. SE FOR UMA BATALHA
        if (opcao.batalha) {
            console.log(`[BATALHA] Iniciando batalha: ${opcao.batalha}`);
            // A lógica de batalha (linhas 979-1014 originais) já está correta
            const origemParaSalvar = this.sistemaEmergencia.emergenciaAtiva 
                ? this.sistemaEmergencia.secaoOrigemEmergencia 
                : this.secaoAtual;
            
            const destinoVitoria = this.sistemaEmergencia.emergenciaAtiva 
                ? 99999
                : (opcao.vitoria || null);
            
            const narrativeId = (() => {
                try {
                    return Object.keys(NARRATIVAS).find(
                        key => NARRATIVAS[key] === this.narrativaAtual
                    ) || null;
                } catch (e) {
                    return null;
                }
            })();

            const playerDocRef = doc(db, "players", this.userId);

            await updateDoc(playerDocRef, {
                "narrativeProgress.battleReturn": {
                    vitoria: destinoVitoria,
                    derrota: opcao.derrota || null,
                    narrativeId,
                    secaoOrigem: origemParaSalvar,
                    active: true,
                    isEmergencia: this.sistemaEmergencia.emergenciaAtiva
                }
            });

            if (this.sistemaEmergencia.emergenciaAtiva) {
                sessionStorage.setItem("narrativa-origem", origemParaSalvar.toString());
                sessionStorage.setItem("narrativa-id", narrativeId);
            }

            window.location.href = `batalha.html?monstros=${opcao.batalha}`;
            return; // Batalha cuida do próximo passo
        }

        // 4c. VERIFICAR SE A OPÇÃO GERA UM PATCH PERSISTENTE
console.log('[PATCH] 🔍 Verificando opção:', opcao);

if (opcao.efeitos && opcao.efeitos.length > 0) {
    console.log('[PATCH] Verificando efeitos:', opcao.efeitos);
    
    const efeitoPatch = opcao.efeitos.find(e => {
        console.log('[PATCH] Tipo do efeito:', e.tipo); // 🆕 LOG CRÍTICO
        return e.tipo === 'gerar_patch_persistente';
    });
    
    if (efeitoPatch) {
        console.log('[PATCH] ✅ Efeito de patch encontrado:', efeitoPatch);
        const secaoAlvoNum = efeitoPatch.secao_alvo;
        const flagNome = efeitoPatch.flag;
        
        // Verifica se já foi processado
        if (!this.playerData.worldState[flagNome]) {
            console.log(`[PATCH] 🚀 Gerando patch para Seção ${secaoAlvoNum} com flag ${flagNome}`);
            
            const secaoOriginal = this.narrativaAtual.secoes[secaoAlvoNum];
            if (!secaoOriginal) {
                console.error(`[PATCH] ❌ Seção ${secaoAlvoNum} não encontrada`);
            } else {
                secaoOriginal.id = secaoAlvoNum;
                
                const historicoFormatado = this.sistemaEmergencia.historico
                    .map(h => `Seção ${h.numero}: ${h.texto.substring(0, 50)}...`)
                    .join('\n');

                const patch = await this.sistemaEmergencia.gerarPatchPersistente(
                    secaoOriginal, 
                    flagNome, 
                    historicoFormatado
                );
                
                if (patch) {
                    console.log(`[PATCH] ✅ Patch gerado:`, patch);
                    
                    const playerDocRef = doc(db, "players", this.userId);
                    const updates = {};
                    updates[`worldState.${flagNome}`] = true;
                    updates[`patches.${secaoAlvoNum}`] = patch;
                    
                    await updateDoc(playerDocRef, updates);
                    
                    this.playerData.worldState[flagNome] = true;
                    this.playerData.patches[secaoAlvoNum] = patch;
                    
                    this.narrativaAtual.secoes = {
                        ...this.narrativaAtual.secoes,
                        ...patch.novas_secoes
                    };
                    
                    console.log(`[PATCH] 💾 Salvo no Firebase`);
                } else {
                    console.error(`[PATCH] ❌ IA falhou em gerar patch`);
                }
            }
        } else {
            console.log(`[PATCH] ⏭️ Flag ${flagNome} já existe`);
        }
    } else {
        console.log('[PATCH] ℹ️ Nenhum efeito de patch nesta opção');
    }
}

        
        // ===================================================================
        // === 🆕 INÍCIO DA SUBSTITUIÇÃO (BLOCO 4d) ===
        // ===================================================================
        
        // 4d. SE FOR UMA OPÇÃO DE APROFUNDAMENTO (EMERGENTE, SEM TESTE/BATALHA)
        if (this.sistemaEmergencia.emergenciaAtiva && opcao.emergente) {
            console.log(`[NARRATIVAS] Processando opção emergente (do cache): ${opcao.tipo}`);
            
            // 1. Pega a próxima seção do cache (NÃO CHAMA MAIS A IA)
            const resultadoEmergencia = await this.sistemaEmergencia.processarOpcaoEmergente(
                opcao, 
                this.secaoEmergentePai
            );

            // 2. VERIFICA SE A RESPOSTA VEIO COM UM PATCH PARA SALVAR
            if (resultadoEmergencia && resultadoEmergencia.patchParaSalvar) {
                const patch = resultadoEmergencia.patchParaSalvar;
                const flagNome = patch.flag;
                const secaoAlvoNum = patch.secao_alvo;

                if (secaoAlvoNum && flagNome && !this.playerData.worldState[flagNome]) {
                    console.log(`[PATCH] 🚀 Gerando patch (via branch cache) para Seção ${secaoAlvoNum} com flag ${flagNome}`);
                    
                    const secaoOriginal = NARRATIVAS[this.narrativaAtual.id].secoes[secaoAlvoNum];
                    if (secaoOriginal) {
                        secaoOriginal.id = secaoAlvoNum; // Garante que a IA saiba o ID
                        
                        const historicoFormatado = this.sistemaEmergencia.historico
                            .map(h => `Seção ${h.numero}: ${h.texto.substring(0, 50)}...`)
                            .join('\n');

                        // CHAMA A IA (SEPARADAMENTE) PARA GERAR O PATCH
                        const patchJSON = await this.sistemaEmergencia.gerarPatchPersistente(
                            secaoOriginal, 
                            flagNome, 
                            historicoFormatado
                        );
                        
                        if (patchJSON) {
                            console.log(`[PATCH] ✅ Patch gerado:`, patchJSON);
                            const playerDocRef = doc(db, "players", this.userId);
                            const updates = {};
                            updates[`worldState.${flagNome}`] = true;
                            updates[`patches.${secaoAlvoNum}`] = patchJSON;
                            
                            await updateDoc(playerDocRef, updates);
                            
                            // Atualiza o cache local
                            this.playerData.worldState[flagNome] = true;
                            this.playerData.patches[secaoAlvoNum] = patchJSON;
                            
                            // Injeta as novas seções na árvore atual
                            this.aplicarTodosOsPatches();
                            
                            console.log(`[PATCH] 💾 Salvo no Firebase e injetado na memória.`);
                        } else {
                            console.error(`[PATCH] ❌ IA falhou em gerar patch`);
                        }
                    } else {
                        console.error(`[PATCH] ❌ Seção ${secaoAlvoNum} não encontrada`);
                    }
                } else if (secaoAlvoNum && flagNome && this.playerData.worldState[flagNome]) {
                    console.log(`[PATCH] ⏭️ Flag ${flagNome} já existe (patch não gerado)`);
                }
            }

            // 3. MOSTRA A PRÓXIMA SEÇÃO (da emergência)
            if (resultadoEmergencia && resultadoEmergencia.ativada) {
                this.secaoEmergentePai = resultadoEmergencia.secao;
                if (resultadoEmergencia.secao.efeitos) {
                    for (const efeito of resultadoEmergencia.secao.efeitos) {
                        if (efeito.tipo === 'energia') {
                            await this.modificarEnergia(efeito.valor);
                        }
                    }
                }
                await this.mostrarSecao(resultadoEmergencia.idSecao);
                
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 1200);
                return;
            }
        }
        // ===================================================================
        // === 🆕 FIM DA SUBSTITUIÇÃO (BLOCO 4d) ===
        // ===================================================================
        
        // 4e. SE FOR UMA OPÇÃO NORMAL (NÃO-EMERGENTE, NÃO-TESTE, NÃO-BATALHA)
        await this.mostrarSecao(opcao.secao, this.secaoAtual);
        
        // 5. FADE IN
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 1200);
    }
    

   async processarBatalhaAutomatica(secao) {
    const playerDocRef = doc(db, "players", this.userId);

    // Determina origem: se emergência ativa, usa a origem registrada, caso contrário usa a seção atual
    const origemParaSalvar =
    (this.sistemaEmergencia && this.sistemaEmergencia.emergenciaAtiva)
        ? (this.sistemaEmergencia.secaoOrigemEmergencia || this.secaoAtual)
        : this.secaoAtual;

    // Determina narrativeId com segurança
    const narrativeId = (() => {
        try {
            return Object.keys(NARRATIVAS).find(key => NARRATIVAS[key] === this.narrativaAtual) || null;
        } catch (e) {
            return null;
        }
    })();

    await updateDoc(playerDocRef, {
        "narrativeProgress.battleReturn": {
            vitoria: secao.vitoria || null,
            derrota: secao.derrota || null,
            narrativeId: narrativeId,
            secaoOrigem: origemParaSalvar,
            active: true
        }
    });


    // Vai para a página de batalha
    window.location.href = `batalha.html?monstros=${secao.batalha}`;
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

        // Pega dados locais, se houver (prioridade para sessionStorage)
        const narrativaLocal = sessionStorage.getItem("narrativa-id");
        const origemLocal = sessionStorage.getItem("narrativa-origem");
        const vitoriaLocal = sessionStorage.getItem("narrativa-vitoria");

        // Decide a seção destino com prioridade: sessionStorage -> battleReturn.secaoOrigem -> vitoria
        const targetSection =
            origemLocal ||
            battleReturn.secaoOrigem ||
            vitoriaLocal ||
            battleReturn.vitoria ||
            null;

        const narrativeId =
            narrativaLocal ||
            battleReturn.narrativeId ||
            null;

        if (!targetSection) return false; // sem destino válido

        const button = document.createElement('button');
        button.textContent = 'Continuar Aventura';
        button.style.cssText = 'background: #4CAF50; color: white; padding: 10px 20px; margin: 10px; border: none; border-radius: 5px; cursor: pointer;';

        button.addEventListener('click', async () => {
    try {
        // 🆕 PRIORIDADE: sessionStorage > battleReturn
        const narrativaIdFinal = 
            sessionStorage.getItem("narrativa-id") ||
            battleReturn.narrativeId ||
            null;

        const secaoOrigemFinal = 
            sessionStorage.getItem("narrativa-origem") ||
            battleReturn.secaoOrigem ||
            null;

        if (!narrativaIdFinal || !secaoOrigemFinal) {
            console.warn("[CONTINUAR] Dados insuficientes para retorno.");
            return;
        }

        // 🆕 DETERMINA SE É BATALHA EMERGENTE
        const isEmergencia = battleReturn.isEmergencia || 
                            sessionStorage.getItem("narrativa-id") !== null;

        console.log(`[CONTINUAR] Tipo: ${isEmergencia ? 'EMERGENCIA' : 'NORMAL'}`);

        if (isEmergencia) {
            // 🆕 FLUXO EMERGENTE: Vai para buffer 99999 com parâmetro de retorno
            await updateDoc(playerDocRef, {
                "narrativeProgress.battleReturn.active": false
            });

            // Limpa sessionStorage
            sessionStorage.removeItem("narrativa-vitoria");
            sessionStorage.removeItem("narrativa-derrota");
            sessionStorage.removeItem("narrativa-origem");
            sessionStorage.removeItem("narrativa-id");

            // 🆕 REDIRECIONA PARA BUFFER COM PARÂMETRO DE RETORNO
            window.location.href = `narrativas.html?narrativa=${narrativaIdFinal}&secao=99999&retorno=${secaoOrigemFinal}`;
            
        } else {
            // Fluxo normal (existente)
            await updateDoc(playerDocRef, {
                [`narrativeProgress.${narrativaIdFinal}.currentSection`]: secaoOrigemFinal,
                "narrativeProgress.battleReturn.active": false
            });

            window.location.href = `narrativas.html?narrativa=${narrativaIdFinal}&secao=${secaoOrigemFinal}`;
        }
    } catch (err) {
        console.error("Erro ao continuar aventura:", err);
    }
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





