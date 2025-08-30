document.addEventListener('DOMContentLoaded', () => {
    const vitrineProdutos = document.getElementById('vitrine-produtos');
    const barraPesquisa = document.getElementById('barra-pesquisa');
    const filtrosCategoria = document.getElementById('filtros-categoria');
    const switchDisponibilidade = document.getElementById('switch-disponiveis');
    let todosOsProdutos = [];
    let filtroDisponibilidadeAtual = 'disponiveis';
    let filtroCategoriaAtual = 'todos';
    let termoBuscaAtual = '';

    async function carregarProdutos() {
        try {
            const response = await fetch('data/produtos.json');
            todosOsProdutos = await response.json();
            renderizarBotoesCategoria();
            aplicarFiltros(); 
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    function renderizarBotoesCategoria() {
        let categoriasUnicas = [...new Set(todosOsProdutos.map(p => p.categoria))];
        let categoriasOrdenadas = categoriasUnicas.filter(cat => cat !== 'outros');
        categoriasOrdenadas.sort();
        if (categoriasUnicas.includes('outros')) {
            categoriasOrdenadas.push('outros');
        }
        const categoriasFinais = ['todos', ...categoriasOrdenadas];
        filtrosCategoria.innerHTML = '';
        categoriasFinais.forEach(categoria => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary me-2 mb-2';
            btn.setAttribute('data-categoria', categoria);
            btn.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            if (categoria === 'todos') {
                btn.classList.add('active');
            }
            filtrosCategoria.appendChild(btn);
        });
    }

    function aplicarFiltros() {
        let produtosFiltrados = todosOsProdutos;
        if (filtroDisponibilidadeAtual === 'disponiveis') {
            produtosFiltrados = produtosFiltrados.filter(p => p.disponivel === true);
        }
        if (filtroCategoriaAtual !== 'todos') {
            produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtroCategoriaAtual);
        }
        if (termoBuscaAtual) {
            produtosFiltrados = produtosFiltrados.filter(p =>
                p.nome.toLowerCase().includes(termoBuscaAtual) ||
                p.categoria.toLowerCase().includes(termoBuscaAtual)
            );
        }
        renderizarProdutos(produtosFiltrados);
    }

    function renderizarProdutos(produtos) {
        vitrineProdutos.innerHTML = '';
        if (produtos.length === 0) {
            vitrineProdutos.innerHTML = '<p class="text-center text-muted mt-5">Nenhum produto encontrado.</p>';
            return;
        }
        produtos.forEach(produto => {
            const temImagens = produto.imagens && produto.imagens.length > 0;
            const imagemPrincipal = temImagens ? produto.imagens[0] : 'https://via.placeholder.com/400x300?text=Sem+Imagem';

            const cardProduto = `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100">
                        <img src="${imagemPrincipal}" class="card-img-top" alt="${produto.nome}">
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

    carregarProdutos();
});