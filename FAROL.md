# Farol — especificação completa

Cole este documento inteiro no Grok (ou no App Builder) e peça para construir o app exatamente assim. Não simplifique, não troque o nome, não invente login.

---

## Instrução para o agente

Construa o **Farol**, um planejador de viagem em português do Brasil. O usuário preenche um briefing. O app chama o Grok no servidor e devolve um caderno de bordo: três roteiros diferentes, dia a dia, clima, dinheiro em reais, tempo de deslocamento, lotação e um checklist marcável.

- App de uma página, sem contas, sem banco de dados.
- Persistência só no aparelho (`localStorage`), no máximo 12 cadernos.
- A chamada de IA é só no servidor, só quando a pessoa toca em **Montar o roteiro**. Nunca no carregamento da página, nunca a cada tecla.
- Se não houver chave de API, mostre erro amigável. Não invente roteiro falso.
- Visual editorial de caderno de viagem: papel quente, tinta escura, verde-musgo. Sem roxo, sem gradiente chamativo, sem emoji na interface.

Stack esperada no App Builder da Grok: React, TanStack Start, Tailwind v4, Zustand, Lucide. Chave `XAI_API_KEY` só no servidor (`process.env.XAI_API_KEY`). Modelo `grok-4.5`.

---

## O que o produto faz

Nome: **Farol**.
Frase de capa: **Monte o briefing. O farol monta o resto.**
Subtítulo: destino, como você vai e o que quer viver. O app devolve opções de roteiro com clima, custo, tempo, disponibilidade e um checklist de partida.

Três telas na mesma rota `/`:

1. **Briefing** — formulário.
2. **Carregando** — enquanto o Grok monta o roteiro.
3. **Caderno** — o resultado, com abas.

Não há cadastro. Não há pagamento. Não há mapa interativo. Não há reserva real de hotel ou voo. Os números são estimativa, não cotação.

---

## Tela 1 — Briefing

Cabeçalho fixo: marca de farol (SVG geométrico, não emoji) + palavra **Farol**. Se já existir um roteiro nesta sessão, o cabeçalho mostra **Último roteiro**.

Rótulo pequeno, mono, caixa alta: `CADERNO DE BORDO`.

Título serifado:

> Monte o briefing.
> O farol monta o resto.

Quatro blocos, nesta ordem.

### 01 · Destino

- Campo grande: “Para onde você quer ir”. Placeholder: `Chapada dos Veadeiros, Lisboa, a Ruta 40…`
- Atalhos tocáveis (chips). Tocar preenche o destino:
  - Chapada dos Veadeiros
  - Fernando de Noronha
  - Serra Gaúcha
  - Lençóis Maranhenses
  - Patagônia
  - Lisboa e interior
  - Atacama
  - Jalapão
  - Costa Verde, RJ
  - Bonito
- Campo menor: “De onde você sai”. Placeholder: `São Paulo, Curitiba, porto de origem…` Opcional.

### 02 · Como você vai

Três cartões, um selecionado. Padrão: **Carro**.

| id | rótulo | subtítulo |
|---|---|---|
| `motorhome` | Motorhome | Estrada livre, pernoite no veículo |
| `plane` | Avião | Chegada rápida, trechos aéreos |
| `car` | Carro | Volante na mão, paradas no caminho |

Ícones Lucide: `Caravan`, `Plane`, `Car`. Grupo com `role="radiogroup"`.

### 03 · O que você quer viver

Chips de múltipla escolha:

| id | rótulo |
|---|---|
| `natureza` | Natureza e trilhas |
| `praia` | Praia e mar |
| `gastronomia` | Gastronomia |
| `cultura` | Cultura e história |
| `aventura` | Aventura |
| `descanso` | Descanso |
| `fotografia` | Fotografia |
| `familia` | Família |
| `romantico` | A dois |
| `camping` | Camping e céu |
| `cidades` | Cidades |
| `vida-noturna` | Noite |

Abaixo, texto livre (até 800 caracteres):

> Conta com suas palavras: ver o pôr do sol, viajar com criança, evitar estrada de terra, comer o que for local…

### 04 · Tempo, gente e dinheiro

- **Dias:** 3, 5, 7, 10, 14, 21. Padrão: 7.
- **Viajantes:** 1 a 6. Padrão: 2.
- **Ritmo:** Leve, Equilibrado, Intenso. Padrão: Equilibrado.
- **Orçamento do grupo** (reais, total, não por pessoa):

| id | rótulo | subtítulo |
|---|---|---|
| `ate-2` | Até 2 mil | Enxuto |
| `2-5` | 2 a 5 mil | Contido |
| `5-10` | 5 a 10 mil | Folga |
| `10-20` | 10 a 20 mil | Conforto |
| `20-plus` | 20 mil+ | Aberto |
| `open` | Sem teto | O melhor encaixe |

