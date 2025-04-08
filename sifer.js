// sifer.js - Sistema de Ferretear (SIFER)

function ativarSIFER(jogador, monstro) {
    const rolagem = rolarD20();
    let resultado = {
        local: '',
        danoExtra: 0,
        mensagem: '',
        fimDaBatalha: false
    };

    switch (true) {
        case (rolagem >= 1 && rolagem <= 5):
            resultado.local = "Membros Inferiores";
            resultado.danoExtra = rolarDano() / 2;
            resultado.mensagem = "Acerto nas pernas! +1/2 dano.";
            break;
        case (rolagem === 6):
            resultado.local = "Costas";
            resultado.danoExtra = rolarDano();
            resultado.mensagem = "Acerto nas costas! +1 dano.";
            break;
        case (rolagem >= 7 && rolagem <= 10):
            resultado.local = "Membros Ofensivos";
            resultado.danoExtra = rolarDano() / 2;
            resultado.mensagem = "Acerto nos braços! +1/2 dano.";
            break;
        case (rolagem >= 11 && rolagem <= 16):
            resultado.local = "Abdômen/Tórax";
            resultado.danoExtra = rolarDano() / 2;
            resultado.mensagem = "Acerto no tronco! +1/2 dano.";
            break;
        case (rolagem === 17):
            resultado.local = "Coração";
            resultado.danoExtra = rolarDano();
            resultado.mensagem = "Acerto no coração! Monstro lembrará de você.";
            monstro.fugirAoVerJogador = jogador.habilidade < monstro.habilidade;
            break;
        case (rolagem === 18):
            resultado.local = "Olhos";
            resultado.danoExtra = rolarDano();
            resultado.mensagem = "Acerto nos olhos! Monstro se rende.";
            if (jogador.carisma > monstro.carisma) {
                resultado.fimDaBatalha = true;
            }
            break;
        case (rolagem === 19):
            resultado.local = "Pescoço";
            resultado.danoExtra = rolarDano();
            resultado.mensagem = "Acerto no pescoço! Decapitação!";
            resultado.fimDaBatalha = true;
            break;
        case (rolagem === 20):
            resultado.local = "Cabeça";
            resultado.danoExtra = rolarDano();
            resultado.mensagem = "Acerto na cabeça! Decapitação!";
            resultado.fimDaBatalha = true;
            break;
    }

    return resultado;
}

function rolarD20() {
    return Math.floor(Math.random() * 20) + 1;
}

function rolarDano() {
    // Personalize aqui o dado de dano, exemplo: 1d8
    return Math.floor(Math.random() * 8) + 1;
}

function aplicarEfeitosSIFER(resultado) {
    adicionarAoLog(resultado.mensagem);
    aplicarDanoExtra(resultado.danoExtra);
    if (resultado.fimDaBatalha) encerrarBatalha();
}

function adicionarAoLog(texto) {
    const log = document.getElementById("battle-log-content");
    const linha = document.createElement("p");
    linha.textContent = texto;
    log.appendChild(linha);
}

function aplicarDanoExtra(dano) {
    // A função original de dano no monstro será usada aqui
    // Exemplo: reduzirVidaMonstro(dano);
    console.log(`Dano extra do SIFER: ${dano}`);
}

function encerrarBatalha() {
    // Aqui você pode chamar o mesmo código que usaria para o fim de batalha normal
    adicionarAoLog("A batalha terminou com um golpe SIFER!");
}
