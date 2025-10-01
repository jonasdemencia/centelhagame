import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
// Configuração Firebase
const firebaseConfig = {
apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
authDomain: "centelhagame-9d511.firebaseapp.com",
projectId: "centelhagame-9d511",
storageBucket: "centelhagame-9d511.appspot.com",
messagingSenderId: "700809803145",
appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let selectedItem = null; // Armazena o item selecionado
let currentPlayerData = null; // Armazena os dados do jogador
// Variável global para o listener
let inventoryListener = null;
// Variável global para o listener do jogador
let playerDataListener = null;

// Função para configurar listener dos dados do jogador
async function setupPlayerDataListener(uid) {
console.log("Configurando listener dos dados do jogador:", uid);
try {
const playerRef = doc(db, "players", uid);

// Remove listener anterior se existir
if (playerDataListener) {
playerDataListener();
}

// Configura listener em tempo real para TODOS os dados do jogadorr
playerDataListener = onSnapshot(playerRef, (docSnap) => {
if (docSnap.exists()) {
const playerData = docSnap.data();
console.log("DADOS DO JOGADOR ATUALIZADOS EM TEMPO REAL!");

// Atualiza dados globais
currentPlayerData = playerData;

// Atualiza a interface
updateCharacterSheet(playerData);
}
}, (error) => {
console.error("Erro no listener dos dados do jogador:", error);
});
} catch (error) {
console.error("Erro ao configurar listener dos dados do jogador:", error);
}
}

// Itens iniciaiss que o jogador deve ter (adicionando propriedade de danoo)

const initialItems = [
{ id: "pao", content: "Pão", consumable: true, uuid: "extra-pao", quantity: 5, effect: "heal", value: 1, description: "Iguaria simples de trigo.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupao.png" },
{ id: "elixir-poder", content: "Elixir do Poder Supremo", consumable: true, quantity: 5, effect: "boost_attributes", value: 100, description: "Um elixir mágico que aumenta temporariamente todos os seus atributos para 100.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/elixir-poder.png" },
//{ id: "grilo", content: "Grilo", description: "Um pequeno grilo usado como componente mágico para magias de sono.", componente: true, energia: { total: 1, inicial: 1 } }

];


// Itens das narrativas (sincronizado com narrativas.js)
const itensNarrativas = [
    { id: 'chave-runica', content: 'Chave Rúnica', description: 'Chave de prata com runas brilhantes', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/chave-runica.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuchave-runica.png" },
    { id: 'amuleto-proteção', content: 'Amuleto de Proteção', description: 'Amuleto que pulsa com energia mágica', slot: 'amulet', defense: 1, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amuleto-proteção.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamuleto-proteção.png" },
    { id: 'anel-aquático', content: 'Anel Aquático', description: 'Anel mágico encontrado nas águas', slot: 'ring', bonuses: { magic: 2 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/anel-aquático.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuanel-aquático.png" },
    { id: 'chave-dourada', content: 'Chave Dourada', description: 'Pequena chave dourada dada pelo lobo', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/chave-dourada.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuchave-dourada.png" },
    { id: 'tesouro-lobo', content: 'Tesouro do Lobo', description: 'Tesouro encontrado com a ajuda do lobo', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/tesouro-lobo.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thutesouro-lobo.png" },
    { id: 'conhecimento-antigo', content: 'Conhecimento Antigo', description: 'Sabedoria ancestral do círculo de pedras', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/conhecimento-antigo.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuconhecimento-antigo.png" },
    { id: 'pergaminho-sabedoria', content: 'Pergaminho da Sabedoria', description: 'Pergaminho com segredos da torre', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pergaminho-sabedoria.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupergaminho-sabedoria.png" },
    { id: 'cristal-luminoso', content: 'Cristal Luminoso', description: 'Cristal que brilha com luz azulada', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/cristal-luminoso.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucristal-luminoso.png" },
    { id: 'pepitas-ouro', content: 'Pepitas de Ouro', description: 'Pequenas pepitas de ouro da mina', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pepitas-ouro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupepitas-ouro.png" },
    { id: 'tesouro-principal', content: 'Tesouro Principal', description: 'O grande tesouro das cavernas perdidas', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/tesouro-principal.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thutesouro-principal.png" },
    { id: 'corda', content: 'Corda', description: 'Corda resistente para escaladas', image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/corda.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucorda.png" },
    { id: 'ração', content: 'Ração', description: 'Comida para viagem', consumable: true, effect: 'heal', value: 2, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/ração.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuracao.png" },
    { id: 'tocha', content: 'Tocha', description: 'Bastão de madeira envolto em trapos embebidos em óleo', consumable: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/tocha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thutocha.png" },


];


// Lista de itens que podem ser adicionados dinamicamente (não iniciais)

const extraItems = [

// === ARMAS ===
{ id: "Adaga", content: "Adaga", uuid: "extra-adaga", slot: "weapon", description: "Um punhal afiado.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/adaga.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuadaga.png" },
{ id: "ak-47", content: "AK 47", uuid: "extra-ak-47", slot: "weapon", large: true, twoHanded: true, description: "Fuzil de assalto da União Soviética. Fabricada em 1945", damage: "2d10", ammoType: "municao-762", ammoCapacity: 30, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/ak-47.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuak-47.png" },
{ id: "amt-502d", content: "AMT-502D", uuid: "extra-amt-502d", slot: "weapon", description: "Protótipo fabricado supostamente em 2032(?), calíbre 50, 2 gatilhos", damage: "3d12", ammoType: "municao-50", ammoCapacity: 14, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amt-502d.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamt-502d.png" },
{ id: "beretta-92", content: "Beretta 92", uuid: "extra-beretta-92", slot: "weapon", description: "Pistola semiautomática italiana. Fabricada em 1972", damage: "1d8", ammoType: "municao-9mm", ammoCapacity: 10, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/beretta-92.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuberetta-92.png" },
{ id: "canivete", content: "Canivete", uuid: "extra-canivete", slot: "weapon", description: "Uma pequena lâmina afiada.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/canivete.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucanivete.png" },
{ id: "clava-grande", content: "Clava Grande", uuid: "extra-clava-grande", large: true, twoHanded: true, slot: "weapon", description: "Clava para matar monstros. 8kg.", damage: "1D10", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/clava-grande.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuclava-grande.png" },
{ id: "colt1848", content: "Colt 1848", uuid: "extra-colt1848", slot: "weapon", description: "Calíbre 45.", damage: "1d10", ammoType: "municao-45", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/colt1848.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucolt1848.png" },
{ id: "colt-python", content: "Colt Python", uuid: "extra-colt-python", slot: "weapon", description: "Modelo topo de linha da Colt. Fabricada em 1955", damage: "1d10", ammoType: "municao-357", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/colt-python.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucolt-python.png" },
{ id: "desert-eagle", content: "Desert Eagle", uuid: "extra-desert-eagle", slot: "weapon", description: "Semiautomática, calíbre 50", damage: "1d12", ammoType: "municao-50", ammoCapacity: 8, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/desert-eagle.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thudesert-eagle.png" },
{ id: "escopeta-12", content: "Escopeta 12", uuid: "extra-escopeta12", large: true, twoHanded: true, slot: "weapon", description: "Uma espingarda calibre 12.", damage: "1d12+2", ammoType: "municao-12", ammoCapacity: 5, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/escopeta-12.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuescopeta-12.png" },
{ id: "espada-duas-maos", content: "Espada de Duas Mãos", uuid: "extra-espada-duas-maos", large: true, slot: "weapon", twoHanded: true, description: "Espada pesada que requer ambas as mãos para uso.", damage: "2D6", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/espada-duas-maos.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuespada-duas-maos.png" },
{ id: "espadaexecutora", content: "Executora", uuid: "extra-espadaexecutora", large: true, slot: "weapon", twoHanded: true, description: "Instrumento de ferro com ponta quadrada. Preferência de alguns algozes.", damage: "2D6+1", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/espadaexecutora.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuespadaexecutora.png" },
{ id: "hekg11", content: "H&K G11", uuid: "extra-hekg11", slot: "weapon", large: true, twoHanded: true, description: "Fuzil protótipo raro. Fabricada em 1960", damage: "2d18", ammoType: "municao-473", ammoCapacity: 50, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/hekg11.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuhekg11.png" },
{ id: "lugerp08", content: "Luger P08", uuid: "extra-lugerp08", slot: "weapon", description: "Pistola 9mm rara, fabricada para a guerra.", damage: "1d8", ammoType: "municao-9mm", ammoCapacity: 8, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/lugerp08.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thulugerp08.png" },
{ id: "marreta", content: "Marreta", uuid: "extra-marreta", slot: "weapon", description: "Martelo de forja. 10kg.", damage: "1D10", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/marreta.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumarreta.png" },
{ id: "motoserra", content: "motoserra", uuid: "extra-motoserra", large: true, twoHanded: true, slot: "weapon", description: "Serra acionada por motor, utilizada no corte de árvores.. e monstros", damage: "3d6", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/motoserra.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumotoserra.png" },
{ id: "punhal-ceremonial", content: "Punhal Ceremonial", uuid: "extra-punhal-ceremonial", slot: "weapon", description: "Punhal usado para sacrifícios.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/punhal-ceremonial.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupunhal-ceremonial.png" },
{ id: "revolver-38", content: "Revolver 38", uuid: "extra-revolver38", slot: "weapon", description: "Calibre 38.", damage: "1d8", ammoType: "municao-38", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/revolver-38.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thurevolver-38.png" },
{ id: "martelodeguerra", content: "Martelo de Guerra", uuid: "extra-martelodeguerra", slot: "weapon", description: "10kg, projetados para destruir ossos.", damage: "1D8", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/martelodeguerra.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumartelodeguerra.png" },


    
// === AMULETOS ===
{ id: "amuletodaarmaduranatual", content: "Amuleto da Armadura Natural", uuid: "extra-amuletodaarmaduranatural", slot: "amulet", description: "Colar mágico contra sugadores.", bonuses: { couraca: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amuletodaarmaduranatural.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamuletodaarmaduranatural.png" },
{ id: "amuletodaserpentedourada", content: "Amuleto da Serpente Dourada", uuid: "extra-amuletodaserpentedourada", slot: "amulet", description: "Aumenta a energia vital.", bonuses: { energy: 5 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/amuletodaserpentedourada.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuamuletodaserpentedourada.png" },
   

// === ANÉIS ===
{ id: "aneldafe", content: "Anel da Fé", uuid: "extra-anel-da-fé", slot: "ring", description: "Relíquia sagrada de um santo desconhecido", bonuses: { couraca: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/aneldafe.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuaneldafe.png" },

// === ARMADURAS ===
{ id: "armaduradecouro", content: "Armadura de Couro", uuid: "extra-armaduradecouro", slot: "armor", description: "Armadura leve, para manobras artistícas", defense: 2, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/armaduradecouro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuarmaduradecouro.png" },
{ id: "habito-monastico", content: "Hábito Monástico", uuid: "extra-habito-monastico", slot: "armor", description: "Túnica de burel com forro reforçado, para monges viajantes", defense: 1, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/habito-monastico.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuhabito-monastico.png" },
{ id: "peitoral-de-aço", content: "Peitoral de aço", uuid: "extra-peitoral-de-aço", slot: "armor", description: "Armadura média, de peso considerável", defense: 5, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/peitoral-de-aço.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupeitoral-de-aço.png" },

// === ESCUDOS ===
{ id: "escudo-pequeno-de-madeira", content: "Escudo pequeno de madeira", uuid: "extra-escudo-pequeno-de-madeira", slot: "shield", description: "Escudo leve, feito de cedro", defense: 1, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/escudopequenodemadeira.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuescudopequenodemadeira.png" },
{ id: "escudograndedemetal", content: "Escudo Grande de Metal", uuid: "extra-escudograndedemetal", slot: "shield", description: "Escudo robusto, feito de ferro", defense: 2, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/escudograndedemetal.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuescudograndedemetal.png" },

// === CAPACETES ===
{ id: "mascara-de-gas", content: "Máscara de Gás", uuid: "extra-mascara-de-gas", slot: "helmet", defense: 1, description: "Modelo soviético, filtro cilíndrico frontal. Da segunda guerra.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/mascara-de-gas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumascara-de-gas.png" },


// === MUNIÇÕES ===
{ id: "municao-12", content: "Munição de 12.", uuid: "extra-municao12", quantity: 10, projectile: true, description: "Projéteis letais calíbre 12.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-12.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-12.png" },
{ id: "municao-38", content: "Munição de 38.", uuid: "extra-municao38", quantity: 20, projectile: true, description: "Projéteis letais calíbre 38.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-38.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-38.png" },
{ id: "municao-45", content: "Munição de 45", uuid: "extra-municao-45", quantity: 25, projectile: true, description: "Projéteis letais calíbre 45", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-45.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-45.png" },
{ id: "municao-50", content: "Munição de 50AE", uuid: "extra-municao-50", quantity: 20, projectile: true, description: "Projéteis letais calíbre 50AE", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-50.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-50.png" },
{ id: "municao-357", content: "Munição de 357", uuid: "extra-municao-357", quantity: 20, projectile: true, description: "Projéteis letais calíbre 357", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-357.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-357.png" },
{ id: "municao-473", content: "Munição 473", uuid: "extra-municao-473", quantity: 20, projectile: true, description: "Projéteis letais calíbre 4,73", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-473.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-473.png" },
{ id: "municao-762", content: "Munição 7,62", uuid: "extra-municao-762", quantity: 20, projectile: true, description: "Projéteis letais calíbre 7,62", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-762.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-762.png" },
{ id: "municao-9mm", content: "Munição de 9mm", uuid: "extra-municao9mm", quantity: 10, projectile: true, description: "Projéteis letais calíbre 9mm", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/municao-9mm.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thumunicao-9mm.png" },

// === CONSUMÍVEIS ===
{ id: "bolsa-de-escriba", content: "Bolsa de escriba", uuid: "extra-bolsa-de-escriba", consumable: true, quantity: 1, effect: "expand_inventory", value: 2, description: "Bolsa para guardar pergaminhos e penas.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/bolsa-de-escriba.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thubolsa-de-escriba.png" },
{ id: "granada-de-concussao", content: "Granada de Concussão", uuid: "extra-granada-de-concussao", consumable: true, quantity: 3, effect: "stun", damage: "3D4", description: "Explosivo de concussão de área (raio 2).", areaEffect: true, areaRadius: 2, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-de-concussao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-de-concussao.png" },
{ id: "granada-incendiaria", content: "Granada Incendiária", uuid: "extra-granada-incendiaria", consumable: true, quantity: 3, effect: "explosion", damage: "2D6", description: "Explosivo incendiário de área (raio 3).", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-incendiaria.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-incendiaria.png" },
{ id: "granada-mao", content: "Granada de Mão", uuid: "extra-granada-mao", consumable: true, quantity: 3, effect: "explosion", damage: "3D8", description: "Explosivo portátil de área (raio 3).", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/granada-mao.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugranada-mao.png" },
{ id: "kitmedico", content: "Kit Médico", consumable: true, uuid: "extra-kitmedico", quantity: 2, effect: "heal", value: 5, description: "Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/kitmedico.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thukitmedico.png" },
{ id: "latadesardinha", content: "Lata de Sardinha", consumable: true, uuid: "extra-latadesardinha", quantity: 2, effect: "heal", value: 4, description: "Iguaria do mar. Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/latadesardinha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thulatadesardinha.png" },
{ id: "pao-mofado", content: "Pão Mofado", uuid: "extra-pao-mofado", consumable: true, quantity: 3, effect: "damage", value: 5, description: "Pedaço de pão velho e mofado.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pao-mofado.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupao-mofado.png" },
{ id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, uuid: "extra-pequeno-saco-ervas", quantity: 5, effect: "heal", value: 1, description: "Plantas capazes de curar feridas leves.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pequeno-saco-ervas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupequeno-saco-ervas.png" },
{ id: "pocao-cura-completa", content: "Poção de Cura Completa", consumable: true, uuid: "extra-pocao-cura-completa", quantity: 10, effect: "heal", value: 150, description: "Restaura uma massiva quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pocao-cura-completa.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupocao-cura-completa.png" },
{ id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, uuid: "extra-pocao-cura-menor", quantity: 2, effect: "heal", value: 3, description: "Restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pocao-cura-menor.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupocao-cura-menor.png" },
{ id: "tocha", content: "Tocha", uuid: "extra-tocha", consumable: true, quantity: 3, description: "bastão de madeira envolto em trapos embebidos em óleo", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/tocha.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thutocha.png" },

// === COMPONENTES ===
{ id: "grilo", content: "Grilo", uuid: "extra-grilo", description: "Um pequeno inseto saltitante.", componente: true, energia: { total: 1, inicial: 1 }, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/grilo.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thugrilo.png" },
{ id: "la", content: "Lã", uuid: "extra-la", description: "Componente mágico para magias de atordoamento.", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/la.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thula.png" },
{ id: "pedaco-couro", content: "Pedaço de couro", uuid: "extra-pedaco-couro", description: "Tira endurecido para magias.", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/pedaco-couro.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thupedaco-couro.png" },
{ id: "velas", content: "Velas", description: "Fontes de luz portáteis.", uuid: "extra-velas", componente: true, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/velas.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuvelas.png" },

// === RELÍQUIAS ===
{ id: "calicereliquia", content: "Calíce Relíquia", uuid: "extra-calicereliquia", description: "O gênio de Granul um dia bebeu nela. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/calicereliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucalicereliquia.png" },
{ id: "coroareliquia", content: "Coroa Relíquia", uuid: "extra-coroareliquia", description: "Uma dinastia de reis loucos a usou. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/coroareliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucoroareliquia.png" },
{ id: "estatuetaareliquia", content: "Estatueta A. Relíquia", uuid: "extra-estatuetaareliquia", description: "Um deus humanoide feito de bronze. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/estatuetaareliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuestatuetaareliquia.png" },
{ id: "estatuetabreliquia", content: "Estatueta B. Relíquia", uuid: "extra-estatuetabreliquia", description: "Um deus humanoide feito de bronze. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/estatuetabreliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuestatuetabreliquia.png" },
{ id: "estatuetacreliquia", content: "Estatueta C. Relíquia", uuid: "extra-estatuetacreliquia", description: "Um deus feito de marfim. Antiquário de valor incomum.", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/estatuetacreliquia.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuestatuetacreliquia.png" },

// === UTILITÁRIOS ===
{ id: "corda", content: "Corda", uuid: "extra-corda", description: "Corda resistente para escaladas", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/corda.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thucorda.png" }

];


function updateItemPreview(item) {
    console.log("updateItemPreview chamada com:", item);
    
    const previewContainer = document.querySelector('.preview-image-container');
    const previewImage = document.getElementById('preview-image');
    const previewName = document.getElementById('preview-name');
    const previewDescription = document.getElementById('preview-description');
    
    const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];
    const itemData = allItemsArr.find(i => i.id === item.dataset.item);
    
    if (itemData) {
        previewContainer.style.display = 'flex'; // mostra o tapete
        previewImage.src = itemData.image;
        previewImage.style.display = 'block';
        previewName.textContent = itemData.content;
        previewDescription.textContent = itemData.description || 'Sem descrição disponível';
    }
}


// Função para reiniciar o inventário

async function resetInventory() {

const uid = auth.currentUser?.uid;

if (!uid) {

console.error("Usuário não está logado!");

return;

}

try {

// Remove o inventário atual

await setDoc(playerRef, {

inventory: {

itemsInChest: [],

equippedItems: {}

}

}, { merge: true });

console.log("Inventário limpo. Recarregando...");

// Recarrega a página para inicializar com os novos itens

window.location.reload();

} catch (error) {

console.error("Erro ao resetar inventário:", error);

}

}

// Adicione esta linha após a função resetInventory

window.resetInventory = resetInventory;

// Função para remover duplicatas existentes
async function removeDuplicateItems() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        alert("Usuário não logado!");
        return;
    }
    
    const playerRef = doc(db, "players", uid);
    const playerSnap = await getDoc(playerRef);
    
    if (!playerSnap.exists()) return;
    
    const inventoryData = playerSnap.data().inventory;
    
    // Remove duplicatas baseado no ID do item
    const uniqueItems = [];
    const seenIds = new Set();
    
    inventoryData.itemsInChest.forEach(item => {
        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            // Garante UUID único
            if (!item.uuid) {
                item.uuid = crypto.randomUUID();
            }
            uniqueItems.push(item);
        }
    });
    
    inventoryData.itemsInChest = uniqueItems;
    
    await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
    alert("Duplicatas removidas! Recarregando página...");
    window.location.reload();
}

// Torna a função acessível globalmente
window.removeDuplicateItems = removeDuplicateItems;


async function carregarMunicaoNaArma() {

const uid = auth.currentUser?.uid;

if (!uid) return;

const playerRef = doc(db, "players", uid);

const playerSnap = await getDoc(playerRef);

if (!playerSnap.exists()) return;

const inventoryData = playerSnap.data().inventory;

const equippedWeaponName = inventoryData.equippedItems.weapon;

if (!equippedWeaponName) return;

const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

const weaponData = allItemsArr.find(item =>

item.content === equippedWeaponName && item.ammoType

);

if (!weaponData) {

alert("A arma equipada não suporta munição!");

return;

}

const ammoItemIndex = inventoryData.itemsInChest.findIndex(item =>

item.id === weaponData.ammoType

);

if (ammoItemIndex === -1) {

alert("Você não possui munição compatível!");

return;

}

const ammoItem = inventoryData.itemsInChest[ammoItemIndex];

const loadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;

const ammoToLoad = Math.min(

weaponData.ammoCapacity - loadedAmmo,

ammoItem.quantity

);

if (ammoToLoad <= 0) {

alert("A arma já está carregada ou não há munição suficiente!");

return;

}

// Atualiza munição carregada
inventoryData.equippedItems.weapon_loadedAmmo = loadedAmmo + ammoToLoad;

// Atualiza munição no inventário

ammoItem.quantity -= ammoToLoad;

// Remove o item do baú se a quantidade ficar zero

if (ammoItem.quantity <= 0) {

inventoryData.itemsInChest.splice(ammoItemIndex, 1);

// Marca esse UUID como descartado

if (!inventoryData.discardedItems) inventoryData.discardedItems = [];

inventoryData.discardedItems.push(ammoItem.uuid);

}

// (Opcional) Remove eventuais duplicatas de munição com qty <= 0

inventoryData.itemsInChest = inventoryData.itemsInChest.filter(item => {

if (item.id === weaponData.ammoType && item.quantity <= 0) {

return false;

}

return true;

});

// Garante que o nome da arma equipada permaneça correto

inventoryData.equippedItems.weapon = weaponData.content;

// Salva no Firestore

await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

alert(`Você carregou ${ammoToLoad} munição no seu ${weaponData.content}.`);

}

// Variável global para armazenar o dado selecionado

let selectedDice = null;

// Função para inicializar os dados da coleção

function initializeDiceCollection() {

const diceCollection = document.querySelector('.dice-items');

const initialDice = [

{ type: 'D3', name: 'Dado de Cristal (D3)', description: 'Um pequeno dado triangular de cristal' },

{ type: 'D4', name: 'Dado de Jade (D4)', description: 'Um dado piramidal de jade' },

{ type: 'D6', name: 'Dado de Marfim (D6)', description: 'Um dado cúbico de marfim antigo' },

{ type: 'D8', name: 'Dado de Âmbar (D8)', description: 'Um dado octaédrico de âmbar' },

{ type: 'D10', name: 'Dado de Ametista (D10)', description: 'Um dado decaédrico de ametista' },

{ type: 'D12', name: 'Dado de Safira (D12)', description: 'Um dado dodecaédrico de safira' },

{ type: 'D20', name: 'Dado de Rubi (D20)', description: 'Um dado icosaédrico de rubi' }

];

diceCollection.innerHTML = ''; // Limpa a coleção antes de adicionar

initialDice.forEach(dice => {

const diceElement = document.createElement('div');

diceElement.className = 'dice-item';

diceElement.dataset.diceType = dice.type;

diceElement.dataset.diceName = dice.name;

diceElement.textContent = dice.name;

diceCollection.appendChild(diceElement);

diceElement.addEventListener('click', () => handleDiceClick(diceElement));

});

}

// Função para lidar com o clique em um dado

function handleDiceClick(diceElement) {

clearDiceHighlights();

selectedDice = diceElement;

diceElement.classList.add('selected');

const slots = document.querySelectorAll('.dice-slot');

slots.forEach(slot => {

if (slot.dataset.dice === diceElement.dataset.diceType) {

slot.classList.add('highlight');

}

});

}

// Função para limpar destaques dos dados

function clearDiceHighlights() {

document.querySelectorAll('.dice-item').forEach(die => die.classList.remove('selected'));

document.querySelectorAll('.dice-slot').forEach(slot => slot.classList.remove('highlight'));

}

// Adiciona eventos aos slots de dados

function initializeDiceSlots() {

const diceSlots = document.querySelectorAll('.dice-slot');

diceSlots.forEach(slot => {

slot.addEventListener('click', async () => {

const slotType = slot.dataset.dice;

const currentEquippedDice = slot.innerHTML !== slotType ? slot.innerHTML : null;

if (selectedDice && slotType === selectedDice.dataset.diceType) {

// Equipa o dado

if (currentEquippedDice) {

// Devolve o dado atual para a coleção

const newDice = document.createElement('div');

newDice.className = 'dice-item';

newDice.dataset.diceType = slotType;

newDice.dataset.diceName = currentEquippedDice;

newDice.textContent = currentEquippedDice;

document.querySelector('.dice-items').appendChild(newDice);

newDice.addEventListener('click', () => handleDiceClick(newDice));

}

// Coloca o novo dado no slot

slot.innerHTML = selectedDice.dataset.diceName;

selectedDice.remove();

selectedDice = null;

clearDiceHighlights();

// Salva o estado após equipar

await saveDiceState(auth.currentUser.uid);

} else if (selectedDice === null && currentEquippedDice) {

// Desequipa o dado

const newDice = document.createElement('div');

newDice.className = 'dice-item';

newDice.dataset.diceType = slotType;

newDice.dataset.diceName = currentEquippedDice;

newDice.textContent = currentEquippedDice;

document.querySelector('.dice-items').appendChild(newDice);

newDice.addEventListener('click', () => handleDiceClick(newDice));

slot.innerHTML = slotType;

// Salva o estado após desequipar

await saveDiceState(auth.currentUser.uid);

}

});

});

}

// Inicializa o sistema de dados quando a página carregar

document.addEventListener('DOMContentLoaded', () => {

initializeDiceCollection();

initializeDiceSlots();

});

// Constantes para cálculo de tempo

const GAME_TIME_MULTIPLIER = 7; // 7 segundos no jogo para cada 1 segundo real

const SECONDS_PER_DAY = 86400; // Segundos em um dia

const REAL_SECONDS_PER_GAME_DAY = SECONDS_PER_DAY / GAME_TIME_MULTIPLIER; // Segundos reais para um dia no jogo

// Função para exibir/ocultar o botão de usar

function toggleUseButton(show) {

const useButton = document.getElementById("useBtn");

if (useButton) {

useButton.style.display = show ? "block" : "none";

} else {

console.warn("Botão 'Usar' não encontrado no HTML.");

}

}

// Seleciona os itens clicados no baú

document.addEventListener("DOMContentLoaded", () => {

// Sistema de Carrossel

const slides = document.querySelectorAll(".carousel-slide");

let currentSlide = 0;

const prevBtn = document.getElementById("prevBtn");

if (prevBtn) {

prevBtn.addEventListener("click", () => {

slides[currentSlide].classList.remove("active");

currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;

slides[currentSlide].classList.add("active");

});

}

const nextBtn = document.getElementById("nextBtn");

if (nextBtn) {

nextBtn.addEventListener("click", () => {

slides[currentSlide].classList.remove("active");

currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;

slides[currentSlide].classList.add("active");

});

}

// Exibir a primeira janela ao carregar

if (slides.length > 0) {

slides[currentSlide].classList.add("active");

}

// Exibir a primeira janela ao carregar

if (slides.length > 0) {

slides[currentSlide].classList.add("active");

}

// ADICIONE SEU NOVO CÓDIGO AQUI

// Sistema de Carrossel para Armazenamento (Storage)

const storageSlides = document.querySelectorAll(".storage-carousel-slide");

let currentStorageSlide = 0;

const prevStorageBtn = document.getElementById("prevStorageBtn");

if (prevStorageBtn) {

prevStorageBtn.addEventListener("click", () => {

storageSlides[currentStorageSlide].classList.remove("active");

currentStorageSlide = (currentStorageSlide === 0) ? storageSlides.length - 1 : currentStorageSlide - 1;

storageSlides[currentStorageSlide].classList.add("active");

});

}

const nextStorageBtn = document.getElementById("nextStorageBtn");

if (nextStorageBtn) {

nextStorageBtn.addEventListener("click", () => {

storageSlides[currentStorageSlide].classList.remove("active");

currentStorageSlide = (currentStorageSlide === storageSlides.length - 1) ? 0 : currentStorageSlide + 1;

storageSlides[currentStorageSlide].classList.add("active");

});

}

// Listener global para desselecionar item clicando em qualquer lugar

document.addEventListener('click', function(event) {

// Elementos que NÃO devem desselecionar o item

const keepSelection = event.target.closest('.item, .slot, #useBtn, #carregar-municao-btn, #discard-slot, .dice-item, .dice-slot, .item-actions-window');

if (!keepSelection && selectedItem) {
    clearHighlights();
    selectedItem = null;
    toggleUseButton(false);

    // Esconde o tapete do preview
    const previewContainer = document.querySelector('.preview-image-container');
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }

    // Limpa o conteúdo
    const previewImage = document.getElementById('preview-image');
    const previewName = document.getElementById('preview-name');
    const previewDescription = document.getElementById('preview-description');
    
    previewImage.style.display = 'none';
    previewName.textContent = '';
    previewDescription.textContent = '';

// Esconde janela de ações
hideItemActions();
    document.querySelectorAll('.item').forEach(item => {
        item.clickCount = 0;
    });
}


// Desselecionar dados

if (!keepSelection && selectedDice) {

clearDiceHighlights();

selectedDice = null;

}

});

const slots = document.querySelectorAll('.slot');

const discardSlot = document.getElementById("discard-slot");

const useButton = document.getElementById("useBtn"); // Obtém a referência do botão



function handleItemClick(item) {

console.log("Item clicado:", item);

clearHighlights();

selectedItem = item;

item.classList.add('selected');

// --- DESTAQUE DE SLOT COMPATÍVEL ---

slots.forEach(slot => slot.classList.remove('highlight'));

console.log("Item clicado:", item);

const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

const itemData = allItemsArr.find(i => i.id === item.dataset.item);

console.log("itemData:", itemData);

if (itemData && itemData.slot) {

console.log("Slot compatível esperado:", itemData.slot);

slots.forEach(slot => {

console.log("Verificando slot:", slot.dataset.slot);

if (slot.dataset.slot === itemData.slot) {

console.log("Destacando slot:", slot);

slot.classList.add('highlight');

}

});

} else {

console.log("Item não tem slot compatível.");

}

// --- INÍCIO DO AJUSTE DE BOTÕES DE USO E MUNIÇÃO ---

const isProjectile = selectedItem.dataset.projectile === 'true';

let equippedWeaponName = currentPlayerData?.inventory?.equippedItems?.weapon;

// Remove sufixo de munição carregada, se existir (ex: "Revolver 38 (0/6)" -> "Revolver 38")

if (equippedWeaponName) {

equippedWeaponName = equippedWeaponName.replace(/\s*\(\d+\/\d+\)$/, "");

}

const weaponObj = allItemsArr.find(i => i.content === equippedWeaponName && i.ammoType);

const useBtn = document.getElementById("useBtn");

const carregarBtn = document.getElementById("carregar-municao-btn");

if (isProjectile && weaponObj && weaponObj.ammoType === selectedItem.dataset.item) {

if (carregarBtn) carregarBtn.style.display = "block";

if (useBtn) useBtn.style.display = "none";

} else if (selectedItem.dataset.consumable === 'true') {

if (useBtn) useBtn.style.display = "block";

if (carregarBtn) carregarBtn.style.display = "none";

} else {

if (useBtn) useBtn.style.display = "none";

if (carregarBtn) carregarBtn.style.display = "none";

}

// --- FIM DO AJUSTE DE BOTÕES DE USO E MUNIÇÃO ---
    updateItemPreview(item);
}

// Adiciona evento de clique aos itens iniciais

// Adiciona evento de clique aos itens iniciais
// Adiciona evento de clique aos itens iniciais
const itemsContainer = document.querySelector('.items');
if (itemsContainer) {
    itemsContainer.querySelectorAll('.item').forEach(item => {
        let clickCount = 0;
        
        item.addEventListener('click', () => {
            // Verifica se o clique foi no botão de expandir
            if (!item.classList.contains('item-expand-toggle')) {
                clickCount++;
                if (clickCount === 1) {
                    handleItemClick(item);
                } else if (clickCount === 2) {
                    showItemActions();
                    clickCount = 0;
                }
            }
        });

        item.addEventListener('dblclick', (event) => {
            if (!event.target.classList.contains('item-expand-toggle')) {
                showItemActions();
            }
        });
    });
}




// ==================================================================
// === INÍCIO: LÓGICA DE EQUIPAR/DESEQUIPAR TOTALMENTE REFEITA =====
// ==================================================================
slots.forEach(slot => {
    slot.addEventListener('click', async () => {
const slotType = slot.dataset.slot;
const slotId = slot.id;
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        if (!playerSnap.exists()) return;

        const inventoryData = playerSnap.data().inventory;
        const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

        // Garante que os objetos de inventário existam
        if (!inventoryData.equippedItems) inventoryData.equippedItems = {};
        if (!inventoryData.itemsInChest) inventoryData.itemsInChest = [];
        if (!inventoryData.weaponAmmoCounts) inventoryData.weaponAmmoCounts = {};

        const currentlyEquippedName = inventoryData.equippedItems[slotId];
        const currentlyEquippedData = allItemsArr.find(i => i.content === currentlyEquippedName);

        // CASO 1: EQUIPAR UM NOVO ITEM (selectedItem existe)
        if (selectedItem) {
            const newItemData = allItemsArr.find(i => i.id === selectedItem.dataset.item);
            const selectedUUID = selectedItem.dataset.uuid; // CORREÇÃO: Captura UUID específico

            // Verifica se o slot é compatível
if (newItemData && slotType === newItemData.slot) {
    // Verifica incompatibilidades
    if (slotType === "shield") {
        const weaponSlot = document.querySelector('.slot[data-slot="weapon"]');
        const equippedWeaponName = weaponSlot?.dataset.itemName;
        if (equippedWeaponName) {
            const weaponData = allItemsArr.find(item => item.content === equippedWeaponName);
            if (weaponData && weaponData.twoHanded) {
                alert("Não é possível equipar escudo com arma de duas mãos!");
                return;
            }
        }
    }
    
    if (slotType === "weapon" && newItemData.twoHanded) {
        const shieldSlot = document.querySelector('.slot[data-slot="shield"]');
        const equippedShieldName = shieldSlot?.dataset.itemName;
        if (equippedShieldName) {
            const shieldData = allItemsArr.find(item => item.content === equippedShieldName);
            inventoryData.itemsInChest.push({ ...shieldData, uuid: crypto.randomUUID() });
            inventoryData.equippedItems.shield = null;
            alert("Escudo foi desequipado para usar arma de duas mãos!");
        }
    }

                console.log(`Equipando ${newItemData.content} no slot ${slotType}`);

                // A) Salvar o estado do item que está sendo desequipado (se houver)
                if (currentlyEquippedData) {
                    console.log(`Desequipando ${currentlyEquippedName} para o inventário.`);
                    // Se for uma arma, salva sua munição atual antes de mover
                    if (currentlyEquippedData.ammoType) {
                        const currentLoadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
                        inventoryData.weaponAmmoCounts[currentlyEquippedName] = currentLoadedAmmo;
                        console.log(`Salvando munição de ${currentlyEquippedName}: ${currentLoadedAmmo}`);
                    }
                    // CORREÇÃO: Garante UUID único ao devolver item
                    inventoryData.itemsInChest.push({ ...currentlyEquippedData, uuid: crypto.randomUUID() });
                }

                // B) CORREÇÃO: Remove item específico usando UUID
                const itemInChestIndex = inventoryData.itemsInChest.findIndex(i => i.uuid === selectedUUID);
                if (itemInChestIndex > -1) {
                    inventoryData.itemsInChest.splice(itemInChestIndex, 1);
                }

                // C) Colocar o novo item no slot e limpar dados antigos
                inventoryData.equippedItems[slotId] = newItemData.content;

if (newItemData.bonuses && newItemData.bonuses.energy) {
const currentEnergy = currentPlayerData.energy || { total: 0, initial: 0 };
    const newInitial = currentEnergy.initial + newItemData.bonuses.energy;
    const newTotal = Math.min(currentEnergy.total + newItemData.bonuses.energy, newInitial);
    
    await setDoc(playerRef, {
        energy: { total: newTotal, initial: newInitial }
    }, { merge: true });
}

    
                // Limpa todos os dados específicos de arma/consumível para evitar vazamento
                delete inventoryData.equippedItems.weapon_loadedAmmo;
                delete inventoryData.equippedItems[slotType + '_consumable'];
                delete inventoryData.equippedItems[slotType + '_quantity'];
                delete inventoryData.equippedItems[slotType + '_effect'];
                delete inventoryData.equippedItems[slotType + '_value'];

                // D) Se o novo item for uma arma de fogo, carregar sua munição específica
                if (newItemData.ammoType) {
                    const savedAmmo = inventoryData.weaponAmmoCounts[newItemData.content] || 0;
                    inventoryData.equippedItems.weapon_loadedAmmo = savedAmmo;
                    console.log(`Carregando munição de ${newItemData.content}: ${savedAmmo}`);
                }
                
                // E) Salvar tudo no Firestore
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

                // F) Limpar estado da UI (o onSnapshot vai redesenhar)
                selectedItem = null;
                clearHighlights();
                toggleUseButton(false);
            }
        }
        // CASO 2: DESEQUIPAR UM ITEM (sem um novo item selecionado)
        else if (currentlyEquippedData) {
            console.log(`Desequipando ${currentlyEquippedName} do slot ${slotType}`);

            // A) Salvar o estado do item (munição)
            if (currentlyEquippedData.ammoType) {
                const currentLoadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
                inventoryData.weaponAmmoCounts[currentlyEquippedName] = currentLoadedAmmo;
                console.log(`Salvando munição de ${currentlyEquippedName}: ${currentLoadedAmmo}`);
            }

            // B) Limpar o slot e todos os dados associados
            inventoryData.equippedItems[slotId] = null;

// Após: inventoryData.equippedItems[slotId] = null;
if (currentlyEquippedData.bonuses && currentlyEquippedData.bonuses.energy) {
const currentEnergy = currentPlayerData.energy || { total: 0, initial: 0 };
    const newInitial = Math.max(1, currentEnergy.initial - currentlyEquippedData.bonuses.energy);
    const newTotal = Math.min(currentEnergy.total, newInitial);
    
    await setDoc(playerRef, {
        energy: { total: newTotal, initial: newInitial }
    }, { merge: true });
}

            
            delete inventoryData.equippedItems.weapon_loadedAmmo;
            delete inventoryData.equippedItems[slotType + '_consumable'];
            delete inventoryData.equippedItems[slotType + '_quantity'];
            delete inventoryData.equippedItems[slotType + '_effect'];
            delete inventoryData.equippedItems[slotType + '_value'];

            // C) CORREÇÃO: Garante UUID único ao devolver item
            inventoryData.itemsInChest.push({ ...currentlyEquippedData, uuid: crypto.randomUUID() });

            // D) Salvar no Firestore
            await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

            // E) Limpar estado da UI
            clearHighlights();
        }
    });
});
// ==================================================================
// === FIM: LÓGICA DE EQUIPAR/DESEQUIPAR TOTALMENTE REFEITA =======
// ==================================================================

// Adiciona funcionalidade ao botão de descarte
if (discardSlot) {
    discardSlot.addEventListener("click", async () => {
        console.log("Botão de descarte clicado");
        if (selectedItem) {
            console.log("🗑️ DESCARTANDO ITEM:");
            console.log(" - ID do item:", selectedItem.dataset.item);
            console.log(" - Conteúdo:", selectedItem.dataset.itemName);

            const uid = auth.currentUser?.uid;
            if (uid) {
                const playerRef = doc(db, "players", uid);
                const playerSnap = await getDoc(playerRef);
                const inventoryData = playerSnap.data().inventory;

                // Remove o item do baú usando UUID
                const itemIndex = inventoryData.itemsInChest.findIndex(i => i.uuid === selectedItem.dataset.uuid);
                if (itemIndex > -1) {
                    inventoryData.itemsInChest.splice(itemIndex, 1);
                }

                // Adiciona à lista de descartados
                if (!inventoryData.discardedItems) {
                    inventoryData.discardedItems = [];
                }
                
                const uniqueDiscardId = selectedItem.dataset.uuid;
                console.log(" - UUID único de descarte:", uniqueDiscardId);
                inventoryData.discardedItems.push(uniqueDiscardId);

                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                console.log(" - Item adicionado à lista de descartados");

                selectedItem = null;
                clearHighlights();
                toggleUseButton(false);
            }
        }
    });
} else {
    console.warn("Slot de descarte não encontrado no HTML.");
}


// Adiciona funcionalidade ao botão de usar

if (useButton) {
    useButton.addEventListener("click", async () => {
        console.log("Botão 'Usar' clicado");

        if (!selectedItem) {
            console.log("Nenhum item selecionado para usar.");
            return;
        }

        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const playerRef = doc(db, "players", uid);

        // CASO 1: Elixir do Poder (boost_attributes)
        if (selectedItem.dataset.effect === "boost_attributes") {
            if (currentPlayerData) {
                const boostValue = parseInt(selectedItem.dataset.value) || 100;
                currentPlayerData.luck = { total: boostValue, initial: boostValue };
                currentPlayerData.skill = { total: boostValue, initial: boostValue };
                currentPlayerData.charisma = { total: boostValue, initial: boostValue };
                currentPlayerData.magic = { total: boostValue, initial: boostValue };

                await savePlayerData(uid, currentPlayerData);

                // Consome o item no Firestore
                const playerSnap = await getDoc(playerRef);
                if (playerSnap.exists()) {
                    const inventoryData = playerSnap.data().inventory;
                    const itemIndex = inventoryData.itemsInChest.findIndex(i => i.uuid === selectedItem.dataset.uuid);
                    if (itemIndex !== -1) {
                        inventoryData.itemsInChest[itemIndex].quantity--;
                        if (inventoryData.itemsInChest[itemIndex].quantity <= 0) {
                            inventoryData.itemsInChest.splice(itemIndex, 1);
                        }
                        await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                    }
                }
                alert("Seus atributos foram aumentados para 100!");
                location.reload();
            }
        }

        // CASO 2: Bolsa de Escriba (expand_inventory) - CORRIGIDO
        else if (selectedItem.dataset.effect === "expand_inventory") {
            const expandValue = parseInt(selectedItem.dataset.value) || 2;
            const itemUUID = selectedItem.dataset.uuid;

            try {
                const playerSnap = await getDoc(playerRef);
                if (!playerSnap.exists()) return;

                const inventoryData = playerSnap.data().inventory;

                // Expande o inventário
                inventoryData.inventorySpaces = (inventoryData.inventorySpaces || 50) + expandValue;

                // Remove o item do baú pelo UUID
                const itemIndex = inventoryData.itemsInChest.findIndex(i => i.uuid === itemUUID);
                if (itemIndex > -1) {
                    inventoryData.itemsInChest.splice(itemIndex, 1);
                }

                // Adiciona à lista de descartados para não ser re-adicionado
                if (!inventoryData.discardedItems) {
                    inventoryData.discardedItems = [];
                }
                inventoryData.discardedItems.push(itemUUID);

                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

                alert(`Inventário expandido! +${expandValue} espaços adicionados.`);

            } catch (error) {
                console.error("Erro ao usar a bolsa de escriba:", error);
                alert("Ocorreu um erro ao tentar expandir o inventário.");
            }
        }

        // CASO 3: Outros Consumíveis (heal, damage, etc.)
        else if (selectedItem.dataset.consumable === 'true') {
            const itemId = selectedItem.dataset.item;
            const itemName = selectedItem.dataset.itemName;
            const effect = selectedItem.dataset.effect;
            const value = parseInt(selectedItem.dataset.value);

            console.log("Usando item consumível:", itemName, "ID:", itemId);

            // Aplica o efeito
            if (effect === "damage") {
                if (currentPlayerData && currentPlayerData.energy) {
                    currentPlayerData.energy.total -= value;
                    await savePlayerData(uid, currentPlayerData);
                }
            } else if (effect === "heal") {
                if (currentPlayerData && currentPlayerData.energy) {
                    const initialEnergy = currentPlayerData.energy.initial;
                    currentPlayerData.energy.total = Math.min(currentPlayerData.energy.total + value, initialEnergy);
                    await savePlayerData(uid, currentPlayerData);
                }
            }

            // Consome o item no Firestore
            const playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
                const inventoryData = playerSnap.data().inventory;
                const itemIndex = inventoryData.itemsInChest.findIndex(i => i.uuid === selectedItem.dataset.uuid);
                if (itemIndex !== -1) {
                    inventoryData.itemsInChest[itemIndex].quantity--;
                    if (inventoryData.itemsInChest[itemIndex].quantity <= 0) {
                        inventoryData.itemsInChest.splice(itemIndex, 1);
                    }
                    await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                }
            }
        }

        else {
            console.log("O item selecionado não é consumível.");
        }

        // Limpa a seleção da UI após o uso
        selectedItem = null;
        clearHighlights();
        toggleUseButton(false);
    });
} else {

console.warn("Botão 'Usar' não encontrado no HTML.");

}

});

// Adiciona evento de clique aos novos itens do baú

function addItemClickListener(item) {
    item.clickCount = 0;

    item.addEventListener('click', (event) => {
        if (!event.target.classList.contains('item-expand-toggle')) {
            // Reset contador de todos os outros itens
            document.querySelectorAll('.item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.clickCount = 0;
                }
            });
            
            item.clickCount++;
            
            if (item.clickCount === 1) {
                console.log("Novo item clicado no baú:", item);
                clearHighlights();
                selectedItem = item;
                item.classList.add('selected');

                const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];
                const itemData = allItemsArr.find(i => i.id === item.dataset.item);

                if (itemData && itemData.slot) {
                    document.querySelectorAll('.slot').forEach(slot => {
                        if (slot.dataset.slot === itemData.slot) {
                            slot.classList.add('highlight');
                        }
                    });
                }

                if (selectedItem.dataset.consumable === 'true') {
                    toggleUseButton(true);
                } else {
                    toggleUseButton(false);
                }
                
                updateItemPreview(item);
            } else if (item.clickCount === 2) {
                showItemActions();
                item.clickCount = 0;
            }
        }
    });

    item.addEventListener('dblclick', function(e) {
        e.preventDefault();
        showItemActions();
    });
}



function showItemActions() {
    const actionsWindow = document.getElementById('item-actions-window');
    if (actionsWindow) {
        actionsWindow.style.display = 'block';
    }
}

function hideItemActions() {
    const actionsWindow = document.getElementById('item-actions-window');
    if (actionsWindow) {
        actionsWindow.style.display = 'none';
    }
}


// Função para limpar destaques visuais

function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => {
        i.classList.remove('selected');
    });
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}


// ESTA FUNÇÃO NÃO É MAIS NECESSÁRIA, POIS O SALVAMENTO É FEITO DIRETAMENTE
// NA LÓGICA DE EQUIPAR/DESEQUIPAR. PODE SER REMOVIDA OU DEIXADA EM BRANCO.
async function saveInventoryData(uid) {
    console.log("saveInventoryData não é mais usada. O salvamento agora é direto.");
}


// ADICIONE A FUNÇÃO saveDiceState AQUI, com a correção do parêntese

async function saveDiceState(uid) {

try {

const diceState = {

collection: Array.from(document.querySelectorAll('.dice-items .dice-item')).map(die => ({

type: die.dataset.diceType,

name: die.dataset.diceName,

content: die.textContent

})),

equipped: Array.from(document.querySelectorAll('.dice-slot')).reduce((acc, slot) => {

const diceContent = slot.innerHTML !== slot.dataset.dice ? {

type: slot.dataset.dice,

name: slot.textContent

} : null;

acc[slot.dataset.dice] = diceContent;

return acc;

}, {})

};

const playerRef = doc(db, "players", uid);

await setDoc(playerRef, { diceStorage: diceState }, { merge: true });

console.log("Estado dos dados salvo com sucesso!", diceState);

} catch (error) {

console.error("Erro ao salvar estado dos dados:", error);

}

}

// Função para carregar o estado dos dados

async function loadDiceState(uid) {

try {

const playerRef = doc(db, "players", uid);

const playerSnap = await getDoc(playerRef);

if (playerSnap.exists() && playerSnap.data().diceStorage) {

const diceState = playerSnap.data().diceStorage;

loadDiceUI(diceState);

} else {

initializeDiceCollection(); // Inicializa com os dados padrão

}

} catch (error) {

console.error("Erro ao carregar estado dos dados:", error);

}

}

async function loadInventoryData(uid) {

console.log("Configurando listener em tempo real para o inventário:", uid);

try {

const playerRef = doc(db, "players", uid);

// cancela listener anterior, se existir

if (inventoryListener) {

inventoryListener();

}

inventoryListener = onSnapshot(playerRef, async (docSnap) => {

// se não existir inventário, inicializa com padrão

if (!docSnap.exists() || !docSnap.data().inventory) {

const initialInventoryData = {
    itemsInChest: initialItems.map(item => ({ ...item })),
    equippedItems: {
        weapon: null, armor: null, helmet: null, amulet: null,
        shield: null, gloves: null, ring: null, boots: null
    },
    weaponAmmoCounts: {},
    inventorySpaces: 50
};


await setDoc(playerRef, { inventory: initialInventoryData }, { merge: true });

console.log("Inventário inicializado com os itens padrão.");

return;

}

const inventoryData = docSnap.data().inventory;

// ADICIONA ITENS EXTRAS NOVOS

let inventoryUpdated = false;

for (const extraItem of extraItems) {

// Para munição, verifica se já existe QUALQUER item de mesmo id no inventário

if (extraItem.id === "municao-38") {

const existsAny = inventoryData.itemsInChest.some(item => item.id === "municao-38");

if (existsAny) continue;

}

const existsInChest = inventoryData.itemsInChest.some(item => item.uuid === extraItem.uuid);

const isEquipped = Object.values(inventoryData.equippedItems).includes(extraItem.content);

const wasDiscarded = inventoryData.discardedItems?.includes(extraItem.uuid);

if (!existsInChest && !isEquipped && !wasDiscarded) {

console.log(`➕ ADICIONANDO NOVO ITEM EXTRA: ${extraItem.id}`);

inventoryData.itemsInChest.push({ ...extraItem });

inventoryUpdated = true;

}

}

// Sempre filtra munições de 38 com quantidade <= 0

inventoryData.itemsInChest = inventoryData.itemsInChest.filter(item => {

if (item.id === "municao-38" && item.quantity <= 0) return false;

return true;

});

if (inventoryUpdated) {

await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

console.log("Novos itens extras adicionados e munições zeradas filtradas.");

}

console.log("INVENTÁRIO ATUALIZADO EM TEMPO REAL!");

loadInventoryUI(inventoryData);

updateCharacterCouraca();

updateCharacterDamage();

}, (error) => {

console.error("Erro no listener do inventário:", error);

});

} catch (error) {

console.error("Erro ao configurar listener do inventário:", error);

}

}

function loadInventoryUI(inventoryData) {

console.log("--- [LOAD UI] --- Iniciando redesenho do inventário com dados do Firestore:", inventoryData);

const chestElement = document.querySelector('.items');
chestElement.innerHTML = ""; // Limpa o conteúdo atual

const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

const largeItemElements = [];
const smallItemElements = [];

inventoryData.itemsInChest.forEach(dbItem => {
    const fullItemData = allItemsArr.find(localItem => localItem.id === dbItem.id);
    if (!fullItemData) {
        console.warn(`[LOAD UI] Item com id "${dbItem.id}" não encontrado nos catálogos locais. Pulando.`);
        return;
    }

    const newItem = document.createElement('div');
    newItem.classList.add('item');
    if (fullItemData.large) {
        newItem.classList.add('large');
    }

    newItem.dataset.item = fullItemData.id;
    if (!dbItem.uuid) {
        dbItem.uuid = crypto.randomUUID();
    }
    newItem.dataset.uuid = dbItem.uuid;
    newItem.dataset.itemName = fullItemData.content;

    if (fullItemData.energia) {
        newItem.dataset.energia = JSON.stringify(fullItemData.energia);
    }

    let energiaHTML = "";
    if (fullItemData.energia) {
        const porcentagem = (fullItemData.energia.total / fullItemData.energia.inicial) * 100;
        let cor = "#4CAF50";
        if (porcentagem <= 50) cor = "#FFA500";
        if (porcentagem <= 25) cor = "#FF0000";
        energiaHTML = `
            <div class="item-energy-bar">
                <div class="item-energy-fill" style="width: ${porcentagem}%; background-color: ${cor};"></div>
                <span class="item-energy-text">${fullItemData.energia.total}/${fullItemData.energia.inicial}</span>
            </div>
        `;
    }

    let itemHTML = `<img src="${fullItemData.thumbnailImage || fullItemData.image}" alt="${fullItemData.content}" />${energiaHTML}`;

    if (fullItemData.consumable || fullItemData.projectile) {
        const quantity = dbItem.quantity || fullItemData.quantity;
        newItem.dataset.quantity = quantity;
        if (fullItemData.consumable) {
            newItem.dataset.consumable = 'true';
            if (fullItemData.effect) newItem.dataset.effect = fullItemData.effect;
            if (fullItemData.value) newItem.dataset.value = fullItemData.value;
        }
        if (fullItemData.projectile) {
            newItem.dataset.projectile = 'true';
        }
        if (quantity > 0) {
            itemHTML += `<span class="item-quantity">${quantity}</span>`;
        }
    }

    if (fullItemData.ammoType) {
        const savedAmmo = inventoryData.weaponAmmoCounts[fullItemData.content] || 0;
        if (savedAmmo > 0) {
            itemHTML += `<span class="weapon-ammo">${savedAmmo}</span>`;
        }
    }

    newItem.innerHTML = itemHTML;

    if (fullItemData.large) {
        largeItemElements.push(newItem);
    } else {
        smallItemElements.push(newItem);
    }

    addItemClickListener(newItem);
});

// Adiciona os itens ordenados ao DOM para otimizar o preenchimento da grade
largeItemElements.forEach(item => chestElement.appendChild(item));
smallItemElements.forEach(item => chestElement.appendChild(item));


// Adiciona slots vazios para mostrar espaços expandidos
const inventorySpaces = inventoryData.inventorySpaces || 50;

// Calcula espaço ocupado considerando itens grandes
const occupiedSpace = largeItemElements.length * 2 + smallItemElements.length;
const emptySlotsCount = Math.max(0, inventorySpaces - occupiedSpace);

for (let i = 0; i < emptySlotsCount; i++) {
    const emptySlot = document.createElement('div');
    emptySlot.classList.add('item', 'empty-slot');
    chestElement.appendChild(emptySlot);
}


// Carrega itens equipados
document.querySelectorAll('.slot').forEach(slot => {
const equippedItemName = inventoryData.equippedItems[slot.id];
    const item = allItemsArr.find(i => i.content === equippedItemName);

    if (item) {
       let slotHTML = `<img src="${item.thumbnailImage || item.image}" alt="${item.content}" />`;

        slot.dataset.itemName = item.content;
        if (slot.dataset.slot === "weapon" && item.twoHanded) {
    slot.classList.add('two-handed');
} else if (slot.dataset.slot === "weapon") {
    slot.classList.remove('two-handed');
}

        // Adiciona classe two-handed para armas de duas mãos
if (slot.dataset.slot === "weapon" && item.twoHanded) {
    slot.classList.add('two-handed');
} else {
    slot.classList.remove('two-handed');
}


       // **LÓGICA DE MUNIÇÃO CORRIGIDA**
if (slot.dataset.slot === "weapon" && item.ammoType) {
    const loadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
    slotHTML = `<img src="${item.thumbnailImage || item.image}" alt="${item.content}" />`;
    if (loadedAmmo > 0) {
        slotHTML += `<span class="slot-weapon-ammo">${loadedAmmo}</span>`;
    }
}

        
        slot.innerHTML = slotHTML;

        // Limpa dados antigos e define os novos se o item for consumível
        delete slot.dataset.consumable;
        delete slot.dataset.quantity;
        delete slot.dataset.effect;
        delete slot.dataset.value;

if (inventoryData.equippedItems[slot.id + '_consumable']) {
            slot.dataset.consumable = 'true';
            slot.dataset.quantity = inventoryData.equippedItems[slot.dataset.slot + '_quantity'];
            if (inventoryData.equippedItems[slot.dataset.slot + '_effect']) {
                slot.dataset.effect = inventoryData.equippedItems[slot.dataset.slot + '_effect'];
            }
            if (inventoryData.equippedItems[slot.dataset.slot + '_value']) {
                slot.dataset.value = inventoryData.equippedItems[slot.dataset.slot + '_value'];
            }
        }
    } else {
        slot.innerHTML = slot.dataset.slot;
        delete slot.dataset.itemName;
        delete slot.dataset.consumable;
        delete slot.dataset.quantity;
        delete slot.dataset.effect;
        delete slot.dataset.value;
    }
});

// Adiciona classe 'equipped' aos slots que têm itens
document.querySelectorAll('.slot').forEach(slot => {
const equippedItemName = inventoryData.equippedItems[slot.id];
    if (equippedItemName) {
        slot.classList.add('equipped');
    } else {
        slot.classList.remove('equipped');
    }
});

updateSlotCompatibility();
// reorganizeGrid();
}


function loadDiceUI(diceState) {

const diceCollection = document.querySelector('.dice-items');

const slots = document.querySelectorAll('.dice-slot');

// Limpa a coleção e slots

diceCollection.innerHTML = '';

slots.forEach(slot => {

slot.innerHTML = slot.dataset.dice;

});

// Carrega dados da coleção

if (diceState.collection && Array.isArray(diceState.collection)) {

diceState.collection.forEach(dice => {

const diceElement = document.createElement('div');

diceElement.className = 'dice-item';

diceElement.dataset.diceType = dice.type;

diceElement.dataset.diceName = dice.name;

diceElement.textContent = dice.name;

diceCollection.appendChild(diceElement);

diceElement.addEventListener('click', () => handleDiceClick(diceElement));

});

}

// Carrega dados equipados

if (diceState.equipped) {

Object.entries(diceState.equipped).forEach(([slotType, diceData]) => {

if (diceData) {

const slot = document.querySelector(`.dice-slot[data-dice="${slotType}"]`);

if (slot) {

slot.textContent = diceData.name;

}

}

});

}

}

async function getPlayerData(uid) {

try {

const playerRef = doc(db, "players", uid);

const playerSnap = await getDoc(playerRef);

if (playerSnap.exists()) {

const data = playerSnap.data();

// Armazena a energia inicial se ainda não estiver definida

if (data.energy && !data.energy.initial) {

data.energy.initial = data.energy.total;

await setDoc(playerRef, data, { merge: true }); // Salva a energia inicial

console.log("Energia inicial do jogador definida como:", data.energy.total);

}

return data;

} else {

return null;

}

} catch (error) {

console.error("Erro ao recuperar os dados do jogador:", error);

return null;

}

}

// Função para atualizar o valor da Couraça na ficha do personagem

// Função para atualizar o valor da Couraça na ficha do personagem
async function updateCharacterCouraca() {
    const couracaElement = document.getElementById("char-couraca");
    if (!couracaElement) return;

    let baseCouraca = 0; // Valor base da couraça
    let bonusCouraca = 0;

    const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

    // Verifica o item equipado no slot de armadura
    const armorSlot = document.querySelector('.slot[data-slot="armor"]');
    if (armorSlot && armorSlot.dataset.itemName) {
        const equippedArmorName = armorSlot.dataset.itemName;
        const armorData = allItemsArr.find(item => item.content === equippedArmorName);
        if (armorData && armorData.defense) {
            bonusCouraca += armorData.defense;
        }
    }

    // Verifica o item equipado no slot de botas
    const bootsSlot = document.querySelector('.slot[data-slot="boots"]');
    if (bootsSlot && bootsSlot.dataset.itemName) {
        const equippedBootsName = bootsSlot.dataset.itemName;
        const bootsData = allItemsArr.find(item => item.content === equippedBootsName);
        if (bootsData && bootsData.defense) {
            bonusCouraca += bootsData.defense;
        }
    }

    // Verifica o item equipado no slot de escudo
    const shieldSlot = document.querySelector('.slot[data-slot="shield"]');
    if (shieldSlot && shieldSlot.dataset.itemName) {
        const equippedShieldName = shieldSlot.dataset.itemName;
        const shieldData = allItemsArr.find(item => item.content === equippedShieldName);
        if (shieldData && shieldData.defense) {
            bonusCouraca += shieldData.defense;
        }
    }

    // Verifica o item equipado no slot de capacete
const helmetSlot = document.querySelector('.slot[data-slot="helmet"]');
if (helmetSlot && helmetSlot.dataset.itemName) {
    const equippedHelmetName = helmetSlot.dataset.itemName;
    const helmetData = allItemsArr.find(item => item.content === equippedHelmetName);
    if (helmetData && helmetData.defense) {
        bonusCouraca += helmetData.defense;
    }
}


    // Bônus de itens equipados (sistema novo)
    const equipBonuses = calculateEquippedBonuses();
    bonusCouraca += equipBonuses.couraca;

    const totalCouraca = baseCouraca + bonusCouraca;
    couracaElement.innerText = totalCouraca;
    document.getElementById("char-couraca-info").innerText = totalCouraca;

    console.log("Valor total da couraça:", totalCouraca);

    // Atualiza o campo 'couraca' no Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
        const playerRef = doc(db, "players", uid);
        try {
            await updateDoc(playerRef, { couraca: totalCouraca });
            console.log("Campo 'couraca' atualizado no Firestore para:", totalCouraca);
        } catch (error) {
            console.error("Erro ao atualizar o campo 'couraca' no Firestore:", error);
        }
    }
}


async function updateCharacterDamage() {

const weaponSlot = document.querySelector(".slot[data-slot='weapon']");

const damageDisplay = document.querySelector("#char-dano");

// Não atualize o campo 'dano' no Firestore aqui!

let newDamageValue = "1"; // Valor padrão desarmado

if (weaponSlot && weaponSlot.dataset.itemName) {

const equippedWeaponName = weaponSlot.dataset.itemName.replace(/\s*\(\d+\/\d+\)$/, "");

const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

const weaponData = allItemsArr.find(item => item.content === equippedWeaponName);

if (weaponData && weaponData.damage) {

newDamageValue = weaponData.damage;

}

}

if (damageDisplay) damageDisplay.textContent = newDamageValue;
    document.getElementById("char-dano-info").textContent = newDamageValue;


// NÃO atualize o campo 'dano' no Firestore!

}

// Função para calcular bônus de itens equipados
function calculateEquippedBonuses() {
    const bonuses = {
        couraca: 0,
        skill: 0,
        charisma: 0,
        magic: 0,
        luck: 0,
        energy: 0  // ADICIONE ESTA LINHA

    };

    const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];
    
    // Verifica todos os slots equipados
    document.querySelectorAll('.slot').forEach(slot => {
const equippedItemName = slot.dataset.itemName;
        if (equippedItemName) {
            const itemData = allItemsArr.find(item => item.content === equippedItemName);
            if (itemData && itemData.bonuses) {
                Object.keys(itemData.bonuses).forEach(attribute => {
                    if (bonuses.hasOwnProperty(attribute)) {
                        bonuses[attribute] += itemData.bonuses[attribute];
                    }
                });
            }
        }
    });

    return bonuses;
}


function updateSlotCompatibility() {
    const weaponSlot = document.querySelector('.slot[data-slot="weapon"]');
    const shieldSlot = document.querySelector('.slot[data-slot="shield"]');
    
    if (!weaponSlot || !shieldSlot) return;
    
    const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];
    const equippedWeaponName = weaponSlot.dataset.itemName;
    
    if (equippedWeaponName) {
        const weaponData = allItemsArr.find(item => item.content === equippedWeaponName);
        if (weaponData && weaponData.twoHanded) {
            shieldSlot.classList.add('blocked');
        } else {
            shieldSlot.classList.remove('blocked');
        }
    } else {
        shieldSlot.classList.remove('blocked');
    }
}


// Adicione esta função após a função updateCharacterDamage

function calculateLevel(experience) {

// Base de experiência para cada nível (aumenta exponencialmente)

const baseXP = 100;

const exponent = 1.5;

// Se não tiver experiência, é nível 1

if (!experience || experience <= 0) return { level: 1, currentXP: 0, nextLevelXP: baseXP };

// Calcula o nível atual

let level = 1;

let xpForNextLevel = baseXP;

while (experience >= xpForNextLevel) {

level++;

// Próximo nível requer mais XP

xpForNextLevel += Math.floor(baseXP * Math.pow(level, exponent));

}

// Calcula XP para o próximo nível

const xpForCurrentLevel = xpForNextLevel - Math.floor(baseXP * Math.pow(level, exponent));

const currentLevelXP = experience - xpForCurrentLevel;

const xpNeeded = xpForNextLevel - xpForCurrentLevel;

const progress = currentLevelXP / xpNeeded;

return {

level,

currentXP: experience,

nextLevelXP: xpForNextLevel,

currentLevelXP,

xpNeeded,

progress

};

}

// Inicializa e carrega o inventário ao iniciar

document.addEventListener("DOMContentLoaded", () => {

onAuthStateChanged(auth, async (user) => {

if (user) {

console.log("Usuário autenticado:", user.uid);

// Carrega dados básicos e inicializa a ficha

currentPlayerData = await getPlayerData(user.uid);

if (currentPlayerData) {

updateCharacterSheet(currentPlayerData);

initializeGameTime(currentPlayerData);

}

// CONFIGURA OS DOIS LISTENERS

await setupPlayerDataListener(user.uid);

await loadInventoryData(user.uid);

// ── AQUI: configurar exibição do botão "carregar munição" ──

const carregarBtn = document.getElementById("carregar-municao-btn");

const playerRef = doc(db, "players", user.uid);

getDoc(playerRef).then(playerSnap => {

if (!playerSnap.exists()) {

carregarBtn.style.display = "none";

return;

}

const inventoryData = playerSnap.data().inventory;

let equippedWeaponName = inventoryData.equippedItems.weapon; // Alterado para let

if (!equippedWeaponName) {

carregarBtn.style.display = "none";

return;

}

// Remove o sufixo de munição para encontrar o item base

equippedWeaponName = equippedWeaponName.replace(/\s*\(\d+\/\d+\)$/, "");

// encontra no catálogo o tipo de munição dessa arma

const allItemsArr = [...initialItems, ...extraItems, ...itensNarrativas];

const weaponData = allItemsArr.find(item =>

item.content === equippedWeaponName && item.ammoType

);

if (!weaponData) {

carregarBtn.style.display = "none";

return;

}

// verifica se há munição compatível no baú

const temMunicao = inventoryData.itemsInChest

.some(item => item.id === weaponData.ammoType && item.quantity > 0);

if (temMunicao) {

carregarBtn.style.display = "block";

carregarBtn.onclick = carregarMunicaoNaArma;

} else {

carregarBtn.style.display = "none";

}

});

// ──────────────────────────────────────────────────────────────

await loadDiceState(user.uid);

} else {

console.log("Nenhum usuário autenticado. Redirecionando...");

window.location.href = "index.html";

}

});

});

// Função para inicializar o sistema de tempo

function initializeGameTime(playerData) {

// Se não existir timestamp inicial, cria um

if (!playerData.gameTime) {

playerData.gameTime = {

startTimestamp: Date.now(),

currentDay: 1

};

}

// Atualiza o dia atual baseado no tempo decorrido

updateGameDay(playerData);

// Inicia o intervalo para atualizar o tempo

setInterval(() => updateGameDay(playerData), 60000); // Verifica a cada minuto

}

// Função para atualizar o dia do jogo

async function updateGameDay(playerData) {

const now = Date.now();

const startTime = playerData.gameTime.startTimestamp;

const elapsedRealSeconds = (now - startTime) / 1000;

const elapsedGameDays = Math.floor(elapsedRealSeconds / REAL_SECONDS_PER_GAME_DAY);

const newDay = elapsedGameDays + 1; // +1 porque começamos no dia 1

if (newDay !== playerData.gameTime.currentDay) {

playerData.gameTime.currentDay = newDay;

document.getElementById("char-day").innerText = newDay;

// Salva o novo dia no Firestore

try {

const uid = auth.currentUser?.uid;

if (uid) {

const playerRef = doc(db, "players", uid);

await updateDoc(playerRef, {

'gameTime.currentDay': newDay,

'gameTime.startTimestamp': startTime

});

console.log("Dia do jogo atualizado para:", newDay);

}

} catch (error) {

console.error("Erro ao salvar o dia do jogo:", error);

}

}

}

// 📌 Atualizar os dados da ficha de personagem ao carregar e barra de hp

// Modifique a função updateCharacterSheet para incluir a experiência

function updateCharacterSheet(playerData) {
    if (!playerData) return;

    document.getElementById("char-name").innerText = playerData.name || "-";
    document.getElementById("char-name-display").innerText = playerData.name || "Nome do Personagem";
    document.getElementById("char-race").innerText = playerData.race || "-";
    document.getElementById("char-class").innerText = playerData.class || "-";
    document.getElementById("char-alignment").innerText = playerData.alignment || "-";

    // Atualiza o painel de informações
    document.getElementById("char-day-info").innerText = playerData.gameTime?.currentDay ?? 1;
    document.getElementById("char-po-info").innerText = playerData.po || "0";
    document.getElementById("char-class-info").innerText = playerData.class || "-";
    document.getElementById("char-race-info").innerText = playerData.race || "-";
    document.getElementById("char-alignment-info").innerText = playerData.alignment || "-";
    document.getElementById("char-age-info").innerText = playerData.idade;
    console.log("Valor de maoDominante:", playerData.maoDominante);
    const handText = playerData.maoDominante === "esquerda" ? "Canhoto" : 
                     playerData.maoDominante === "direita" ? "Destro" : "-";
    document.getElementById("char-hand-info").innerText = handText;
    document.getElementById("char-hemisphere-info").innerText = playerData.hemisferioDominante || "-";

    // Calcula bônus de itens equipados
    const equipBonuses = calculateEquippedBonuses();

    // Atributos base + bônus de equipamentos
    document.getElementById("char-skill-info").innerText = (playerData.skill?.total ?? 0) + equipBonuses.skill;
    document.getElementById("char-charisma-info").innerText = (playerData.charisma?.total ?? 0) + equipBonuses.charisma;
    document.getElementById("char-magic-info").innerText = (playerData.magic?.total ?? 0) + equipBonuses.magic;
    document.getElementById("char-luck-info").innerText = (playerData.luck?.total ?? 0) + equipBonuses.luck;
    document.getElementById("char-couraca-info").innerText = playerData.couraca || "0";


    // Atualiza o portrait
    const portraitImage = document.getElementById("portrait-image");
    if (portraitImage) {
        portraitImage.src = "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/portraits/portrait1.png";
        portraitImage.style.display = 'block';
    }



// --- Início do Bloco de Idade Robusto ---

// Função auxiliar para gerar um número inteiro aleatório entre min e max (inclusive)

function getRandomInt(min, max) {

min = Math.ceil(min);

max = Math.floor(max);

return Math.floor(Math.random() * (max - min + 1)) + min;

}

// Verifica se a idade do jogador NÃO é um número. Isso corrige personagens com a string errada ou sem idade.

if (typeof playerData.idade !== 'number') {

let newAge = 20; // Idade padrão caso a lógica abaixo falhe

// Se a idade for uma string (como "Adepto (45-60 anos)"), tenta extrair a faixa etária

if (typeof playerData.idade === 'string') {

// Procura por um padrão como "(XX-YY anos)"

const matches = playerData.idade.match(/\((\d+)-(\d+)\s*anos\)/);

if (matches && matches.length === 3) {

const minAge = parseInt(matches[1], 10);

const maxAge = parseInt(matches[2], 10);

// Gera uma idade aleatória dentro da faixa encontrada

newAge = getRandomInt(minAge, maxAge);

}

}

// Define a idade corrigida para o personagem

playerData.idade = newAge;

// Salva a idade correta (numérica) no Firestore para não precisar fazer isso de novo

const uid = auth.currentUser?.uid;

if (uid) {

const playerRef = doc(db, "players", uid);

updateDoc(playerRef, { idade: playerData.idade });

console.log(`Idade do personagem corrigida para: ${playerData.idade}`);

}

}

// Atualiza o elemento HTML com a idade correta (agora garantido que é um número)

document.getElementById("char-idade").innerText = playerData.idade;

// --- Fim do Bloco de Idade Robusto ---

// Atualiza energia e barra de HP

const energyTotal = playerData.energy?.total ?? 0;

const energyInitial = playerData.energy?.initial ?? 0;

// Atualiza o texto da energia

document.getElementById("char-energy").innerText = `${energyTotal}/${energyInitial}`;

// Atualiza a barra de HP

const barraHP = document.getElementById("barra-hp-inventario");

if (barraHP && energyInitial > 0) {

const porcentagem = Math.max(0, (energyTotal / energyInitial) * 100);

barraHP.style.width = `${porcentagem}%`;

}

// Atualiza a experiência e nível

const experience = playerData.experience || 0;

const levelInfo = calculateLevel(experience);

document.getElementById("char-level").innerText = levelInfo.level;

document.getElementById("char-xp").innerText = `${experience}/${levelInfo.nextLevelXP}`;
document.getElementById("char-level-info").innerText = levelInfo.level;

// Atualiza a barra de XP

const barraXP = document.getElementById("barra-xp-inventario");

if (barraXP) {

barraXP.style.width = `${levelInfo.progress * 100}%`;

}

// Restante dos atributos

document.getElementById("char-skill").innerText = playerData.skill?.total ?? "-";

document.getElementById("char-charisma").innerText = playerData.charisma?.total ?? "-";

document.getElementById("char-magic").innerText = playerData.magic?.total ?? "-";

document.getElementById("char-luck").innerText = playerData.luck?.total ?? "-";

document.getElementById("char-couraca").innerText = playerData.couraca || "0";

document.getElementById("char-hand").innerText = playerData.maoDominante || "-";

document.getElementById("char-hemisphere").innerText = playerData.hemisferioDominante || "-";

// Atualiza o dia

document.getElementById("char-day").innerText = playerData.gameTime?.currentDay ?? 1;

}

// Nova função para salvar os dados do jogador (além do inventário)

async function savePlayerData(uid, playerData) {

try {

const playerRef = doc(db, "players", uid);

await setDoc(playerRef, playerData, { merge: true });

console.log("Dados do jogador salvos com sucesso!");

// -------------------- CONDIÇÃO DE MORTE (AGORA GERAL) --------------------

if (playerData.energy && playerData.energy.total <= 0) {

alert("Seu personagem morreu! Game Over.");

console.log("GAME OVER: Energia chegou a 0 ou menos.");

// Aqui você pode adicionar mais lógica de game over, se necessário.

}

// ----------------------------------------------------------------------

} catch (error) {

console.error("Erro ao salvar os dados do jogador:", error);

}
// Sistema de expansão/recolhimento
let isExpanded = false;

setTimeout(function() {
    const expandBtn = document.getElementById('expand-btn');
    const container = document.querySelector('.container');
    
    if (expandBtn && container) {
        expandBtn.addEventListener('click', function() {
            console.log('Botão clicado!');
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                container.classList.add('expanded');
                console.log('Expandindo...');
            } else {
                container.classList.remove('expanded');
                console.log('Recolhendo...');
            }
        });
        console.log('Event listener adicionado ao botão');
    } else {
        console.log('Botão ou container não encontrado');
    }
}, 1000);


}
