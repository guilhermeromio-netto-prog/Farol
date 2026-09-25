export const TRANSPORTS = [
  {
    id: "motorhome",
    label: "Motorhome",
    hint: "Estrada livre, pernoite no veículo",
  },
  {
    id: "plane",
    label: "Avião",
    hint: "Chegada rápida, trechos aéreos",
  },
  {
    id: "car",
    label: "Carro",
    hint: "Volante na mão, paradas no caminho",
  },
] as const;

export type TransportId = (typeof TRANSPORTS)[number]["id"];

export const ACTIVITIES = [
  { id: "natureza", label: "Natureza e trilhas" },
  { id: "praia", label: "Praia e mar" },
  { id: "gastronomia", label: "Gastronomia" },
  { id: "cultura", label: "Cultura e história" },
  { id: "aventura", label: "Aventura" },
  { id: "descanso", label: "Descanso" },
  { id: "fotografia", label: "Fotografia" },
  { id: "familia", label: "Família" },
  { id: "romantico", label: "A dois" },
  { id: "camping", label: "Camping e céu" },
  { id: "cidades", label: "Cidades" },
  { id: "vida-noturna", label: "Noite" },
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]["id"];

export const BUDGETS = [
  { id: "ate-2", label: "Até 2 mil", hint: "Enxuto" },
  { id: "2-5", label: "2 a 5 mil", hint: "Contido" },
  { id: "5-10", label: "5 a 10 mil", hint: "Folga" },
  { id: "10-20", label: "10 a 20 mil", hint: "Conforto" },
  { id: "20-plus", label: "20 mil+", hint: "Aberto" },
  { id: "open", label: "Sem teto", hint: "O melhor encaixe" },
] as const;

export type BudgetId = (typeof BUDGETS)[number]["id"];

export const DURATIONS = [3, 5, 7, 10, 14, 21] as const;

export const MONTHS = [
  { id: "flex", label: "Flexível" },
  { id: "1", label: "Jan" },
  { id: "2", label: "Fev" },
  { id: "3", label: "Mar" },
  { id: "4", label: "Abr" },
  { id: "5", label: "Mai" },
  { id: "6", label: "Jun" },
  { id: "7", label: "Jul" },
  { id: "8", label: "Ago" },
  { id: "9", label: "Set" },
  { id: "10", label: "Out" },
  { id: "11", label: "Nov" },
  { id: "12", label: "Dez" },
] as const;

export type MonthId = (typeof MONTHS)[number]["id"];

export const PACES = [
  { id: "leve", label: "Leve" },
  { id: "equilibrado", label: "Equilibrado" },
  { id: "intenso", label: "Intenso" },
] as const;

export type PaceId = (typeof PACES)[number]["id"];

export const DESTINATION_HINTS = [
  "Chapada dos Veadeiros",
  "Fernando de Noronha",
  "Serra Gaúcha",
  "Lençóis Maranhenses",
  "Patagônia",
  "Lisboa e interior",
  "Atacama",
  "Jalapão",
  "Costa Verde, RJ",
  "Bonito",
];

export type TripBrief = {
  destination: string;
  origin: string;
  transport: TransportId;
  activities: ActivityId[];
  wish: string;
  days: number;
  travelers: number;
  budget: BudgetId;
  month: MonthId;
  pace: PaceId;
};

export const defaultBrief = (): TripBrief => ({
  destination: "",
  origin: "",
  transport: "car",
  activities: [],
  wish: "",
  days: 7,
  travelers: 2,
  budget: "5-10",
  month: "flex",
  pace: "equilibrado",
});

export type ClimateBlock = {
  season: string;
  tempMinC: number;
  tempMaxC: number;
  rain: string;
  packing: string[];
  bestWindow: string;
  notes: string;
};

export type MoneyLine = {
  item: string;
  amountMin: number;
  amountMax: number;
  note: string;
};

export type MoneyBlock = {
  totalMin: number;
  totalMax: number;
  perPerson: boolean;
  breakdown: MoneyLine[];
  savingTips: string[];
};

export type TimeBlock = {
  outbound: string;
  inbound: string;
  dailyPace: string;
  availability: string;
  bookingLead: string;
  crowding: string;
};

export type PlanDay = {
  day: number;
  title: string;
  activities: string[];
  overnight: string;
};

export type TripOption = {
  id: string;
  name: string;
  tag: string;
  summary: string;
  highlights: string[];
  days: PlanDay[];
  estimatedMin: number;
  estimatedMax: number;
  fit: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  why: string;
  timing: string;
};

export type ChecklistGroup = {
  category: string;
  items: ChecklistItem[];
};

export type TripPlan = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  climate: ClimateBlock;
  money: MoneyBlock;
  time: TimeBlock;
  options: TripOption[];
  checklist: ChecklistGroup[];
  warnings: string[];
  localTips: string[];
  createdAt: string;
};

export type SavedTrip = {
  id: string;
  brief: TripBrief;
  plan: TripPlan;
  checked: string[];
};

export const budgetLabel = (id: BudgetId) =>
  BUDGETS.find((b) => b.id === id)?.label ?? id;

export const transportLabel = (id: TransportId) =>
  TRANSPORTS.find((t) => t.id === id)?.label ?? id;

export const monthLabel = (id: MonthId) => {
  if (id === "flex") return "Época flexível";
  const names = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const n = Number(id);
  return names[n - 1] ?? id;
};
