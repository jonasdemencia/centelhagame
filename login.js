// Simulação de banco de dados com usuários e senhas
const users = {
    "jogadorA": "senha123",
    "jogadorB": "senha456"
};

// Função para processar o login
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita o recarregamento da página
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Verifica se o usuário e senha estão corretos
    if (users[username] && users[username] === password) {
        document.getElementById("message").innerText = "Login bem-sucedido!";
        // Redireciona para a página de batalha (coloque o nome da página que deseja usar)
        window.location.href = "batalha.html";
    } else {
        document.getElementById("message").innerText = "Usuário ou senha inválidos!";
    }
});
