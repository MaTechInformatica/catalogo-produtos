import json
import os
import shutil
import re

JSON_FILE = os.path.join('data', 'produtos.json')
IMG_BASE_DIR = 'img'

def carregar_produtos():
    if not os.path.exists(JSON_FILE):
        return []
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def salvar_produtos(produtos):
    os.makedirs(os.path.dirname(JSON_FILE), exist_ok=True)
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(produtos, f, indent=2, ensure_ascii=False)

def criar_slug(texto):
    texto = texto.lower()
    texto = re.sub(r'\s+', '-', texto)
    texto = re.sub(r'[^\w\-]', '', texto)
    return texto

def obter_novo_id(produtos):
    if not produtos:
        return 1
    return max(p['id'] for p in produtos) + 1

def listar_produtos():
    produtos = carregar_produtos()
    if not produtos:
        print("\n>> Nenhum produto cadastrado.")
        return False
    print("\n--- LISTA DE PRODUTOS ---")
    for p in produtos:
        disponibilidade = "Sim" if p.get('disponivel', False) else "Não"
        print(f"ID: {p['id']} | Nome: {p['nome']} | Categoria: {p['categoria']} | Preço: R${p['preco']:.2f} | Imagens: {p.get('quantidadeImagens', 0)}")
    print("-------------------------")
    return True

def encontrar_produto(produtos):
    termo = input("\nDigite o ID do produto ou um termo para pesquisar (nome/categoria): ").lower()
    if termo.isdigit():
        produto_id = int(termo)
        for p in produtos:
            if p['id'] == produto_id:
                return p
        print(">> Produto com este ID não encontrado.")
        return None
    encontrados = [p for p in produtos if termo in p['nome'].lower() or termo in p['categoria'].lower()]
    if not encontrados:
        print(">> Nenhum produto encontrado com este termo.")
        return None
    if len(encontrados) == 1:
        produto = encontrados[0]
        print(f"\nProduto encontrado: ID: {produto['id']} | Nome: {produto['nome']}")
        confirmacao = input("É este o produto que deseja selecionar? (s/n): ").lower()
        return produto if confirmacao == 's' else None
    print("\n>> Vários produtos encontrados:")
    for p in encontrados:
        print(f"ID: {p['id']} | Nome: {p['nome']}")
    try:
        id_escolhido = int(input("Agora, digite o ID do produto desejado: "))
        for p in produtos:
            if p['id'] == id_escolhido:
                return p
        print(">> ID inválido.")
        return None
    except ValueError:
        print(">> ID inválido.")
        return None

def adicionar_produto():
    produtos = carregar_produtos()
    print("\n--- ADICIONAR NOVO PRODUTO ---")
    nome = input("Nome do produto: ")
    categoria = input("Categoria (ex: teclado, mouse): ").lower()
    try:
        preco = float(input("Preço (ex: 350.50): "))
    except ValueError:
        print("Erro: Preço inválido. Abortando.")
        return
    descricao = input("Descrição: ")
    disponivel_str = input("Está disponível? (s/n): ").lower()
    disponivel = True if disponivel_str == 's' else False
    
    try:
        quantidade_imagens = int(input("Quantidade de imagens (ex: 3): "))
    except ValueError:
        print("Quantidade de imagens inválida. Definindo como 0.")
        quantidade_imagens = 0

    slug_produto = criar_slug(nome)
    pasta_destino = os.path.join(IMG_BASE_DIR, categoria, slug_produto)
    os.makedirs(pasta_destino, exist_ok=True)
    print(f"\n>> Pasta de imagens criada em: '{pasta_destino}'")
    if quantidade_imagens > 0:
        print(f">> IMPORTANTE: Lembre-se de colocar {quantidade_imagens} imagens nomeadas de 1.jpg a {quantidade_imagens}.jpg nesta pasta.")

    novo_produto = {
        "id": obter_novo_id(produtos),
        "nome": nome,
        "categoria": categoria,
        "preco": preco,
        "quantidadeImagens": quantidade_imagens,
        "descricao": descricao,
        "disponivel": disponivel
    }
    produtos.append(novo_produto)
    salvar_produtos(produtos)
    print("\n>> Produto adicionado com sucesso!")

