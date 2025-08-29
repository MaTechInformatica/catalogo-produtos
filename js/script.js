document.addEventListener('DOMContentLoaded', () => {
    const vitrineProdutos = document.getElementById('vitrine-produtos');
    const barraPesquisa = document.getElementById('barra-pesquisa');
    const filtrosCategoria = document.getElementById('filtros-categoria');
    const switchDisponibilidade = document.getElementById('switch-disponiveis');

    let todosOsProdutos = [];
    let filtroDisponibilidadeAtual = 'disponiveis';
    let filtroCategoriaAtual = 'todos'; 
    let termoBuscaAtual = '';

    // Função principal para carregar os produtos
    async function carregarProdutos() {
        try {
            const response = await fetch('data/produtos.json');
            todosOsProdutos = await response.json();
            aplicarFiltros();
        } catch (error) {
            console.error('Erro ao carregar os dados dos produtos:', error);
            vitrineProdutos.innerHTML = `<p class="text-danger">Não foi possível carregar os produtos.</p>`;
        }
    }

    // Função centralizada para aplicar todos os filtros
    function aplicarFiltros() {
        let produtosFiltrados = todosOsProdutos;

        // Filtro de Disponibilidade
        if (filtroDisponibilidadeAtual === 'disponiveis') {
            produtosFiltrados = produtosFiltrados.filter(p => p.disponivel === true);
        }

        // Filtro de Categoria
        if (filtroCategoriaAtual !== 'todos') {
            produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtroCategoriaAtual);
        }

        // Filtro de Pesquisa
        if (termoBuscaAtual) {
            produtosFiltrados = produtosFiltrados.filter(p =>
                p.nome.toLowerCase().includes(termoBuscaAtual) ||
                p.categoria.toLowerCase().includes(termoBuscaAtual)
            );
        }

        renderizarProdutos(produtosFiltrados);
    }

    // renderizar os produtos na tela
    function renderizarProdutos(produtos) {
        vitrineProdutos.innerHTML = '';
        if (produtos.length === 0) {
            vitrineProdutos.innerHTML = '<p class="text-center text-muted mt-5">Nenhum produto encontrado com os filtros selecionados.</p>';
            return;
        }
        produtos.forEach(produto => {
            const cardProduto = `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100">
                        <img src="${produto.imagens[0]}" class="card-img-top" alt="${produto.nome}">
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

    //listeners para os filtros

    // Listener para o switch de disponibilidade
    switchDisponibilidade.addEventListener('change', (e) => {
        filtroDisponibilidadeAtual = e.target.checked ? 'disponiveis' : 'todos';
        aplicarFiltros();
    });

    // Listener para os botões de categoria 
    filtrosCategoria.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Lógica para o efeito visual de "ativo"
            document.querySelectorAll('#filtros-categoria button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Atualiza a variável de estado da categoria
            filtroCategoriaAtual = e.target.getAttribute('data-categoria');
            
            aplicarFiltros();
        }
    });

    // Listener para a barra de pesquisa
    barraPesquisa.addEventListener('input', (e) => {
        termoBuscaAtual = e.target.value.toLowerCase().trim();
        aplicarFiltros();
    });

    carregarProdutos();
});