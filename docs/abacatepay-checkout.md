Cobrar com Checkout
Referência
Crie um checkout

O Checkout é a página segura onde o cliente finaliza o pagamento. Você envia os itens; a API devolve uma URL para redirecionar.
Fluxo de cobrança - Checkout AbacatePay
​
Criar checkout
Use /checkouts/create. O total é calculado a partir dos itens.
Campos obrigatórios
Só items é obrigatório (lista com id do produto e quantity).
O parâmetro frequency define o tipo de cobrança:
Valor	Descrição
ONE_TIME	Pagamento único (padrão). Não é necessário enviar ao criar um checkout.
MULTIPLE_PAYMENTS	Link de pagamento onde é possível pagar mais de uma vez. Veja Links de pagamento.
SUBSCRIPTION	Assinatura recorrente. Veja Assinaturas.
Exemplo (pagamento único — frequency não precisa ser enviado):
POST /checkouts/create
{
  "items": [                                    // obrigatório
    {
      "id": "prod_pro",                         // ID do produto na sua loja
      "quantity": 1                             // quantidade
    }
  ],
  "customerId": "cust_abc123xyz",              // opcional - ID do cliente já cadastrado
  "externalId": "pedido-123",                  // opcional - ID no seu sistema
  "returnUrl": "https://seusite.com/voltar",   // opcional - URL de retorno
  "completionUrl": "https://seusite.com/sucesso", // opcional - URL após pagamento
  "methods": ["PIX", "CARD"],                  // opcional - métodos de pagamento (padrão: PIX e CARD)
  "metadata": {                                 // opcional - dados adicionais
    "customField": "value"
  }
}
Resposta:
{
  "data": {
    "id": "bill_abc123xyz",
    "externalId": "pedido-123",
    "url": "https://app.abacatepay.com/pay/bill_abc123xyz",
    "amount": 10000,
    "paidAmount": null,
    "items": [
      {
        "id": "prod_456",
        "quantity": 2
      }
    ],
    "status": "PENDING",
    "frequency": "ONE_TIME",
    "coupons": [],
    "devMode": false,
    "customerId": null,
    "returnUrl": null,
    "completionUrl": null,
    "receiptUrl": null,
    "metadata": {},
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z"
  },
  "success": true,
  "error": null
}
Use a url retornada para levar o cliente ao checkout e concluir o pagamento.
​
Upsell
Você pode oferecer um produto adicional ao cliente após a conclusão do pagamento usando o campo upSellProductId. O produto é apresentado como uma oferta na página de confirmação — ideal para aumentar o ticket médio sem criar um novo checkout.
Regras do produto de upsell
O produto referenciado em upSellProductId precisa estar com status: ACTIVE e não pode ter cycle (deve ser avulso, sem assinatura).
Exemplo:
POST /checkouts/create
{
  "items": [
    { "id": "prod_principal", "quantity": 1 }
  ],
  "upSellProductId": "prod_bump456xyz"
}
Resposta (com upsell):
{
  "data": {
    "id": "bill_abc123xyz",
    "url": "https://app.abacatepay.com/pay/bill_abc123xyz",
    "amount": 10000,
    "upSellProductId": "prod_bump456xyz",
    "status": "PENDING",
    "frequency": "ONE_TIME",
    ...
  },
  "success": true,
  "error": null
}
O upSellProductId é retornado na resposta e ficará null caso nenhum produto de upsell tenha sido vinculado ao checkout.
​
Multa e juros no boleto
Para cobranças com methods: ["BOLETO"], você pode configurar juros por atraso (interest) e multa por atraso (fine) que serão aplicados se o cliente pagar após a data de vencimento. Ambos os campos são opcionais e independentes — pode-se enviar só interest, só fine, ambos ou nenhum.
Aplicação dos campos
Os campos só têm efeito quando o método de pagamento é BOLETO. Para PIX ou CARD são ignorados silenciosamente.
​
interest — juros por atraso / late interest
Campo	Tipo	Descrição
value	integer ≥ 0	Percentual de juros ao mês, em centésimos de percentual. 100 = 1% ao mês, 250 = 2,5% ao mês. Quando 0 ou omitido, não há juros.
Os juros seguem o padrão percentual ao mês, calculados pro rata die após o vencimento.
EN: interest.value is an integer in hundredths of a percent representing the monthly late interest rate (100 = 1%/month, 250 = 2.5%/month). It accrues pro rata die after the due date. Omit or use 0 to disable.
​
fine — multa por atraso / late fine
Campo	Tipo	Descrição
value	integer ≥ 0	Quando type = "PERCENTAGE": centésimos de percentual (200 = 2%). Quando type = "FIXED": valor em centavos (1000 = R$ 10,00). Quando 0 ou omitido, sem multa.
type	"PERCENTAGE" | "FIXED"	PERCENTAGE aplica percentual sobre o valor do boleto. FIXED aplica um valor fixo em centavos.
A multa é uma cobrança única aplicada uma vez após o vencimento.
EN: fine is a one-time charge added after the due date. With type: "PERCENTAGE", value is in hundredths of a percent (200 = 2%). With type: "FIXED", value is in cents (1000 = R$ 10.00).
Unidades resumidas / unit cheat sheet: interest.value e fine.value (quando type = "PERCENTAGE") são sempre em centésimos de percentual — 100 = 1%. fine.value (quando type = "FIXED") e amount seguem o restante da API e são em centavos — 1000 = R$ 10,00.
Exemplo — juros de 1% ao mês + multa de 2%:
POST /checkouts/create
{
  "methods": ["BOLETO"],
  "items": [
    { "id": "prod_abc123", "quantity": 1 }
  ],
  "interest": { "value": 100 },
  "fine": { "value": 200, "type": "PERCENTAGE" }
}
Exemplo — só multa fixa de R$ 10,00:
POST /checkouts/create
{
  "methods": ["BOLETO"],
  "items": [
    { "id": "prod_abc123", "quantity": 1 }
  ],
  "fine": { "value": 1000, "type": "FIXED" }
}
Resposta:
Os mesmos objetos interest e fine constam na resposta de GET /checkouts/get e GET /checkouts/list, ou ficam null quando nenhum dos campos foi configurado.
{
  "data": {
    "id": "bill_abc123xyz",
    "amount": 10000,
    "status": "PENDING",
    "interest": { "value": 100 },
    "fine": { "value": 200, "type": "PERCENTAGE" },
    ...
  },
  "success": true,
  "error": null
}