def atualizar_produto():
    produtos = carregar_produtos()
    if not produtos:
        print("\n>> Nenhum produto para atualizar.")
        return
    produto_encontrado = encontrar_produto(produtos)
    if not produto_encontrado:
        return
    nome_original = produto_encontrado['nome']
    categoria_original = produto_encontrado['categoria']
    while True:
        print(f"\n--- ATUALIZANDO: {produto_encontrado['nome']} (ID: {produto_encontrado['id']}) ---")
        print(f"1. Nome:       {produto_encontrado['nome']}")
        print(f"2. Categoria:  {produto_encontrado['categoria']}")
        print(f"3. Preço:      R${produto_encontrado['preco']:.2f}")
        print(f"4. Descrição:  {produto_encontrado['descricao'][:40]}...")
        print(f"5. Quantidade de Imagens: {produto_encontrado.get('quantidadeImagens', 0)}")
        print(f"6. Disponível: {'Sim' if produto_encontrado['disponivel'] else 'Não'}")
        print("---------------------------------------------")
        print("7. Salvar alterações e voltar")
        print("8. Cancelar e voltar")
        escolha = input("Escolha o número do campo que deseja alterar: ")
        if escolha == '1':
            produto_encontrado['nome'] = input("Novo nome: ")
        elif escolha == '2':
            produto_encontrado['categoria'] = input("Nova categoria: ").lower()
        elif escolha == '3':
            try:
                produto_encontrado['preco'] = float(input("Novo preço: "))
            except ValueError:
                print(">> Preço inválido.")
        elif escolha == '4':
            produto_encontrado['descricao'] = input("Nova descrição: ")
        elif escolha == '5':
            try:
                produto_encontrado['quantidadeImagens'] = int(input("Nova quantidade de imagens: "))
            except ValueError:
                print(">> Quantidade inválida.")
        elif escolha == '6':
            disp_str = input("Está disponível? (s/n): ").lower()
            if disp_str in ['s', 'n']:
                produto_encontrado['disponivel'] = (disp_str == 's')
        elif escolha == '7':
            if produto_encontrado['nome'] != nome_original or produto_encontrado['categoria'] != categoria_original:
                slug_antigo = criar_slug(nome_original)
                pasta_antiga = os.path.join(IMG_BASE_DIR, categoria_original, slug_antigo)
                slug_novo = criar_slug(produto_encontrado['nome'])
                pasta_nova = os.path.join(IMG_BASE_DIR, produto_encontrado['categoria'], slug_novo)
                if os.path.exists(pasta_antiga):
                    os.makedirs(os.path.dirname(pasta_nova), exist_ok=True)
                    shutil.move(pasta_antiga, pasta_nova)
                    print(f">> Pasta de imagens movida para '{pasta_nova}'")
            salvar_produtos(produtos)
            print("\n>> Produto atualizado com sucesso!")
            break
        elif escolha == '8':
            print(">> Alterações canceladas.")
            break
        else:
            print(">> Opção inválida.")

def excluir_produto():
    produtos = carregar_produtos()
    if not produtos:
        print("\n>> Nenhum produto para excluir.")
        return
    produto_a_excluir = encontrar_produto(produtos)
    if not produto_a_excluir:
        return
    confirmacao = input(f"Tem certeza que deseja excluir '{produto_a_excluir['nome']}' (ID: {produto_a_excluir['id']})? (s/n): ").lower()
    if confirmacao == 's':
        produtos.remove(produto_a_excluir)
        slug_produto = criar_slug(produto_a_excluir['nome'])
        pasta_produto = os.path.join(IMG_BASE_DIR, produto_a_excluir['categoria'], slug_produto)
        if os.path.exists(pasta_produto):
            try:
                shutil.rmtree(pasta_produto)
                print(f">> Pasta de imagens '{pasta_produto}' excluída.")
            except Exception as e:
                print(f">> ERRO ao excluir pasta de imagens: {e}")
        salvar_produtos(produtos)
        print("\n>> Produto excluído com sucesso!")
    else:
        print(">> Exclusão cancelada.")

def menu():
    while True:
        print("\n===== GERENCIADOR DE PRODUTOS DA LOJA =====")
        print("1. Listar todos os produtos")
        print("2. Adicionar novo produto")
        print("3. Atualizar produto existente")
        print("4. Excluir produto")
        print("5. Sair")
        print("===========================================")
        escolha = input("Escolha uma opção: ")
        if escolha == '1':
            listar_produtos()
        elif escolha == '2':
            adicionar_produto()
        elif escolha == '3':
            atualizar_produto()
        elif escolha == '4':
            excluir_produto()
        elif escolha == '5':
            print(">> Saindo do programa.")
            break
        else:
            print(">> Opção inválida. Tente novamente.")

if __name__ == "__main__":
    menu()