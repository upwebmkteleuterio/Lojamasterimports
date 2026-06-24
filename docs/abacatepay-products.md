Referencia : Produtos

Produtos
Referência
Gerencie produtos para suas cobranças

Produtos são itens do seu catálogo usados nas cobranças: nome, preço, descrição e opcionalmente ciclo de assinatura. Avulso = pagamento único (cycle omitido ou null). Assinatura = cycle: WEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY ou ANNUALLY.
Produtos também podem ter um arquivo para download vinculado: um PDF que o comprador recebe acesso após o pagamento (e-books, ingressos, licenças, etc.).
​
Criar produto
Use /products/create. Moeda é sempre BRL.
Campos obrigatórios
Obrigatórios: externalId (único no seu sistema), name, price, currency. Opcionais: description, imageUrl, fileUrl, cycle (null/omitido = avulso), trialDays (requer cycle).
Exemplo (produto avulso):
POST /products/create
{
  "externalId": "prod-123",              // obrigatório - identificador único do produto no seu sistema
  "name": "Produto Exemplo",             // obrigatório - nome do produto
  "price": 10000,                        // obrigatório - preço em centavos
  "currency": "BRL",                     // obrigatório - moeda (sempre BRL)
  "description": "Descrição do produto", // opcional - descrição
  "imageUrl": null                       // opcional - URL da imagem (string | null)
}
Exemplo (produto de assinatura):
POST /products/create
{
  "externalId": "prod-assinatura-1",
  "name": "Plano Mensal",
  "price": 4990,
  "currency": "BRL",
  "cycle": "MONTHLY"                     // opcional - WEEKLY | MONTHLY | QUARTERLY | SEMIANNUALLY | ANNUALLY; omitir ou null = avulso
}
Exemplo (produto de assinatura com período de teste gratuito):
POST /products/create
{
  "externalId": "prod-assinatura-trial",
  "name": "Plano Mensal com 7 dias grátis",
  "price": 4990,
  "currency": "BRL",
  "cycle": "MONTHLY",
  "trialDays": 7                         // opcional - inteiro 1–90; requer cycle
}
Resposta (modelo Product):
{
  "data": {
    "externalId": "prod-assinatura-trial",
    "name": "Plano Mensal com 7 dias grátis",
    "description": null,
    "imageUrl": null,
    "hasFile": false,
    "price": 4990,
    "devMode": false,
    "currency": "BRL",
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z",
    "status": "ACTIVE",
    "id": "prod_abc123xyz",
    "cycle": "MONTHLY",
    "trialDays": 7
  },
  "success": true,
  "error": null
}
O data retornado segue o modelo Product: id, externalId, name, description, imageUrl, hasFile, price, currency, status, cycle, trialDays, createdAt, updatedAt, etc.
​
Arquivo para download
Vincule um PDF ao produto passando fileUrl na criação. A AbacatePay baixa e armazena o arquivo internamente — o link original não é exposto.
fileUrl aceita qualquer URL pública de PDF. Tamanho máximo: 20 MB.
Após o pagamento, o comprador recebe acesso ao download automaticamente.
O campo hasFile na resposta indica se o produto possui arquivo vinculado (true / false).
Exemplo (produto com arquivo):
POST /products/create
{
  "externalId": "ebook-001",
  "name": "E-book: Guia Completo",
  "price": 4990,
  "currency": "BRL",
  "fileUrl": "https://exemplo.com/guia-completo.pdf"
}
Resposta:
{
  "data": {
    "id": "prod_abc123xyz",
    "externalId": "ebook-001",
    "name": "E-book: Guia Completo",
    "hasFile": true,
    "price": 4990,
    "currency": "BRL",
    "status": "ACTIVE",
    ...
  },
  "success": true,
  "error": null
}
O URL do arquivo nunca é exposto pela API. Use hasFile para verificar se o produto tem um arquivo vinculado.

------------------------
Produtos
Criar um produto
Permite que você crie um novo produto que pode ser usado em cobranças. Produtos podem ser avulsos (pagamento único) ou de assinatura; use o campo opcional cycle para definir a recorrência (WEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY, ANNUALLY). Quando cycle é omitido ou null, o produto é avulso.

Alternativa: Você também pode criar e gerenciar seus produtos pelo Dashboard da AbacatePay.

POST
/
products
/
create

