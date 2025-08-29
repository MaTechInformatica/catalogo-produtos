document.addEventListener('DOMContentLoaded', () => {
    const vitrineProdutos = document.getElementById('vitrine-produtos');
    const barraPesquisa = document.getElementById('barra-pesquisa');
    const filtrosCategoria = document.getElementById('filtros-categoria');

    let todosOsProdutos = [];

    // Função para buscar os produtos do arquivo JSON
    async function carregarProdutos() {
        try {
            const response = await fetch('data/produtos.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados dos produtos.');
            }
            todosOsProdutos = await response.json();
            renderizarProdutos(todosOsProdutos);
        } catch (error) {
            console.error(error);
            vitrineProdutos.innerHTML = `<p class="text-danger">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>`;
        }
    }

    // Função para renderizar os produtos na tela
    function renderizarProdutos(produtos) {
        vitrineProdutos.innerHTML = ''; // Limpa a vitrine antes de adicionar novos produtos

        if (produtos.length === 0) {
            vitrineProdutos.innerHTML = '<p class="text-center">Nenhum produto encontrado.</p>';
            return;
        }

        produtos.forEach(produto => {
            const cardProduto = `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100">
                        <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${produto.nome}</h5>
                            <p class="card-text">Categoria: <span class="badge bg-secondary">${produto.categoria}</span></p>
                            <h6 class="card-subtitle mb-2 mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</h6>
                            <a href="#" class="btn btn-primary">Ver detalhes</a>
                        </div>
                    </div>
                </div>
            `;
            vitrineProdutos.innerHTML += cardProduto;
        });
    }

    // Event listener para a barra de pesquisa
    barraPesquisa.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase();
        const produtosFiltrados = todosOsProdutos.filter(produto => 
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.categoria.toLowerCase().includes(termoBusca)
        );
        renderizarProdutos(produtosFiltrados);
    });

    // Event listener para os botões de categoria
    filtrosCategoria.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const categoria = e.target.getAttribute('data-categoria');

            // Remove a classe 'active' de todos os botões e adiciona ao clicado
            document.querySelectorAll('#filtros-categoria button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            if (categoria === 'todos') {
                renderizarProdutos(todosOsProdutos);
            } else {
                const produtosFiltrados = todosOsProdutos.filter(produto => produto.categoria === categoria);
                renderizarProdutos(produtosFiltrados);
            }
        }
    });

    // Iniciar o carregamento dos produtos
    carregarProdutos();
});