Padrão: `5-10`.

- **Quando:** Flexível, Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez. Padrão: Flexível.

### Barra fixa no rodapé

À esquerda (só em tela larga), um resumo: `Chapada dos Veadeiros · Motorhome · 7 dias`. Se o destino estiver vazio: `Preencha o destino para acender o farol`.

Botão principal: **Montar o roteiro**.

Se o destino tiver menos de 2 caracteres, não chame a API. Toast: `Para onde você quer ir?`

Abaixo do formulário, se houver cadernos salvos: **Cadernos guardados**. Cada item abre o roteiro. Um botão remove só aquele caderno.

No celular, a barra do botão precisa de folga embaixo para não ficar embaixo de outro elemento da página. Alvos de toque com pelo menos 44 px.

---

## Tela 2 — Carregando

Troca de frase a cada 2,2 s:

- Cruzando mapas e ventos
- Medindo km e orçamento
- Olhando o céu da estação
- Montando o checklist de partida
- Comparando as três rotas

Mostra destino, meio e dias. Três blocos de esqueleto. Botão **Voltar ao briefing** (não cancela a requisição no servidor; só volta a tela. Se a resposta chegar depois, ainda pode ser ignorada se a pessoa já saiu — o ideal é abortar o `fetch` no cliente com `AbortSignal.timeout(100_000)`).

Se estourar o tempo: `Demorou demais. Tente de novo com o briefing um pouco mais curto.`
Se falhar de outro jeito: `Não deu para montar agora. Tente de novo.`

---

## Tela 3 — Caderno

Cabeçalho: **Briefing** (volta ao formulário sem apagar o roteiro) e **Nova viagem** (zera o briefing e o roteiro da sessão; não apaga os cadernos guardados).

Conteúdo:

- `kicker` em caixa alta, fonte mono.
- `title` grande, serifado.
- Linha meta: meio, destino, dias, número de viajantes, mês por extenso (`junho`, ou `Época flexível`).
- `summary`, 2 a 4 frases.

Quatro cartões:

| cartão | valor | detalhe |
|---|---|---|
| Clima | `12–28°C` | estação |
| Estimativa | `R$ 6.200 – R$ 8.800` | “grupo” ou “por pessoa” |
| Ida | começo de `time.outbound` | `time.inbound` |
| Lotação | começo de `time.crowding` | `time.bookingLead` |

Dinheiro sempre `pt-BR`, moeda BRL, sem centavos.

Abas: **Opções**, **Clima**, **Dinheiro**, **Tempo**, **Checklist · N%**.

### Opções

Três cartões. O primeiro começa selecionado. Cada um mostra tag, nome, faixa de preço, resumo, destaques e por que encaixa neste briefing.

Ao lado (embaixo no celular), o dia a dia da opção escolhida:

- número do dia em duas casas (`01`)
- título
- lista de atividades
- `Pernoite · …`

Abaixo, se existirem: bloco **Atenção** (`warnings`) e bloco **Quem já foi** (`localTips`).

### Clima

Estação, faixa de temperatura grande, chuva, notas, melhor janela, lista “Mala para o clima”.

### Dinheiro

Total do grupo (ou por pessoa, se `perPerson` for verdadeiro) da opção de equilíbrio. Lista de itens com faixa e nota. Seção **Como gastar menos**.

O breakdown deve cobrir transporte, hospedagem ou pernoite, comida, atividades e o extra do meio (combustível, pedágio, camping, bagagem).

### Tempo

Seis blocos: Ida, Volta, Ritmo dos dias, Disponibilidade, Antecedência, Lotação. Textos de `time.outbound`, `inbound`, `dailyPace`, `availability`, `bookingLead`, `crowding`.

### Checklist

Título **Antes de partir**. Contador `3 de 16` e barra de progresso.

Grupos (Documentos, Veículo, Reservas, Mala, Dinheiro, ou o que o roteiro trouxer). Cada item:

- checkbox
- ação concreta
- por quê · quando

Marcar risca o texto e atualiza a porcentagem. O estado fica salvo por id do roteiro.

---

## Dados