Try it
Cria um produto no seu catálogo para usar em checkouts, assinaturas e links de pagamento.
Obrigatórios
externalId (único no seu sistema), name, price (em centavos) e currency (sempre "BRL").
Produto digital com arquivo para download (passe fileUrl com a URL pública de um PDF):
{
  "externalId": "ebook-001",
  "name": "E-book: Guia Completo",
  "price": 4990,
  "currency": "BRL",
  "fileUrl": "https://exemplo.com/guia-completo.pdf"
}
fileUrl deve apontar para um PDF público acessível. Tamanho máximo: 20 MB. O arquivo é armazenado pela AbacatePay e o comprador recebe acesso após o pagamento. O campo hasFile: true na resposta confirma o vínculo.
Produto avulso (pagamento único — omita cycle):
{
  "externalId": "prod-123",
  "name": "Camiseta Premium",
  "price": 8990,
  "currency": "BRL",
  "description": "Camiseta 100% algodão"
}
Produto de assinatura (defina cycle):
{
  "externalId": "plano-mensal",
  "name": "Plano Mensal",
  "price": 4990,
  "currency": "BRL",
  "cycle": "MONTHLY"
}
Produto de assinatura com período de teste gratuito (defina trialDays):
{
  "externalId": "plano-mensal-trial",
  "name": "Plano Mensal com 7 dias grátis",
  "price": 4990,
  "currency": "BRL",
  "cycle": "MONTHLY",
  "trialDays": 7
}
Valores de cycle: WEEKLY · MONTHLY · QUARTERLY · SEMIANNUALLY · ANNUALLY
trialDays exige cycle. Valor inteiro entre 1 e 90. O cliente não é cobrado durante o período de teste — a primeira cobrança ocorre ao final do trial.
Guarde o data.id retornado — é ele que você passa como items[].id ao criar checkouts e assinaturas.
Authorizations
​
Authorization
stringheaderrequired
Todas as requisições devem incluir sua chave de API no header Authorization usando o formato Bearer <abacatepay-api-key>. Sem esse header a requisição será rejeitada.

Saiba mais sobre como criar e usar chaves de API na documentação de autenticação.

Body
application/json
Dados necessários para criar um produto.

​
externalId
stringrequired
Identificador único do produto no seu sistema.

Example:
"prod-123"

​
name
stringrequired
Nome do produto.

Example:
"Produto Exemplo"

​
price
numberrequired
Preço do produto em centavos.

Required range: x >= 1
Example:
10000

​
currency
stringdefault:BRLrequired
Moeda do produto.

Example:
"BRL"

​
description
string
Descrição opcional do produto.

Example:
"Descrição do produto"

​
imageUrl
string<uri> | null
URL da imagem do produto. Opcional.

Example:
null

​
fileUrl
string<uri>
URL pública de um PDF a ser vinculado ao produto. Opcional. O arquivo é baixado e armazenado pela AbacatePay — máximo 20 MB. Após o pagamento, o comprador recebe acesso ao download do arquivo.

Example:
"https://exemplo.com/meu-ebook.pdf"

​
cycle
enum<string> | null
Opcional. Indica se o produto é uma assinatura. Quando omitido ou null, o produto é avulso (pagamento único).
Valores possíveis: WEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY, ANNUALLY.

Available options: WEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY, ANNUALLY 
Example:
null

Response

200

application/json
Produto criado com sucesso.

​
data
object
Os dados do seu produto.
O campo cycle indica se o produto é uma assinatura (subscription). Quando null, o produto é avulso (pagamento único). Valores possíveis definem a recorrência da assinatura.
A moeda (currency) é sempre BRL.

Hide child attributes

​
data.externalId
stringrequired
Identificador único do produto no seu sistema

Example:
"prod-123"

​
data.name
stringrequired
Nome do produto

Example:
"Produto Exemplo"

​
data.description
stringrequired
Descrição do produto

Example:
"Descrição do produto"

​
data.price
numberrequired
Preço do produto em centavos

Example:
10000

​
data.devMode
booleanrequired
Indica se o produto foi criado em ambiente de testes

Example:
false

​
data.currency
enum<string>required
Moeda do produto (sempre BRL)

Available options: BRL 
Example:
"BRL"

​
data.createdAt
string<date-time>required
Data de criação do produto

Example:
"2024-11-04T18:38:28.573Z"

​
data.updatedAt
string<date-time>required
Data de atualização do produto

Example:
"2024-11-04T18:38:28.573Z"

​
data.status
enum<string>required
Status atual do produto (ProductStatus)

Available options: ACTIVE, INACTIVE 
Example:
"ACTIVE"

​
data.id
stringrequired
Identificador único público do produto

Example:
"prod_abc123xyz"

​
data.imageUrl
string<uri> | null
URL da imagem do produto

Example:
null

​
data.cycle
enum<string> | null
Indica se o produto é uma assinatura (ProductCycle). Quando null, o produto é avulso (pagamento único).
Valores possíveis definem a recorrência da assinatura.

Available options: WEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY, ANNUALLY 
Example:
null

​
data.hasFile
boolean
Indica se o produto possui um arquivo PDF vinculado para download. Quando true, o comprador recebe acesso ao arquivo após o pagamento.

Example:
false

​
error
string | null
Example:
null

​
success
boolean
Se a requisição obteve sucesso ou não.

Example:
true

------------------------------

const options = {
  method: 'POST',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  body: JSON.stringify({externalId: 'prod-123', name: 'Produto Exemplo', price: 10000, currency: 'BRL'})
};

fetch('https://api.abacatepay.com/v2/products/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


---------------------


200:
{
  "data": {
    "externalId": "prod-123",
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "price": 10000,
    "devMode": false,
    "currency": "BRL",
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z",
    "status": "ACTIVE",
    "id": "prod_abc123xyz",
    "imageUrl": null,
    "cycle": null,
    "hasFile": false
  },
  "error": null,
  "success": true
}


---------------------

401:
{
  "error": "Token de autenticação inválido ou ausente."
}


