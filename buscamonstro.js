document.getElementById('verificarBtn').addEventListener('click', verificarPerfil);

function verificarPerfil() {
  const username = document.getElementById('username').value.trim();
  const resultado = document.getElementById('resultado');

  if (!username) {
    resultado.textContent = 'Digite um nome de perfil válido.';
    return;
  }

  resultado.textContent = 'Verificando...';

  // Técnica leve: tentar carregar a imagem de perfil
  const testImg = new Image();
  testImg.src = `https://www.instagram.com/${username}/media`;

  testImg.onload = () => {
    resultado.innerHTML = `✅ Perfil <strong>@${username}</strong> encontrado!`;
  };

  testImg.onerror = () => {
    resultado.innerHTML = `❌ Perfil <strong>@${username}</strong> não encontrado.`;
  };
}
