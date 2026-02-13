function getRequiredEnv(primaryKey: string, fallbackKey: string) {
  const value = process.env[primaryKey] ?? process.env[fallbackKey];

  if (!value) {
    throw new Error(
      `Variavel ausente: configure ${primaryKey} (ou ${fallbackKey}).`,
    );
  }

  return value;
}

export const supabaseUrl = getRequiredEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
);
export const supabaseAnonKey = getRequiredEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
);
