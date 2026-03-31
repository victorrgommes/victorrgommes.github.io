// Configuração de usuário do GitHub (coloque seu username abaixo ou via localStorage)
const defaultUsername = 'victorrgommes';
const storedUser = localStorage.getItem('githubUsername');
const githubUsername = storedUser || defaultUsername;
const reposContainer = document.getElementById('github-repos');
const newsContainer = document.getElementById('news-cards');

// Função auxiliar para evitar XSS ao injetar dados externos no DOM
function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

async function carregarRepositorios() {
    try {
        // Verifica cache primeiro para evitar limite de requisições do GitHub (Rate Limit)
        const cacheKey = `repos_${githubUsername}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        let repos = [];

        if (cachedData) {
            repos = JSON.parse(cachedData);
        } else {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc`);
            repos = await response.json();
            
            // Só salva no cache se for um array válido
            if (response.ok && Array.isArray(repos)) {
                sessionStorage.setItem(cacheKey, JSON.stringify(repos));
            }
        }

        // Limpa os Skeletons fixos originais da página web
        reposContainer.innerHTML = '';

        if (repos.message === "Not Found" || !Array.isArray(repos) || repos.length === 0) {
            reposContainer.innerHTML = '<p>Nenhum repositório encontrado ou usuário incorreto.</p>';
            return;
        }

        const projetosRecentes = repos.slice(0, 6);
        const fragment = document.createDocumentFragment();

        projetosRecentes.forEach(repo => {
            if (!repo.fork) {
                const card = document.createElement('article'); // Melhor semântica
                card.className = 'card';
                
                const dataAtualizacao = new Date(repo.updated_at).toLocaleDateString('pt-BR');

                card.innerHTML = `
                    <div>
                        <div class="card-header">
                            <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            <h3>${escapeHTML(repo.name)}</h3>
                        </div>
                        <p>${escapeHTML(repo.description) || 'Nenhuma descrição fornecida para este projeto.'}</p>
                        <small style="color: var(--text-color); opacity: 0.7;">Último commit: ${dataAtualizacao}</small>
                    </div>
                    <a href="${escapeHTML(repo.html_url)}" target="_blank" class="btn btn-external">Ver Código-Fonte <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>
                `;
                
                fragment.appendChild(card);
            }
        });

        reposContainer.appendChild(fragment);
    } catch (error) {
        reposContainer.innerHTML = '<p style="color: #ff4444;">Erro ao sincronizar com o GitHub no momento. Verifique sua conexão.</p>';
        console.error('Erro de conexão com o GitHub:', error);
    }
}

// Executa a função
async function carregarNoticias() {
    if (!newsContainer) return; // Se o container não existir, não faz nada

    // Mantemos os Skeletons definidos no HTML renderizando, para uma sensação melhor
    // de que o conteúdo está carregando dinamicamente e já tem espaço na tela

    try {
        // Usamos um feed de notícias sobre cibersegurança e o convertemos para JSON
        const feedUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ftecnoblog.net%2Ffeed%2F';
        const response = await fetch(feedUrl);
        const data = await response.json();

        if (data.status !== 'ok' || data.items.length === 0) {
            newsContainer.innerHTML = '<p style="color: #ff6b6b; text-align: center; width: 100%;">Não foi possível carregar as notícias no momento.</p>';
            return;
        }

        newsContainer.innerHTML = ''; // Limpa os esqueletos

        const articles = data.items.slice(0, 4); // Pega os 4 primeiros artigos

        const fragment = document.createDocumentFragment();

        articles.forEach(article => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            // Limpa e encurta a descrição
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.description;
            const cleanDescription = (tempDiv.textContent || tempDiv.innerText || "").substring(0, 100) + '...';

            slide.innerHTML = `
                <article class="card">
                    <div>
                        <img src="${escapeHTML(article.thumbnail)}" alt="Capa da notícia" class="news-thumbnail" loading="lazy">
                        <h3 title="${escapeHTML(article.title)}">${escapeHTML(article.title)}</h3>
                        <p>${escapeHTML(cleanDescription)}</p>
                    </div>
                    <a href="${escapeHTML(article.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-external">Ler Artigo <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>
                </article>
            `;
            fragment.appendChild(slide);
        });

        // Adiciona todos os slides de uma vez
        newsContainer.appendChild(fragment);

        // Inicializa o Swiper (carrossel)
        new Swiper('.news-carousel', {
            loop: false,
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });

    } catch (error) {
        newsContainer.innerHTML = '<p style="color: #ff4444;">Erro ao buscar notícias. Verifique sua conexão.</p>';
        console.error('Erro ao buscar notícias:', error);
    }
}

const backToTopBtn = document.getElementById('back-to-top-btn');

if (backToTopBtn) {
    // Adiciona o evento de clique para rolar suavemente para o topo
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Menu Mobile Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navbar = document.getElementById('navbar');

if (mobileMenuBtn && navbar) {
    mobileMenuBtn.addEventListener('click', () => {
        const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !expanded);
        navbar.classList.toggle('nav-active');
    });

    // Fecha o menu ao clicar num link (mobile)
    navbar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('nav-active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// Intersection Observer para Scrollspy (Substitui o scroll listener longo)
const navLinks = document.querySelectorAll('#navbar a');
const sections = document.querySelectorAll('section[id]');
const heroSection = document.querySelector('.hero');

const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -60% 0px', // Aciona quando o elemento cruza uma linha imaginária perto do meio da tela
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            const activeLink = document.querySelector(`#navbar a[href="#${entry.target.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    sectionObserver.observe(section);
});

// Observer para o Botão Voltar ao Topo (Substitui scroll listener)
if (heroSection && backToTopBtn) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
    }, { threshold: 0 });
    
    heroObserver.observe(heroSection);
}

carregarRepositorios();
carregarNoticias();