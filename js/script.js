document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const vitrineProdutos = document.getElementById('vitrine-produtos');
    const barraPesquisa = document.getElementById('barra-pesquisa');
    const filtrosCategoria = document.getElementById('filtros-categoria');
    const switchDisponibilidade = document.getElementById('switch-disponiveis');

    // Variáveis de estado
    let todosOsProdutos = [];
    let filtroDisponibilidadeAtual = 'disponiveis';
    let filtroCategoriaAtual = 'todos';
    let termoBuscaAtual = '';

    // Função principal para carregar os produtos do JSON
    async function carregarProdutos() {
        try {
            const response = await fetch('data/produtos.json');
            todosOsProdutos = await response.json();
            
            // NOVAS FUNÇÕES CHAMADAS AQUI
            renderizarBotoesCategoria();
            aplicarFiltros(); 
        } catch (error) {
            console.error('Erro ao carregar os dados dos produtos:', error);
            vitrineProdutos.innerHTML = `<p class="text-danger">Não foi possível carregar os produtos.</p>`;
        }
    }

    // NOVA FUNÇÃO: Cria os botões de categoria dinamicamente
    // Dentro do arquivo js/script.js

// NOVA FUNÇÃO: Cria os botões de categoria dinamicamente e de forma ordenada
function renderizarBotoesCategoria() {
    // Extrai todas as categorias únicas do array de produtos
    let categoriasUnicas = [...new Set(todosOsProdutos.map(p => p.categoria))];
    
    // Filtra a lista para remover a categoria "outros" temporariamente
    let categoriasOrdenadas = categoriasUnicas.filter(cat => cat !== 'outros');
    
    // Ordena as categorias restantes em ordem alfabética
    categoriasOrdenadas.sort();

    // Adiciona a categoria "outros" de volta ao final da lista, SE ela existir
    if (categoriasUnicas.includes('outros')) {
        categoriasOrdenadas.push('outros');
    }

    // Adiciona o botão "Todos" no início da lista final
    const categoriasFinais = ['todos', ...categoriasOrdenadas];
    
    filtrosCategoria.innerHTML = ''; // Limpa quaisquer botões existentes

    categoriasFinais.forEach(categoria => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-primary me-2 mb-2';
        btn.setAttribute('data-categoria', categoria);
        // Capitaliza a primeira letra para melhor exibição
        btn.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);

        if (categoria === 'todos') {
            btn.classList.add('active'); // Botão "Todos" começa ativo
        }
        filtrosCategoria.appendChild(btn);
    });
}

    // Função centralizada para aplicar todos os filtros
    function aplicarFiltros() {
        let produtosFiltrados = todosOsProdutos;

        // 1. Filtro de Disponibilidade
        if (filtroDisponibilidadeAtual === 'disponiveis') {
            produtosFiltrados = produtosFiltrados.filter(p => p.disponivel === true);
        }

        // 2. Filtro de Categoria
        if (filtroCategoriaAtual !== 'todos') {
            produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtroCategoriaAtual);
        }

        // 3. Filtro de Pesquisa
        if (termoBuscaAtual) {
            produtosFiltrados = produtosFiltrados.filter(p =>
                p.nome.toLowerCase().includes(termoBuscaAtual) ||
                p.categoria.toLowerCase().includes(termoBuscaAtual)
            );
        }

        renderizarProdutos(produtosFiltrados);
    }

    // Função para renderizar os produtos na tela
    function renderizarProdutos(produtos) {
        vitrineProdutos.innerHTML = '';
        if (produtos.length === 0) {
            vitrineProdutos.innerHTML = '<p class="text-center text-muted mt-5">Nenhum produto encontrado.</p>';
            return;
        }
        produtos.forEach(produto => {
            const cardProduto = `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100">
                        <img src="${(produto.imagens && produto.imagens.length > 0) ? produto.imagens[0] : 'img/placeholder.png'}" class="card-img-top" alt="${produto.nome}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${produto.nome}</h5>
                            <p class="card-text">Categoria: <span class="badge bg-secondary">${produto.categoria}</span></p>
                            ${!produto.disponivel ? '<p class="card-text"><span class="badge bg-danger">Esgotado</span></p>' : ''}
                            <h6 class="card-subtitle mb-2 mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</h6>
                            <a href="produto.html?id=${produto.id}" class="btn btn-primary">Ver detalhes</a>
                        </div>
                    </div>
                </div>
            `;
            vitrineProdutos.innerHTML += cardProduto;
        });
    }

    // --- Event Listeners ---

    switchDisponibilidade.addEventListener('change', (e) => {
        filtroDisponibilidadeAtual = e.target.checked ? 'disponiveis' : 'todos';
        aplicarFiltros();
    });

    filtrosCategoria.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('#filtros-categoria button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filtroCategoriaAtual = e.target.getAttribute('data-categoria');
            aplicarFiltros();
        }
    });

    barraPesquisa.addEventListener('input', (e) => {
        termoBuscaAtual = e.target.value.toLowerCase().trim();
        aplicarFiltros();
    });

    // Inicia o carregamento dos produtos
    carregarProdutos();
});