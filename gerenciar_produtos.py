import json
import os

JSON_FILE = os.path.join('data', 'produtos.json')

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
        print(f"ID: {p['id']} | Nome: {p['nome']} | Imagens: {len(p.get('imagens', []))}")
    print("-------------------------")
    return True

def encontrar_produto(produtos):
    termo = input("\nDigite o ID ou um termo para pesquisar (nome/categoria): ").lower()
    if termo.isdigit():
        for p in produtos:
            if p['id'] == int(termo):
                return p
        return None
    encontrados = [p for p in produtos if termo in p['nome'].lower() or termo in p['categoria'].lower()]
    if not encontrados:
        return None
    if len(encontrados) == 1:
        return encontrados[0]
    print("\n>> Vários produtos encontrados:")
    for p in encontrados:
        print(f"ID: {p['id']} | Nome: {p['nome']}")
    try:
        id_escolhido = int(input("Digite o ID do produto desejado: "))
        for p in produtos:
            if p['id'] == id_escolhido:
                return p
    except ValueError:
        return None
    return None

def adicionar_produto():
    produtos = carregar_produtos()
    print("\n--- ADICIONAR NOVO PRODUTO ---")
    nome = input("Nome do produto: ")
    categoria = input("Categoria: ").lower()
    try:
        preco = float(input("Preço: "))
    except ValueError:
        print("Preço inválido.")
        return
    descricao = input("Descrição: ")
    disponivel = input("Disponível? (s/n): ").lower() == 's'
    
    imagens = []
    print("Insira as URLs das imagens (deixe em branco para finalizar):")
    while True:
        url = input("URL da imagem: ")
        if not url:
            break
        imagens.append(url)

    novo_produto = { "id": obter_novo_id(produtos), "nome": nome, "categoria": categoria, "preco": preco, "imagens": imagens, "descricao": descricao, "disponivel": disponivel }
    produtos.append(novo_produto)
    salvar_produtos(produtos)
    print("\n>> Produto adicionado com sucesso!")

def gerenciar_imagens(produto):
    while True:
        print("\n--- Gerenciar Imagens ---")
        if not produto.get('imagens'):
            print("Nenhuma imagem cadastrada.")
        else:
            for i, url in enumerate(produto['imagens']):
                print(f"{i + 1}. {url[:50]}...")
        print("\nOpções: (A)dicionar, (R)emover, (V)oltar")
        escolha = input("Escolha: ").lower()
        if escolha == 'a':
            url = input("Nova URL da imagem: ")
            if url:
                produto['imagens'].append(url)
        elif escolha == 'r':
            try:
                num = int(input("Número da imagem a remover: "))
                if 1 <= num <= len(produto['imagens']):
                    produto['imagens'].pop(num - 1)
            except (ValueError, IndexError):
                print(">> Número inválido.")
        elif escolha == 'v':
            break

def atualizar_produto():
    produtos = carregar_produtos()
    if not produtos:
        return
    produto = encontrar_produto(produtos)
    if not produto:
        print(">> Produto não encontrado.")
        return
    while True:
        print(f"\n--- ATUALIZANDO: {produto['nome']} ---")
        print(f"1. Nome: {produto['nome']}")
        print(f"2. Categoria: {produto['categoria']}")
        print(f"3. Preço: R${produto['preco']:.2f}")
        print(f"4. Descrição: {produto['descricao'][:40]}...")
        print(f"5. Imagens: ({len(produto.get('imagens', []))} URLs)")
        print(f"6. Disponível: {'Sim' if produto['disponivel'] else 'Não'}")
        print("7. Salvar e voltar")
        escolha = input("Alterar qual campo? ")
        if escolha == '1':
            produto['nome'] = input("Novo nome: ")
        elif escolha == '2':
            produto['categoria'] = input("Nova categoria: ").lower()
        elif escolha == '3':
            try:
                produto['preco'] = float(input("Novo preço: "))
            except ValueError:
                print(">> Preço inválido.")
        elif escolha == '4':
            produto['descricao'] = input("Nova descrição: ")
        elif escolha == '5':
            gerenciar_imagens(produto)
        elif escolha == '6':
            produto['disponivel'] = input("Disponível? (s/n): ").lower() == 's'
        elif escolha == '7':
            salvar_produtos(produtos)
            print(">> Produto atualizado!")
            break

def excluir_produto():
    produtos = carregar_produtos()
    if not produtos:
        return
    produto = encontrar_produto(produtos)
    if not produto:
        print(">> Produto não encontrado.")
        return
    if input(f"Excluir '{produto['nome']}'? (s/n): ").lower() == 's':
        produtos.remove(produto)
        salvar_produtos(produtos)
        print(">> Produto excluído.")

def menu():
    while True:
        print("\n===== GERENCIADOR DE PRODUTOS =====")
        print("1. Listar | 2. Adicionar | 3. Atualizar | 4. Excluir | 5. Sair")
        escolha = input("Escolha: ")
        if escolha == '1': listar_produtos()
        elif escolha == '2': adicionar_produto()
        elif escolha == '3': atualizar_produto()
        elif escolha == '4': excluir_produto()
        elif escolha == '5': break

if __name__ == "__main__":
    menu()