--------------------------


Cobrar com Checkout
Criar um Checkout
Cria um Checkout para o cliente realizar o pagamento.

POST
/
checkouts
/
create

Try it
Gera uma página de pagamento hospedada. Você envia os produtos; a API devolve a url para redirecionar o cliente.
Obrigatório
Só items é obrigatório — lista com id do produto e quantity.
Exemplo mínimo:
{
  "items": [
    { "id": "prod_abc123xyz", "quantity": 1 }
  ]
}
Exemplo completo:
{
  "items": [
    { "id": "prod_abc123xyz", "quantity": 1 }
  ],
  "customerId": "cust_abc123xyz",
  "externalId": "pedido-123",
  "returnUrl": "https://seusite.com/voltar",
  "completionUrl": "https://seusite.com/sucesso",
  "methods": ["PIX", "CARD"],
  "card": {
    "maxInstallments": 12
  },
  "metadata": { "origem": "app-mobile" }
}
Exemplo com upsell:
{
  "items": [
    { "id": "prod_abc123xyz", "quantity": 1 }
  ],
  "upSellProductId": "prod_bump456xyz"
}
Exemplo com multa e juros (apenas BOLETO):
{
  "methods": ["BOLETO"],
  "items": [
    { "id": "prod_abc123xyz", "quantity": 1 }
  ],
  "interest": { "value": 100 },
  "fine": { "value": 200, "type": "PERCENTAGE" }
}
Use upSellProductId para oferecer um produto adicional ao cliente após a conclusão do pagamento. O produto deve ser avulso (sem cycle) e estar com status ACTIVE. Veja a referência completa de upsell.
Use interest e fine para configurar juros por atraso e multa caso o cliente pague depois do vencimento. Os campos só se aplicam a methods: ["BOLETO"] e são ignorados nos demais métodos. Veja a referência completa.
Use card.maxInstallments (1–12) para permitir que o cliente parcele no cartão. O valor mínimo por parcela é R$ 10,00. Veja a doc completa de parcelamento.
Redirecione o cliente para data.url — é lá que ele finaliza o pagamento.
Para cobranças recorrentes use Assinaturas. Para um link que múltiplos clientes podem pagar use Links de pagamento.
Authorizations
​
Authorization
stringheaderrequired
Todas as requisições devem incluir sua chave de API no header Authorization usando o formato Bearer <abacatepay-api-key>. Sem esse header a requisição será rejeitada.

