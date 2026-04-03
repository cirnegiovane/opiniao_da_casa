# Opinião da Casa

Watchlist colaborativa para filmes, livros, jogos e séries — acessível por qualquer dispositivo na rede local via browser.

## Stack

| Camada         | Tecnologia                   |
| -------------- | ---------------------------- |
| Backend        | Python + FastAPI             |
| Banco de dados | PostgreSQL 16                |
| ORM            | SQLAlchemy                   |
| Validação      | Pydantic v2                  |
| Frontend       | HTML + CSS + JavaScript puro |
| Servidor web   | Nginx                        |
| Infraestrutura | Docker + Docker Compose      |

## Funcionalidades

- Cadastro de títulos com tipo (filme, livro, jogo, série), status, nota de 1 a 10 e múltiplos gêneros
- Edição e remoção de itens
- Filtros por tipo, status e gênero
- Relacionamento muitos-para-muitos entre itens e gêneros
- Acessível por qualquer dispositivo na mesma rede local
- Dados persistidos em volume Docker

## Estrutura

```
opiniao/
├── backend/
│   ├── main.py          # rotas da API REST (GET, POST, PUT, DELETE)
│   ├── database.py      # conexão e pool com PostgreSQL
│   ├── models.py        # tabelas como classes ORM
│   ├── schemas.py       # validação de entrada e saída com Pydantic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html       # interface completa em HTML/CSS/JS
│   ├── nginx.conf       # configuração do servidor web
│   └── Dockerfile
└── docker-compose.yml
```

## Como rodar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Subir o ambiente

```bash
docker compose up --build -d
```

### Acessar

| Serviço             | Endereço                   |
| ------------------- | -------------------------- |
| Frontend            | http://localhost           |
| API                 | http://localhost:8000      |
| Documentação da API | http://localhost:8000/docs |

### Acesso pela rede local

Substitua `localhost` pelo IP da máquina na rede Wi-Fi ou Ethernet. Para descobrir o IP:

```powershell
# Windows
ipconfig
```

Atualize a constante `API` no `frontend/index.html` com o IP correto antes de buildar.

### Parar

```bash
docker compose down
```

Os dados do banco são preservados no volume `pgdata` entre reinicializações.

## API

| Método | Rota          | Descrição                         |
| ------ | ------------- | --------------------------------- |
| GET    | `/genres`     | Lista gêneros em ordem alfabética |
| POST   | `/genres`     | Cria um gênero                    |
| GET    | `/items`      | Lista itens com filtros opcionais |
| POST   | `/items`      | Cria um item                      |
| PUT    | `/items/{id}` | Atualiza um item                  |
| DELETE | `/items/{id}` | Remove um item                    |

### Filtros disponíveis em GET /items

```
GET /items?type=filme&status=concluido&genre_id=1
```

## Modelo de dados

```
genres                    items
──────────────            ──────────────────────────
id   (PK)                 id          (PK)
name                      title
                          type        filme | livro | jogo | serie
                          status      quero | em andamento | concluido | dropei
                          rating      1–10 (opcional)
                          created_at

item_genres (N:N)
─────────────────
item_id   (FK → items.id)
genre_id  (FK → genres.id)
```
