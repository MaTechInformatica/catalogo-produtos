document.addEventListener('DOMContentLoaded', () => {
    const detalhesProdutoDiv = document.getElementById('detalhes-produto');
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    // Função para criar um nome de pasta/URL seguro (slug)
    function criarSlug(texto) {
        return texto.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Substitui espaços por -
            .replace(/[^\w\-]+/g, '')       // Remove caracteres inválidos
            .replace(/\-\-+/g, '-')         // Substitui múltiplos - por um único -
            .replace(/^-+/, '')             // Remove - do início
            .replace(/-+$/, '');            // Remove - do fim
    }

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
            console.error('Erro ao carregar produto:', error);
        }
    }

    function renderizarDetalhes(produto) {
        document.title = produto.nome;
        const slug = criarSlug(produto.nome);
        const basePath = `img/${produto.categoria}/${slug}/`;
        
        let carouselIndicators = '';
        let carouselInner = '';

        if (produto.quantidadeImagens && produto.quantidadeImagens > 0) {
            for (let i = 1; i <= produto.quantidadeImagens; i++) {
                const imageUrl = `${basePath}${i}.jpg`;
                carouselIndicators += `<button type="button" data-bs-target="#carouselProduto" data-bs-slide-to="${i - 1}" class="${i === 1 ? 'active' : ''}" aria-current="${i === 1 ? 'true' : 'false'}" aria-label="Slide ${i}"></button>`;
                carouselInner += `<div class="carousel-item ${i === 1 ? 'active' : ''}"><img src="${imageUrl}" class="d-block w-100" alt="${produto.nome} - Imagem ${i}"></div>`;
            }
        } else {
            carouselInner = `<div class="carousel-item active"><img src="https://via.placeholder.com/600x400?text=Sem+Imagem" class="d-block w-100" alt="Sem Imagem"></div>`;
        }
        
        detalhesProdutoDiv.innerHTML = `
            <div class="col-md-6">
                <div id="carouselProduto" class="carousel slide carousel-fade" data-bs-ride="carousel">
                    <div class="carousel-indicators">${carouselIndicators}</div>
                    <div class="carousel-inner">${carouselInner}</div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carouselProduto" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselProduto" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
                </div>
            </div>
            <div class="col-md-6 d-flex flex-column">
                <h1>${produto.nome}</h1>
                <p class="lead text-muted">${produto.descricao}</p>
                <p>${produto.disponivel ? '<span class="badge bg-success">Disponível</span>' : '<span class="badge bg-danger">Indisponível</span>'}</p>
                <h3 class="mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</h3>
                <div class="d-grid gap-2 d-sm-flex mt-3">
                    <a id="btn-whatsapp" href="#" class="btn btn-success btn-lg flex-grow-1">Tenho interesse!</a>
                    <a href="index.html" class="btn btn-secondary btn-lg flex-grow-1">Voltar ao Catálogo</a>
                </div>
            </div>`;
        configurarLinkWhatsApp(produto);
    }

    function configurarLinkWhatsApp(produto) {
        const btnWhatsapp = document.getElementById('btn-whatsapp');
        const seuNumero = '5511999998888'; // !!! SUBSTITUA SEU NÚMERO
        const nomeProduto = encodeURIComponent(produto.nome);
        const linkProduto = encodeURIComponent(window.location.href);
        const mensagem = `Me interessei por este produto: ${nomeProduto} link: ${linkProduto}`;
        const urlWhatsapp = `https://wa.me/${seuNumero}?text=${mensagem}`;
        btnWhatsapp.href = urlWhatsapp;
        if (!produto.disponivel) {
            btnWhatsapp.classList.add('disabled');
            btnWhatsapp.textContent = 'Produto indisponível';
        }
    }
    carregarDetalhesProduto();
});