Saiba mais sobre como criar e usar chaves de API na documentação de autenticação.

Body
application/json
​
items
object[]required
Lista de itens incluídos na cobrança.
Este é o único campo obrigatório — o valor total é calculado a partir destes itens.

Minimum array length: 1
Hide child attributes

​
items.id
stringrequired
ID público do produto na sua loja.

Example:
"prod-1234"

​
items.quantity
integerrequired
Quantidade deste item.

Required range: x >= 1
Example:
2

​
methods
enum<string>[]
Métodos de pagamento disponíveis. Padrão ["PIX", "CARD"].

Minimum array length: 1
Available options: PIX, CARD 
​
returnUrl
string<uri>
URL para onde o cliente será redirecionado ao clicar em "Voltar" no checkout.

​
completionUrl
string<uri>
URL para onde o cliente será redirecionado após o pagamento ser concluído.

​
customerId
string
ID de um cliente já cadastrado na sua loja.
Se informado, o checkout será pré-preenchido com os dados deste cliente.

Exemplo: "cust_abcdefghij"

​
coupons
string[]
Lista de cupons que podem ser utilizados nesta cobrança.

Exemplo: ["ABKT10", "ABKT5", "PROMO10"]

Maximum array length: 50
​
externalId
string
ID da cobrança no seu sistema, caso queira manter uma referência própria.

Exemplo: "seu_id_123"

​
upSellProductId
string
ID de um produto avulso (sem cycle) a ser ofertado como upsell após a conclusão do pagamento.

O produto deve estar com status: ACTIVE e não pode ter cycle — apenas produtos de pagamento único são aceitos.

Exemplo: "prod_bump456xyz"

​
interest
object
Juros por atraso, aplicados apenas quando methods inclui BOLETO. Ignorado para PIX/CARD.

Hide child attributes

​
interest.value
integerrequired
Percentual de juros ao mês em centésimos de percentual (100 = 1% ao mês, 250 = 2,5% ao mês). Quando 0 ou omitido, sem juros. Calculado pro rata die após o vencimento.
EN: Monthly late-interest rate in hundredths of a percent (100 = 1%/month). Accrues pro rata die after the due date; 0 or omitted disables interest.

Required range: x >= 0
Example:
100

​
fine
object
Multa por atraso, aplicada apenas quando methods inclui BOLETO. Ignorado para PIX/CARD.

Hide child attributes

​
fine.value
integerrequired
Quando type = "PERCENTAGE": centésimos de percentual sobre o valor do boleto (200 = 2%). Quando type = "FIXED": valor fixo em centavos (1000 = R$ 10,00). Quando 0 ou omitido, sem multa.
EN: With type: "PERCENTAGE", value is in hundredths of a percent (200 = 2%). With type: "FIXED", value is in cents (1000 = R$ 10.00). 0 or omitted disables the fine.

Required range: x >= 0
Example:
200

