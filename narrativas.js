// Importa NARRATIVAS do arquivo de dados
import { NARRATIVAS } from './narrativas-data.js';

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
            "granada-de-concussao": { id: "granada-de-concussao", content: "Granada de Concussão", uuid: "extra-granada-de-concussao", consumable: true, quantity: 3, effect: "stun", damage: "3D4", description: "Explosivo de concussão de área (raio 2).", areaEffect: true, areaRadius: 2, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-de-concussao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-de-concussao.png" },
            "granada-incendiaria": { id: "granada-incendiaria", content: "Granada Incendiária", uuid: "extra-granada-incendiaria", consumable: true, quantity: 3, effect: "explosion", damage: "2D6", description: "Explosivo incendiário de área (raio 3).", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-incendiaria.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-incendiaria.png" },
            "granada-mao": { id: "granada-mao", content: "Granada de Mão", uuid: "extra-granada-mao", consumable: true, quantity: 3, effect: "explosion", damage: "3D8", description: "Explosivo portátil de área (raio 3).", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-mao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-mao.png" },
            "kitmedico": { id: "kitmedico", content: "Kit Médico", consumable: true, uuid: "extra-kitmedico", quantity: 2, effect: "heal", value: 5, description: "Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/kitmedico.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thukitmedico.png" },
            "latadesardinha": { id: "latadesardinha", content: "Lata de Sardinha", consumable: true, uuid: "extra-latadesardinha", quantity: 2, effect: "heal", value: 4, description: "Iguaria do mar. Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/latadesardinha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thulatadesardinha.png" },
            "pao-mofado": { id: "pao-mofado", content: "Pão Mofado", uuid: "extra-pao-mofado", consumable: true, quantity: 3, effect: "damage", value: 5, description: "Pedaço de pão velho e mofado.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pao-mofado.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupao-mofado.png" },
            "pequeno-saco-ervas": { id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, uuid: "extra-pequeno-saco-ervas", quantity: 5, effect: "heal", value: 1, description: "Plantas capazes de curar feridas leves.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pequeno-saco-ervas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupequeno-saco-ervas.png" },
            "pocao-cura-completa": { id: "pocao-cura-completa", content: "Poção de Cura Completa", consumable: true, uuid: "extra-pocao-cura-completa", quantity: 10, effect: "heal", value: 150, description: "Restaura uma massiva quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pocao-cura-completa.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupocao-cura-completa.png" },
            "pocao-cura-menor": { id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, uuid: "extra-pocao-cura-menor", quantity: 2, effect: "heal", value: 3, description: "Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pocao-cura-menor.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupocao-cura-menor.png" },
            "tocha": { id: "tocha", content: "Tocha", uuid: "extra-tocha", consumable: true, quantity: 3, description: "Bastão de madeira envolto em trapos embebidos em óleo.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/tocha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thutocha.png" },

            // === COMPONENTES ===
            "grilo": { id: "grilo", content: "Grilo", uuid: "extra-grilo", description: "Um pequeno inseto saltitante.", componente: true, energia: { total: 1, inicial: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/grilo.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugrilo.png" },
            "la": { id: "la", content: "Lã", uuid: "extra-la", description: "Componente mágico para magias de atordoamento.", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/la.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thula.png" },
            "pedaco-couro": { id: "pedaco-couro", content: "Pedaço de couro", uuid: "extra-pedaco-couro", description: "Tira endurecida para magias.", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pedaco-couro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupedaco-couro.png" },
            "velas": { id: "velas", content: "Velas", description: "Fontes de luz portáteis.", uuid: "extra-velas", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/velas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuvelas.png" },

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

    await this.salvarProgresso(numeroSecao, secao.final);

    // Aplicar apenas efeitos de energia
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

    renderizarTextoComItens(secao) {
    const textoContainer = document.getElementById('texto-narrativa');
    let textoHTML = secao.texto;

    if (secao.efeitos) {
        secao.efeitos.forEach(efeito => {
            if (efeito.tipo === 'item') {
                const itemNome = this.obterNomeItem(efeito.item);
                textoHTML += ` <span class="item-coletavel" data-item-id="${efeito.item}" style="color: #90EE90; cursor: pointer; text-decoration: underline;">${itemNome}</span>`;
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

abrirInventarioComItem(itemId, spanElement) {
    this.itemPendente = { id: itemId, span: spanElement };
    const itemData = this.itensNarrativas[itemId];
    
    const overlay = document.createElement('div');
    overlay.className = 'fade-overlay';
    document.body.appendChild(overlay);
    
    // Escurece rápido (0.2s)
    setTimeout(() => overlay.classList.add('active'), 10);
    
    // Fica preto por 1 segundo, depois abre inventário e clareia
    setTimeout(() => {
        document.getElementById('narrativa-ativa').style.display = 'none';
        document.getElementById('inventario-narrativa').classList.add('ativo');
        
        const expandBtn = document.querySelector('#inventario-narrativa #expand-btn');
        const container = document.querySelector('#inventario-narrativa .container');
        if (expandBtn && container) {
            expandBtn.onclick = () => container.classList.toggle('expanded');
        }
        
        document.getElementById('preview-image').src = itemData.image;
        document.getElementById('preview-image').style.display = 'block';
        document.getElementById('preview-name').textContent = itemData.content;
        document.getElementById('preview-description').innerHTML = `Você pegará a ${itemData.content}?<br><button id="btn-sim-inv">Sim</button> <button id="btn-nao-inv">Não</button>`;
        
        document.getElementById('btn-sim-inv').addEventListener('click', () => this.confirmarPegarItem());
        document.getElementById('btn-nao-inv').addEventListener('click', () => this.fecharInventario());
        
        // Clareia rápido (0.2s)
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
    }, 1500);
}



async confirmarPegarItem() {
    await this.adicionarItem(this.itemPendente.id);
    this.itemPendente.span.remove();
    this.fecharInventario();
}

fecharInventario() {
    document.getElementById('inventario-narrativa').classList.remove('ativo');
    document.getElementById('narrativa-ativa').style.display = 'block';
    this.itemPendente = null;
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

        if (itemData.stackable === false) {
            const novoItem = { ...itemData, uuid: crypto.randomUUID() };
            
            if (itemId === "pequenabolsaouro") {
                novoItem.goldValue = Math.floor(Math.random() * 10) + 1;
            }
            
            chest.push(novoItem);
        } else {
            const existeItem = chest.find(item => item.id === itemId);
            if (existeItem) {
                existeItem.quantity = (existeItem.quantity || 1) + 1;
            } else {
                chest.push({ ...itemData, quantity: 1, uuid: crypto.randomUUID() });
            }
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
        const energiaMaxima = playerData.energy?.initial || 20;
        const novaEnergia = Math.max(0, Math.min(energiaMaxima, energiaAtual + valor));
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
            
            // Se for bolsa de ouro, adiciona ao p.ouro
            if (itemId === "pequenabolsaouro" && item.goldValue) {
                const ouroAtual = playerData.p?.ouro || 0;
                await updateDoc(playerDocRef, {
                    "p.ouro": ouroAtual + item.goldValue
                });
                this.playerData.p = this.playerData.p || {};
                this.playerData.p.ouro = ouroAtual + item.goldValue;
            }
            
            // Remove a bolsa do inventário
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

    async processarBatalhaAutomatica(secao) {
        const playerDocRef = doc(db, "players", this.userId);
        await updateDoc(playerDocRef, {
            "narrativeProgress.battleReturn": {
                vitoria: secao.vitoria,
                derrota: secao.derrota,
                active: true
            }
        });
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






















