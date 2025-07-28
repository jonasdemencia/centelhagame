document.getElementById('verificarBtn').addEventListener('click', buscamonstro);

async function verificarPerfil() {
  const username = document.getElementById('username').value.trim();
  const resultado = document.getElementById('resultado');

  if (!username) {
    resultado.textContent = 'Digite um nome de perfil válido.';
    return;
  }

  resultado.textContent = 'Verificando...';

  try {
    const response = await fetch(`https://www.instagram.com/${username}/`, {
      method: 'GET',
      mode: 'no-cors'
    });

    // Como `no-cors` não permite inspecionar `response.status`,
    // vamos tentar uma verificação alternativa com imagem de perfil pública
    const img = new Image();
    img.src = `https://instagram.com/${username}/favicon.ico`;
    img.onload = () => {
      resultado.innerHTML = `✅ Perfil <strong>@${username}</strong> encontrado!`;
    };
    img.onerror = () => {
      resultado.innerHTML = `❌ Perfil <strong>@${username}</strong> não encontrado.`;
    };

  } catch (error) {
    resultado.textContent = '⚠️ Não foi possível verificar o perfil (restrição do Instagram ou navegador).';
  }
}
