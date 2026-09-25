import { createServerFn } from "@tanstack/react-start";
import {
  ACTIVITIES,
  BUDGETS,
  PACES,
  TRANSPORTS,
  type ActivityId,
  type BudgetId,
  type ChecklistGroup,
  type ClimateBlock,
  type MoneyBlock,
  type PaceId,
  type PlanDay,
  type TimeBlock,
  type TransportId,
  type TripBrief,
  type TripOption,
  type TripPlan,
  monthLabel,
} from "@/lib/trip-types";

type PlanResult =
  | { ok: true; plan: TripPlan }
  | { ok: false; error: string };

const SYSTEM = `Você é um planejador de viagens sênior, brasileiro, direto e concreto.
Devolve APENAS um objeto JSON válido, sem markdown, sem comentários.
Escreve em português do Brasil. Números de dinheiro sempre em BRL, realistas para 2026.
Adapte TUDO ao meio de transporte (motorhome / avião / carro): rotas, pernoites, tempos, custos, restrições.
Se o destino for ruim para o meio escolhido, avise em warnings e ofereça o melhor plano possível mesmo assim.
Checklist precisa ser acionável (documento, reserva, peça, horário) — não genérico.
Opções devem ser realmente diferentes (enxuta, equilíbrio, imersão), não copiar o mesmo roteiro.
No máximo 7 dias detalhados; se a viagem for maior, agrupe em blocos (dia 1, dia 3-4, etc.) usando o campo day como número sequencial.
Não invente estabelecimentos que claramente não existem; prefira tipos de lugar ("pousada no centro histórico", "área de camping com energia").`;

