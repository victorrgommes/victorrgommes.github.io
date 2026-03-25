// Configuração de usuário do GitHub (coloque seu username abaixo ou via localStorage)
const defaultUsername = 'victorrgommes';
const storedUser = localStorage.getItem('githubUsername');
const githubUsername = storedUser || defaultUsername;
const reposContainer = document.getElementById('github-repos');

function exibirMensagem(texto, isError = false) {
    reposContainer.innerHTML = `<p style="color: ${isError ? '#ff6b6b' : '#94a3b8'};">${texto}</p>`;
}

function mostrarCarregando() {
    reposContainer.innerHTML = '<p style="color: #94a3b8;">Carregando projetos automáticos direto do GitHub...</p>';
}

async function carregarRepositorios() {
    try {
        mostrarCarregando();
        // Faz a requisição para a API pública do GitHub
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc`);
        
        // Converte a resposta para JSON
        const repos = await response.json();

        // Limpa a mensagem de "Carregando..."
        reposContainer.innerHTML = '';

        // Verifica se o usuário existe ou se tem repositórios
        if (repos.message === "Not Found" || repos.length === 0) {
            reposContainer.innerHTML = '<p>Nenhum repositório encontrado ou usuário incorreto.</p>';
            return;
        }

        // Pega apenas os 6 projetos mais recentes
        const projetosRecentes = repos.slice(0, 6);

        projetosRecentes.forEach(repo => {
            // Ignora repositórios que são apenas cópias (forks)
            if (!repo.fork) {
                const card = document.createElement('div');
                card.className = 'card';
                
                // Formata a data de atualização
                const dataAtualizacao = new Date(repo.updated_at).toLocaleDateString('pt-BR');

                // Monta o visual do Card
                card.innerHTML = `
                    <div>
                        <h3>${repo.name}</h3>
                        <p>${repo.description || 'Nenhuma descrição fornecida para este projeto.'}</p>
                        <small style="color: var(--text-color); opacity: 0.7;">Último commit: ${dataAtualizacao}</small>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="btn">Ver Código-Fonte</a>
                `;
                
                // Adiciona o Card na página
                reposContainer.appendChild(card);
            }
        });
    } catch (error) {
        reposContainer.innerHTML = '<p style="color: #ff4444;">Erro ao sincronizar com o GitHub no momento. Verifique sua conexão.</p>';
        console.error('Erro de conexão com o GitHub:', error);
    }
}

// Executa a função
carregarRepositorios();