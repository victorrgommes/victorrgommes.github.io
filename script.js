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
                        <div class="card-header">
                            <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            <h3>${repo.name}</h3>
                        </div>
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