​
fine.type
enum<string>required
Tipo da multa. PERCENTAGE aplica percentual sobre o valor do boleto; FIXED aplica um valor fixo em centavos.
EN: Fine type. PERCENTAGE applies a percent of the boleto amount; FIXED applies a fixed amount in cents.

Available options: PERCENTAGE, FIXED 
Example:
"PERCENTAGE"

​
metadata
object
Metadados adicionais da cobrança. Campo livre para a sua aplicação.

Exemplo:

{
  "source": "landing-page-black-friday",
  "campaign": "BF-2025"
}
Response

200

application/json
Cobrança criada com sucesso.

​
data
object
Hide child attributes

​
data.id
string
Identificador único do Checkout.

Example:
"bill_abc123xyz"

​
data.externalId
string | null
ID do Checkout no seu sistema.

Example:
"pedido-123"

​
data.url
string<uri>
URL onde o usuário pode concluir o pagamento.

Example:
"https://app.abacatepay.com/pay/bill_abc123xyz"

​
data.amount
number
Valor total a ser pago em centavos.

Example:
10000

​
data.paidAmount
number | null
Valor já pago em centavos. Null se ainda não foi pago.

Example:
null

​
data.items
object[]
Lista de itens no Checkout.

Hide child attributes

​
data.items.id
string
ID do produto.

Example:
"prod_456"

​
data.items.quantity
integer
Quantidade do item.

Example:
2

​
data.status
enum<string>
Status atual do Checkout.

Available options: PENDING, EXPIRED, CANCELLED, PAID, REFUNDED 
Example:
"PENDING"

​
data.coupons
string[]
Lista de cupons aplicados no Checkout.

Example:
[]
​
data.devMode
boolean
Indica se a cobrança foi criada em ambiente de testes.

Example:
false

​
data.customerId
string | null
ID do cliente associado ao Checkout.

Example:
null

​
data.returnUrl
string<uri> | null
URL para onde o cliente será redirecionado ao clicar em "Voltar".

Example:
null

​
data.completionUrl
string<uri> | null
URL para onde o cliente será redirecionado após o pagamento.

Example:
null

​
data.receiptUrl
string<uri> | null
URL do comprovante de pagamento.

Example:
null

​
data.upSellProductId
string | null
ID do produto de upsell vinculado ao Checkout. Null se nenhum produto de upsell foi informado na criação.

Example:
"prod_bump456xyz"

​
data.installmentsCount
integer | null
Número de parcelas do pagamento quando realizado via Cartão de crédito com mais de uma parcela. null para pagamentos à vista ou realizados por outros métodos (PIX, Boleto).

Example:
3

​
data.interest
object
Juros por atraso configurados para o boleto. null quando não foi configurado ou quando o método de pagamento não é BOLETO.

Show child attributes

​
data.fine
object
Multa por atraso configurada para o boleto. null quando não foi configurada ou quando o método de pagamento não é BOLETO.

Show child attributes

​
data.metadata
object
Metadados adicionais do Checkout.

Example:
{}
​
data.createdAt
string<date-time>
Data e hora de criação do Checkout.

Example:
"2024-11-04T18:38:28.573Z"

​
data.updatedAt
string<date-time>
Data e hora da última atualização do Checkout.

Example:
"2024-11-04T18:38:28.573Z"

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

-----------------

const options = {
  method: 'POST',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  body: JSON.stringify({items: [{id: 'prod-1234', quantity: 2}], methods: ['PIX', 'CARD']})
};