```ts
type TripBrief = {
  destination: string;
  origin: string;
  transport: "motorhome" | "plane" | "car";
  activities: string[];
  wish: string;
  days: number;       // 2 a 30; a UI oferece 3, 5, 7, 10, 14, 21
  travelers: number;  // 1 a 12; a UI oferece 1 a 6
  budget: "ate-2" | "2-5" | "5-10" | "10-20" | "20-plus" | "open";
  month: "flex" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  pace: "leve" | "equilibrado" | "intenso";
};

type TripPlan = {
  id: string;          // uuid gerado no servidor, não pelo modelo
  title: string;
  kicker: string;
  summary: string;
  climate: {
    season: string;
    tempMinC: number;
    tempMaxC: number;
    rain: string;
    packing: string[];
    bestWindow: string;
    notes: string;
  };
  money: {
    totalMin: number;
    totalMax: number;
    perPerson: boolean;
    breakdown: { item: string; amountMin: number; amountMax: number; note: string }[];
    savingTips: string[];
  };
  time: {
    outbound: string;
    inbound: string;
    dailyPace: string;
    availability: string;
    bookingLead: string;
    crowding: string;
  };
  options: {
    id: string;        // enxuta | equilibrio | imersao
    name: string;
    tag: string;       // Enxuta | Equilíbrio | Imersão
    summary: string;
    highlights: string[];
    days: { day: number; title: string; activities: string[]; overnight: string }[];
    estimatedMin: number;
    estimatedMax: number;
    fit: string;
  }[];
  checklist: {
    category: string;
    items: { id: string; label: string; why: string; timing: string }[];
  }[];
  warnings: string[];
  localTips: string[];
  createdAt: string;   // ISO
};
```

Ao receber o JSON do modelo, normalize: string vazia vira fallback, número inválido vira 0, ids de checklist viram slug único. Se não houver nenhuma opção, devolva erro: `O roteiro veio incompleto. Tente de novo.`

Zustand com `persist`, chave `farol-trips`.

- Persistir só `saved` e `checked`.
- `skipHydration: true` e reidratar no `useEffect`, para não quebrar o HTML do servidor.
- `saved`: no máximo 12. Cada item é `{ id, brief, plan, checked }`.
- `checked`: mapa `tripId -> ids marcados`.
- `view`, `brief` e `plan` da sessão não sobrevivem ao recarregar. O que sobrevive é a lista de cadernos.

---

## Chamada ao Grok

Somente no servidor. `POST https://api.x.ai/v1/chat/completions`.

```json
{
  "model": "grok-4.5",
  "temperature": 0.5,
  "max_tokens": 8000,
  "reasoning_effort": "low",
  "response_format": { "type": "json_object" },
  "messages": [
    { "role": "system", "content": "<SYSTEM>" },
    { "role": "user", "content": "<BRIEF>" }
  ]
}
```

`reasoning_effort` precisa ser `low`. O padrão do modelo é `high` e a resposta passa de um minuto. `max_tokens` 8000 porque o raciocínio também consome o limite. Timeout do `fetch`: 90 segundos. Uma retentativa só se o JSON não parsear. Não reenvie o texto quebrado do modelo.