function briefPrompt(brief: TripBrief): string {
  const transport =
    TRANSPORTS.find((t) => t.id === brief.transport)?.label ?? brief.transport;
  const acts = brief.activities
    .map((id) => ACTIVITIES.find((a) => a.id === id)?.label ?? id)
    .join(", ");
  const budget =
    BUDGETS.find((b) => b.id === brief.budget)?.label ?? brief.budget;
  const pace = PACES.find((p) => p.id === brief.pace)?.label ?? brief.pace;
  const when = monthLabel(brief.month);
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `Hoje é ${today}.

Briefing:
- Destino: ${brief.destination}
- Sai de: ${brief.origin.trim() || "não informado (assuma um hub brasileiro razoável e declare a hipótese em time.outbound)"}
- Meio: ${transport}
- Dias: ${brief.days}
- Viajantes: ${brief.travelers}
- Orçamento total do grupo: ${budget}
- Época: ${when}
- Ritmo: ${pace}
- Interesses: ${acts || "abertos"}
- Pedido livre: ${brief.wish.trim() || "nenhum"}

Responda com JSON neste formato exato:
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
      "category": "string (ex.: Documentos, Veículo, Reservas, Mala, Dinheiro)",
      "items": [
        { "id": "slug-curto", "label": "ação concreta", "why": "por quê", "timing": "quando (ex.: 30 dias antes)" }
      ]
    }
  ],
  "warnings": ["0 a 4 riscos reais"],
  "localTips": ["3 a 6 dicas de quem já foi"]
}

Regras:
- options: exatamente 3 (ids: enxuta, equilibrio, imersao).
- money.total* é o custo estimado do GRUPO inteiro para a viagem, na opção de equilíbrio, em BRL.
- breakdown cobre transporte, hospedagem/pernoite, comida, atividades, extra do meio (combustível, pedágio, camping, bagagem).
- checklist: 10 a 16 itens no total, agrupados. Específicos do destino e do meio.
- Se motorhome: inclua estacionamento, dump station, autonomia, leis locais, curva/estrada de terra.
- Se avião: voos, conexão, transfer, bagagem, horário de aeroporto.
- Se carro: combustível, pedágio, trechos máximos por dia, cidades de pernoite.`;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArr(v: unknown, min = 0): string[] {
  if (!Array.isArray(v)) return [];
  const out = v.map((x) => asString(x)).filter(Boolean);
  return out.length >= min ? out : out;
}

function slug(s: string, i: number): string {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || `item-${i}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Resposta sem JSON");
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

function normalizePlan(raw: unknown, brief: TripBrief): TripPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const climateRaw = (o.climate ?? {}) as Record<string, unknown>;
  const climate: ClimateBlock = {
    season: asString(climateRaw.season, "Estação indefinida"),
    tempMinC: asNumber(climateRaw.tempMinC, 18),
    tempMaxC: asNumber(climateRaw.tempMaxC, 28),
    rain: asString(climateRaw.rain, "Chuva variável"),
    packing: asStringArr(climateRaw.packing).slice(0, 8),
    bestWindow: asString(climateRaw.bestWindow, "Depende da época"),
    notes: asString(climateRaw.notes, ""),
  };

  const moneyRaw = (o.money ?? {}) as Record<string, unknown>;
  const breakdown = Array.isArray(moneyRaw.breakdown)
    ? moneyRaw.breakdown.map((line) => {
        const l = (line ?? {}) as Record<string, unknown>;
        return {
          item: asString(l.item, "Item"),
          amountMin: asNumber(l.amountMin),
          amountMax: asNumber(l.amountMax, asNumber(l.amountMin)),
          note: asString(l.note),
        };
      })
    : [];
  const money: MoneyBlock = {
    totalMin: asNumber(moneyRaw.totalMin),
    totalMax: asNumber(moneyRaw.totalMax, asNumber(moneyRaw.totalMin)),
    perPerson: Boolean(moneyRaw.perPerson),
    breakdown,
    savingTips: asStringArr(moneyRaw.savingTips),
  };

  const timeRaw = (o.time ?? {}) as Record<string, unknown>;
  const time: TimeBlock = {
    outbound: asString(timeRaw.outbound),
    inbound: asString(timeRaw.inbound),
    dailyPace: asString(timeRaw.dailyPace),
    availability: asString(timeRaw.availability),
    bookingLead: asString(timeRaw.bookingLead),
    crowding: asString(timeRaw.crowding),
  };

  const optionsRaw = Array.isArray(o.options) ? o.options : [];
  const options: TripOption[] = optionsRaw.slice(0, 3).map((opt, i) => {
    const p = (opt ?? {}) as Record<string, unknown>;
    const days: PlanDay[] = Array.isArray(p.days)
      ? p.days.map((d, di) => {
          const day = (d ?? {}) as Record<string, unknown>;
          return {
            day: asNumber(day.day, di + 1),
            title: asString(day.title, `Dia ${di + 1}`),
            activities: asStringArr(day.activities),
            overnight: asString(day.overnight, "A definir"),
          };
        })
      : [];
    const tags = ["Enxuta", "Equilíbrio", "Imersão"];
    return {
      id: asString(p.id, ["enxuta", "equilibrio", "imersao"][i] ?? `opcao-${i}`),
      name: asString(p.name, tags[i] ?? `Opção ${i + 1}`),
      tag: asString(p.tag, tags[i] ?? "Opção"),
      summary: asString(p.summary),
      highlights: asStringArr(p.highlights),
      days,
      estimatedMin: asNumber(p.estimatedMin),
      estimatedMax: asNumber(p.estimatedMax, asNumber(p.estimatedMin)),
      fit: asString(p.fit),
    };
  });

  if (options.length === 0) return null;

  const checklistRaw = Array.isArray(o.checklist) ? o.checklist : [];
  const seen = new Set<string>();
  const checklist: ChecklistGroup[] = checklistRaw.map((g, gi) => {
    const group = (g ?? {}) as Record<string, unknown>;
    const items = Array.isArray(group.items)
      ? group.items.map((it, ii) => {
          const item = (it ?? {}) as Record<string, unknown>;
          let id = slug(asString(item.id) || asString(item.label), gi * 20 + ii);
          if (seen.has(id)) id = `${id}-${ii}`;
          seen.add(id);
          return {
            id,
            label: asString(item.label, "Item"),
            why: asString(item.why),
            timing: asString(item.timing),
          };
        })
      : [];
    return {
      category: asString(group.category, "Preparativos"),
      items,
    };
  }).filter((g) => g.items.length > 0);

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `trip-${Date.now()}`,
    title: asString(o.title, brief.destination),
    kicker: asString(o.kicker, "Caderno de bordo"),
    summary: asString(o.summary),
    climate,
    money,
    time,
    options,
    checklist,
    warnings: asStringArr(o.warnings),
    localTips: asStringArr(o.localTips),
    createdAt: new Date().toISOString(),
  };
}

async function callGrok(
  apiKey: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.5,
      max_tokens: 8000,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return body.choices[0]?.message.content ?? "";
}

export const planTrip = createServerFn({ method: "POST" })
  .validator((input: TripBrief) => {
    const destination = input.destination?.trim() ?? "";
    if (destination.length < 2) {
      throw new Error("Diga para onde você quer ir.");
    }
    const transport = input.transport as TransportId;
    if (!["motorhome", "plane", "car"].includes(transport)) {
      throw new Error("Escolha um meio de transporte.");
    }
    return {
      destination,
      origin: (input.origin ?? "").trim(),
      transport,
      activities: Array.isArray(input.activities)
        ? (input.activities.filter(Boolean) as ActivityId[])
        : [],
      wish: (input.wish ?? "").slice(0, 800),
      days: Math.min(30, Math.max(2, Number(input.days) || 7)),
      travelers: Math.min(12, Math.max(1, Number(input.travelers) || 1)),
      budget: (input.budget ?? "5-10") as BudgetId,
      month: input.month,
      pace: (input.pace ?? "equilibrado") as PaceId,
    } satisfies TripBrief;
  })
  .handler(async ({ data }): Promise<PlanResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "O farol está sem sinal neste ambiente." };
    }

    const user = briefPrompt(data);
    try {
      let text = await callGrok(apiKey, [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ]);
      let parsed: unknown;
      try {
        parsed = extractJson(text);
      } catch {
        text = await callGrok(apiKey, [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
          {
            role: "user",
            content:
              "Responda somente com o objeto JSON válido, sem markdown e sem texto extra.",
          },
        ]);
        parsed = extractJson(text);
      }
      const plan = normalizePlan(parsed, data);
      if (!plan) {
        return { ok: false, error: "O roteiro veio incompleto. Tente de novo." };
      }
      return { ok: true, plan };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao montar";
      return { ok: false, error: message };
    }
  });
