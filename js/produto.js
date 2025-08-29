document.addEventListener('DOMContentLoaded', () => {
    const detalhesProdutoDiv = document.getElementById('detalhes-produto');
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    if (!produtoId) {
        detalhesProdutoDiv.innerHTML = '<p class="text-danger text-center">Produto não encontrado.</p>';
        return;
    }

    async function carregarDetalhesProduto() {
        try {
            const response = await fetch('data/produtos.json');
            const produtos = await response.json();
            const produto = produtos.find(p => p.id === parseInt(produtoId));

            if (produto) {
                renderizarDetalhes(produto);
            } else {
                detalhesProdutoDiv.innerHTML = '<p class="text-danger text-center">Produto inválido.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar o produto:', error);
            detalhesProdutoDiv.innerHTML = '<p class="text-danger text-center">Erro ao carregar informações.</p>';
        }
    }

    function renderizarDetalhes(produto) {
        document.title = produto.nome;

        let carouselIndicators = '';
        let carouselInner = '';

        if (produto.imagens && produto.imagens.length > 0) {
            produto.imagens.forEach((imagemUrl, index) => {
                // Cria os botões indicadores (as barrinhas inferiores)
                carouselIndicators += `
                    <button type="button" data-bs-target="#carouselProduto" data-bs-slide-to="${index}" 
                            class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : 'false'}" 
                            aria-label="Slide ${index + 1}"></button>
                `;
                carouselInner += `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${imagemUrl}" class="d-block w-100 img-fluid rounded" alt="${produto.nome} - Imagem ${index + 1}">
                    </div>
                `;
            });
        } else {
            carouselInner = `<div class="carousel-item active"><img src="img/placeholder.png" class="d-block w-100" alt="Sem Imagem"></div>`;
        }

        detalhesProdutoDiv.innerHTML = `
            <div class="col-md-6">
                <div id="carouselProduto" class="carousel slide carousel-fade" data-bs-ride="carousel">
                    <div class="carousel-indicators">${carouselIndicators}</div>
                    <div class="carousel-inner">${carouselInner}</div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carouselProduto" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselProduto" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

            <div class="col-md-6 d-flex flex-column">
                <h1>${produto.nome}</h1>
                <p class="lead text-muted">${produto.descricao}</p>
                <p>${produto.disponivel ? '<span class="badge bg-success">Disponível</span>' : '<span class="badge bg-danger">Indisponível</span>'}</p>
                <h3 class="mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</h3>
                <div class="d-grid gap-2 d-sm-flex mt-3">
                    <a id="btn-whatsapp" href="#" class="btn btn-success btn-lg flex-grow-1">Tenho interesse! (WhatsApp)</a>
                    <a href="index.html" class="btn btn-secondary btn-lg flex-grow-1">Voltar ao Catálogo</a>
                </div>
            </div>
        `;
        
        configurarLinkWhatsApp(produto);
    }

    function configurarLinkWhatsApp(produto) {
        const btnWhatsapp = document.getElementById('btn-whatsapp');
        const whatsapp = '5588996889306';
        const nomeProduto = encodeURIComponent(produto.nome);
        const linkProduto = encodeURIComponent(window.location.href);
        const mensagem = `Me interessei por este produto: ${nomeProduto} link: ${linkProduto}`;
        const urlWhatsapp = `https://wa.me/${whatsapp}?text=${mensagem}`;
        btnWhatsapp.href = urlWhatsapp;

        if (!produto.disponivel) {
            btnWhatsapp.classList.add('disabled');
            btnWhatsapp.textContent = 'Produto indisponível';
        }
    }

    carregarDetalhesProduto();
});