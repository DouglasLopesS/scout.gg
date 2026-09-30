# scout.gg

Consulta de perfis e histórico de partidas de League of Legends por Riot ID.

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Riot API](https://img.shields.io/badge/Riot%20API-Developer-EF3340?logo=riotgames&logoColor=white)](https://developer.riotgames.com/)

O **scout.gg** reúne dados de conta, perfil ranqueado e as dez partidas mais recentes em uma interface responsiva. Toda comunicação com a Riot API é centralizada na API da aplicação, mantendo a chave privada fora do navegador.

As partidas são guardadas em memória na API por até uma hora (máximo de 300 entradas). Buscas simultâneas pelo mesmo ID compartilham uma única chamada, e no máximo três buscas de partidas são feitas à Riot ao mesmo tempo. O cache é limpo ao reiniciar a API.

Ao receber `429` da Riot, a API pausa novas consultas pelo tempo indicado em `Retry-After` e tenta a chamada novamente até duas vezes. Se o cabeçalho estiver ausente ou inválido, aguarda um segundo. Após a última tentativa, devolve o erro `RATE_LIMITED`.

O painel permite escolher a plataforma antes da busca. A API deriva a região correspondente para Account-V1 e Match-V5 e mantém o cache de partidas separado por plataforma/região.

O resumo, os gráficos e os filtros usam somente as partidas já carregadas. O painel mostra quantas partidas aparecem após os filtros e permite carregar até dez partidas adicionais por vez para ampliar a análise.

O navegador guarda o servidor selecionado e até cinco buscas recentes bem-sucedidas no armazenamento local. É possível repetir uma busca pelo atalho abaixo do formulário ou limpar a lista; essas preferências ficam apenas no navegador usado.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Painel | Angular 22, Angular Material, RxJS, TypeScript e SCSS |
| API | Node.js, Express 5, Axios, TypeScript, dotenv, CORS e Helmet |
| Integrações | Account-V1, Summoner-V4, League-V4, Match-V5 e Data Dragon |

O projeto utiliza TypeScript em modo estrito nas duas aplicações.

## Pré-requisitos

- Node.js `22.22.3+`, `24.15.0+` ou `26+`.
- npm 8 ou superior.
- Chave válida do [Riot Developer Portal](https://developer.riotgames.com/).

## Instalação

Clone o repositório e instale as dependências das duas aplicações:

```bash
git clone <url-do-repositorio>
cd api_lol

cd api
npm install

cd ../painel
npm install
```

## Configuração

Crie o arquivo de ambiente da API:

```bash
cd api
cp .env.example .env
```

No Windows PowerShell:

```powershell
cd api
Copy-Item .env.example .env
```

Configure `api/.env`:

```dotenv
RIOT_API_KEY=RGAPI-sua-chave-aqui
```

`RIOT_PLATFORM` define a plataforma padrão da API (`br1` se omitida). A região é derivada automaticamente; `RIOT_REGION` não é necessária.

## Execução local

Inicie a API:

```bash
cd api
npm run dev
```

Inicie o painel:

```bash
cd painel
npm start
```

Serviços disponíveis:

| Serviço | Endereço |
| --- | --- |
| Painel | `http://localhost:4200` |
| API | `http://localhost:3000` |
| Health check | `http://localhost:3000/health` |

As consultas aceitam `?platform=br1` (ou outra plataforma exibida no seletor). Isso se aplica à busca por Riot ID, à paginação e aos detalhes de partida. Sem o parâmetro, a API usa `RIOT_PLATFORM`.

### Health check

```http
GET /health
```

```json
{
  "status": "ok"
}
```

### Erros

Todas as falhas seguem o mesmo contrato:

```json
{
  "error": {
    "code": "PLAYER_NOT_FOUND",
    "message": "Jogador não encontrado para este Riot ID."
  }
}
```

| HTTP | Situação |
| :---: | --- |
| `400` | Riot ID inválido |
| `401` | Chave da Riot inválida ou expirada |
| `403` | Acesso recusado pela Riot |
| `404` | Jogador ou rota não encontrada |
| `429` | Limite de requisições atingido |
| `500` | Erro interno inesperado |
| `502` | Falha em uma integração externa |

## Scripts

### API

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API com recarga automática |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm run start` | Executa a versão compilada |
| `npm run typecheck` | Valida os tipos sem gerar arquivos |
| `npm test` | Testa o cache e o limite de chamadas simultâneas |

### Painel

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o bundle de produção |
| `npm run watch` | Compila continuamente em modo development |

## Build

```bash
cd api
npm run build

cd ../painel
npm run build
```

## Próximos passos

- Persistir pesquisas e preferências do usuário.

## Documentação oficial

- [Riot Developer Portal](https://developer.riotgames.com/)
- [Riot API Reference](https://developer.riotgames.com/apis)
- [Riot ID e roteamento regional](https://developer.riotgames.com/docs/lol)
- [Angular](https://angular.dev/)

