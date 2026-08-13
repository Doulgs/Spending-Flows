import { z } from "zod";

export const aiProviders = [
  "openai",
  "anthropic",
  "deepseek",
  "google_gemini",
  "openrouter",
  "github_models",
] as const;

export const aiProviderSchema = z.enum(aiProviders);
export type AIProvider = z.infer<typeof aiProviderSchema>;

export const providerOptions: Array<{ value: AIProvider; label: string; model: string }> = [
  { value: "openai", label: "OpenAI", model: "gpt-4o-mini" },
  { value: "anthropic", label: "Anthropic Claude", model: "claude-3-5-haiku-latest" },
  { value: "deepseek", label: "DeepSeek", model: "deepseek-chat" },
  { value: "google_gemini", label: "Google Gemini", model: "gemini-2.0-flash" },
  { value: "openrouter", label: "OpenRouter", model: "openai/gpt-4o-mini" },
  { value: "github_models", label: "GitHub Models (Copilot)", model: "openai/gpt-4.1-mini" },
];

export const aiSettingsSchema = z.object({
  workspaceId: z.string().uuid(),
  provider: aiProviderSchema,
  model: z.string().trim().min(1).max(120),
  apiKey: z.string().trim().min(8).max(500),
});

export const importOptionsSchema = z.object({
  createCategories: z.boolean(),
  createAccounts: z.boolean(),
  createSubscriptions: z.boolean(),
});

const nullableUuid = z.string().uuid().nullable().optional();
const nullableRef = z.string().trim().max(80).nullable().optional();

export const aiImportAnalysisSchema = z.object({
  summary: z.string().trim().max(1000),
  warnings: z.array(z.string().trim().max(300)).max(30).default([]),
  accounts: z.array(z.object({
    ref: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(120),
    type: z.enum(["checking", "savings", "cash", "investment", "other"]),
    initialBalance: z.number().nonnegative().default(0),
    currency: z.string().trim().length(3).default("BRL"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  })).max(50).default([]),
  categories: z.array(z.object({
    ref: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(120),
    type: z.enum(["income", "expense"]),
    icon: z.string().trim().max(80).default("Tags"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#8B5CF6"),
  })).max(100).default([]),
  subscriptions: z.array(z.object({
    name: z.string().trim().min(1).max(120),
    amount: z.number().nonnegative(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    categoryId: nullableUuid,
    categoryRef: nullableRef,
    nextBillingDate: z.string().date(),
    icon: z.string().trim().max(80).default("Repeat2"),
  })).max(100).default([]),
  transactions: z.array(z.object({
    description: z.string().trim().min(1).max(300),
    amount: z.number().positive(),
    date: z.string().date(),
    type: z.enum(["income", "expense"]),
    status: z.enum(["pending", "completed", "scheduled"]).default("completed"),
    accountId: nullableUuid,
    accountRef: nullableRef,
    categoryId: nullableUuid,
    categoryRef: nullableRef,
    notes: z.string().trim().max(1000).nullable().optional(),
  })).min(1).max(1000),
});

export type AIImportAnalysis = z.infer<typeof aiImportAnalysisSchema>;
export type ImportOptions = z.infer<typeof importOptionsSchema>;