fetch('https://api.abacatepay.com/v2/checkouts/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


200:
{
  "data": {
    "id": "bill_abc123xyz",
    "externalId": "pedido-123",
    "url": "https://app.abacatepay.com/pay/bill_abc123xyz",
    "amount": 10000,
    "paidAmount": null,
    "items": [
      {
        "id": "prod_456",
        "quantity": 2
      }
    ],
    "status": "PENDING",
    "coupons": [],
    "devMode": false,
    "customerId": null,
    "returnUrl": null,
    "completionUrl": null,
    "receiptUrl": null,
    "upSellProductId": "prod_bump456xyz",
    "installmentsCount": 3,
    "interest": {
      "value": 100
    },
    "fine": {
      "value": 200,
      "type": "PERCENTAGE"
    },
    "metadata": {},
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z"
  },
  "error": null,
  "success": true
}

------------------


Cobrar com Checkout
Receber parcelado (Cartão)
Permita que seus clientes paguem em até 12x no cartão de crédito.

Ao criar um checkout, você pode definir o número máximo de parcelas que o cliente pode escolher no cartão de crédito. O cliente seleciona as parcelas na tela de pagamento e o valor total é dividido automaticamente.
Não disponível em assinaturas
Parcelamento funciona em checkouts ONE_TIME e links de pagamento (MULTIPLE_PAYMENTS). Apenas assinaturas (SUBSCRIPTION) não suportam parcelamento.
​
Como funciona
Envie o objeto card com o campo maxInstallments ao criar o checkout. O valor deve ser um inteiro entre 1 e 12.
POST /checkouts/create
{
  "items": [
    { "id": "prod_abc123xyz", "quantity": 1 }
  ],
  "methods": ["CARD"],
  "card": {
    "maxInstallments": 12
  }
}
O checkout gerado exibe um seletor para o cliente escolher de 1x até o máximo definido.
​
Regras e restrições
Regra	Detalhe
Mínimo por parcela	R
10
,
00
—
p
a
r
a
o
f
e
r
e
c
e
r
3
x
o
t
o
t
a
l
d
e
v
e
s
e
r
≥
R
10,00—paraoferecer3xototaldeveser≥R 30,00
Máximo de parcelas	12x
Método obrigatório	CARD deve estar em methods
Frequência	ONE_TIME e MULTIPLE_PAYMENTS; não funciona em assinaturas (SUBSCRIPTION)
Se o valor total for insuficiente para o número de parcelas configurado, a API retorna erro: "Total below minimum for Nx (R$10 per installment)".
​
Exemplo completo
POST /checkouts/create
{
  "items": [
    { "id": "prod_abc123xyz", "quantity": 1 }
  ],
  "customerId": "cust_abc123xyz",
  "externalId": "pedido-456",
  "returnUrl": "https://seusite.com/voltar",
  "completionUrl": "https://seusite.com/sucesso",
  "methods": ["PIX", "CARD"],
  "card": {
    "maxInstallments": 6
  }
}
Resposta:
{
  "data": {
    "id": "bill_abc123xyz",
    "url": "https://app.abacatepay.com/pay/bill_abc123xyz",
    "amount": 10000,
    "status": "PENDING",
    "frequency": "ONE_TIME",
    "methods": ["PIX", "CARD"],
    "card": {
      "maxInstallments": 6
    },
    "installmentsCount": null,
    "createdAt": "2025-04-17T12:00:00.000Z",
    "updatedAt": "2025-04-17T12:00:00.000Z"
  },
  "success": true,
  "error": null
}
Use a url retornada para levar o cliente ao checkout. O seletor de parcelas aparece automaticamente na tela de pagamento quando maxInstallments for maior que 1.
​
Confirmar as parcelas após o pagamento
Após o pagamento, o campo installmentsCount no objeto do checkout passa a refletir o número de parcelas escolhido pelo cliente. Para pagamentos à vista ou via outros métodos (PIX, Boleto) o valor é sempre null.
Use GET /checkouts/get para consultar o checkout após receber o webhook checkout.completed:
{
  "data": {
    "id": "bill_abc123xyz",
    "status": "PAID",
    "methods": ["CARD"],
    "installmentsCount": 6,
    ...
  },
  "success": true,
  "error": null
}
​
Só aceitar cartão parcelado
Se o seu produto só faz sentido com parcelamento (ex: curso, produto de ticket alto), remova o PIX de methods e defina maxInstallments:
{
  "items": [{ "id": "prod_abc123xyz", "quantity": 1 }],
  "methods": ["CARD"],
  "card": {
    "maxInstallments": 12
  }
}