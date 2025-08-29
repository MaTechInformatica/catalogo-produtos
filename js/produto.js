document.addEventListener('DOMContentLoaded', () => {
    // Pega o elemento onde as informações do produto serão exibidas
    const detalhesProdutoDiv = document.getElementById('detalhes-produto');

    // Extrai o ID do produto da URL
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    // Se não houver ID na URL, exibe uma mensagem de erro
    if (!produtoId) {
        detalhesProdutoDiv.innerHTML = '<p class="text-danger text-center">Produto não encontrado. Volte ao catálogo.</p>';
        return;
    }

    // Função para carregar os dados de TODOS os produtos e encontrar o correto
    async function carregarDetalhesProduto() {
        try {
            const response = await fetch('data/produtos.json');
            const produtos = await response.json();

            // Encontra o produto com o ID correspondente (o ID da URL é string, então convertemos para número)
            const produto = produtos.find(p => p.id === parseInt(produtoId));

            if (produto) {
                renderizarDetalhes(produto);
            } else {
                detalhesProdutoDiv.innerHTML = '<p class="text-danger text-center">Produto não encontrado ou inválido.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar o produto:', error);
            detalhesProdutoDiv.innerHTML = '<p class="text-danger text-center">Erro ao carregar informações. Tente novamente.</p>';
        }
    }

    // Função para renderizar as informações na página
    function renderizarDetalhes(produto) {
        // Atualiza o título da página
        document.title = produto.nome;

        // Cria o HTML com as informações do produto
        detalhesProdutoDiv.innerHTML = `
    <div class="col-md-6">
        <img src="${produto.imagem}" class="img-fluid rounded shadow-sm" alt="${produto.nome}">
    </div>
    <div class="col-md-6 d-flex flex-column">
        <h1>${produto.nome}</h1>
        <p class="lead text-muted">${produto.descricao}</p>
        
        ${
            produto.disponivel
            ? '<p><span class="badge bg-success">Disponível em estoque</span></p>'
            : '<p><span class="badge bg-danger">Produto indisponível</span></p>'
        }

        <h3 class="mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</h3>
        
        <div class="d-grid gap-2 d-sm-flex mt-3">
            <a id="btn-whatsapp" href="#" class="btn btn-success btn-lg flex-grow-1">
                Tenho interesse! (WhatsApp)
            </a>
            <a href="index.html" class="btn btn-secondary btn-lg flex-grow-1">
                Voltar ao Catálogo
            </a>
        </div>
    </div>
`;

        // Configura o botão do WhatsApp
        configurarLinkWhatsApp(produto);
    }

    function configurarLinkWhatsApp(produto) {
        const btnWhatsapp = document.getElementById('btn-whatsapp');

        // !!! IMPORTANTE: Substitua pelo seu número de telefone com código do país (ex: 5511999998888)
        const seuNumero = '5588996889306';

        const nomeProduto = encodeURIComponent(produto.nome);
        const linkProduto = encodeURIComponent(window.location.href);

        const mensagem = `Me interessei por este produto: ${nomeProduto} link: ${linkProduto}`;

        const urlWhatsapp = `https://wa.me/${seuNumero}?text=${mensagem}`;

        btnWhatsapp.href = urlWhatsapp;

        // Se o produto estiver indisponível, desabilita o botão
        if (!produto.disponivel) {
            btnWhatsapp.classList.add('disabled');
            btnWhatsapp.textContent = 'Produto indisponível';
        }
    }

    // Inicia o processo
    carregarDetalhesProduto();
});