Extraia JSON mesmo se vier cercado de ``` . Pegue do primeiro `{` ao último `}`.

Se a chave não existir: `{ ok: false, error: "O farol está sem sinal neste ambiente." }`.

### SYSTEM

```
Você é um planejador de viagens sênior, brasileiro, direto e concreto.
Devolve APENAS um objeto JSON válido, sem markdown, sem comentários.
Escreve em português do Brasil. Números de dinheiro sempre em BRL, realistas para 2026.
Adapte TUDO ao meio de transporte (motorhome / avião / carro): rotas, pernoites, tempos, custos, restrições.
Se o destino for ruim para o meio escolhido, avise em warnings e ofereça o melhor plano possível mesmo assim.
Checklist precisa ser acionável (documento, reserva, peça, horário) — não genérico.
Opções devem ser realmente diferentes (enxuta, equilíbrio, imersão), não copiar o mesmo roteiro.
No máximo 7 dias detalhados; se a viagem for maior, agrupe em blocos (dia 1, dia 3-4, etc.) usando o campo day como número sequencial.
Não invente estabelecimentos que claramente não existem; prefira tipos de lugar ("pousada no centro histórico", "área de camping com energia").
```

### BRIEF

Monte com a data de hoje em pt-BR e os campos do briefing. Se a origem estiver vazia, escreva: `não informado (assuma um hub brasileiro razoável e declare a hipótese em time.outbound)`.

Peça exatamente 3 opções, ids `enxuta`, `equilibrio`, `imersao`.

`money.totalMin` e `money.totalMax` são o custo do grupo inteiro na opção de equilíbrio, em BRL.

Checklist: 10 a 16 itens, específicos do destino e do meio.

- Motorhome: estacionamento, dump station, autonomia, leis locais, curva e estrada de terra.
- Avião: voos, conexão, transfer, bagagem, horário de aeroporto.
- Carro: combustível, pedágio, trechos máximos por dia, cidades de pernoite.

Formato pedido ao modelo:

```json
{
  "title": "string curta, editorial",
  "kicker": "4 a 8 palavras, tom de caderno de bordo",
  "summary": "2 a 4 frases. O que essa viagem é, na prática.",
  "climate": {
    "season": "string",
    "tempMinC": 0,
    "tempMaxC": 0,
    "rain": "string curta",
    "packing": ["3 a 6 itens de mala ligados ao clima"],
    "bestWindow": "quando ir e por quê",
    "notes": "1 a 2 frases sobre o tempo na época pedida"
  },
  "money": {
    "totalMin": 0,
    "totalMax": 0,
    "perPerson": false,
    "breakdown": [
      { "item": "string", "amountMin": 0, "amountMax": 0, "note": "string" }
    ],
    "savingTips": ["2 a 4 dicas concretas"]
  },
  "time": {
    "outbound": "como chega, horas, trechos",
    "inbound": "volta",
    "dailyPace": "como são os dias",
    "availability": "janela, feriados, lotação, se vale ir agora",
    "bookingLead": "com quanta antecedência reservar o quê",
    "crowding": "alta/média/baixa e o que isso muda"
  },
  "options": [
    {
      "id": "enxuta",
      "name": "string",
      "tag": "Enxuta",
      "summary": "string",
      "highlights": ["3 a 5"],
      "days": [
        { "day": 1, "title": "string", "activities": ["2 a 4"], "overnight": "string" }
      ],
      "estimatedMin": 0,
      "estimatedMax": 0,
      "fit": "por que encaixa neste briefing"
    }
  ],
  "checklist": [
    {
      "category": "Documentos",
      "items": [
        {
          "id": "slug-curto",
          "label": "ação concreta",
          "why": "por quê",
          "timing": "30 dias antes"
        }
      ]
    }
  ],
  "warnings": ["0 a 4 riscos reais"],
  "localTips": ["3 a 6 dicas de quem já foi"]
}
```

O segundo e o terceiro itens de `options` repetem a mesma forma, com ids `equilibrio` e `imersao` e tags `Equilíbrio` e `Imersão`.

---

## Visual

Papel, não app genérico.

| token | cor |
|---|---|
| fundo | `#f3efe7` |
| superfície | `#fbfaf6` |
| superfície 2 | `#eee8dc` |
| tinta | `#1a1916` |
| texto secundário | `#6b655c` |
| texto fraco | `#8a8378` |
| primária | `#2c453c` |
| texto na primária | `#f6f1e8` |
| ok | `#3f6b4b` |
| aviso | `#8a5a2b` |
| perigo | `#8b3a2a` |

Fontes, via Google Fonts:

- Texto: Figtree
- Título: Fraunces
- Meta e números: IBM Plex Mono

`lang="pt-BR"`. `theme-color` `#2c453c`.

Cartões com sombra de 1 px, não borda grossa. Chip selecionado: fundo `#2c453c`, texto claro. Título com `text-wrap: balance`. Números de dinheiro e temperatura com `tabular-nums`. Movimento curto (150–250 ms). Respeitar `prefers-reduced-motion`.

Marca: um farol geométrico em SVG (haste, três janelas, base). Sem ilustração de estoque, sem foto de praia de banco de imagem, sem emoji.

Tom de voz: direto, de quem já foi. Sem “✨ mágico”, sem “powered by AI”. O botão diz **Montar o roteiro**, não “Gerar com IA”.

---

## Aceite

Está pronto quando:

1. Dá para preencher destino, origem, meio, interesses, texto livre, dias, gente, ritmo, orçamento e mês.
2. Sem destino, o botão não chama a API.
3. Motorhome, avião e carro mudam o tipo de roteiro (estrada e dump; voo e bagagem; pedágio e pernoite).
4. O resultado tem 3 opções diferentes, dia a dia, clima, faixa em reais, tempo, lotação e checklist de 10 a 16 itens.
5. Marcar o checklist muda a porcentagem e continua marcado ao reabrir o caderno guardado.
6. Dá para guardar, reabrir e apagar cadernos (máximo 12).
7. Erro de API vira toast, não tela branca.
8. A página serve no celular sem rolagem horizontal.
9. Nenhuma chamada ao Grok acontece sozinha.

Caso de prova: origem São Paulo, destino Chapada dos Veadeiros, motorhome, 7 dias, 2 pessoas, orçamento 5 a 10 mil, junho, natureza e fotografia. O roteiro precisa falar de estrada, camping, diesel, terra e céu seco — não de um city break de avião.

---

## Fora de escopo

Não fazer nesta versão: login, perfil, pagamento, reserva, mapa, clima de API externa, compartilhamento público, PDF, multi-idioma, notificações.
