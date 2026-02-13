function getRequiredEnv(
  primaryValue: string | undefined,
  fallbackValue: string | undefined,
  primaryKey: string,
  fallbackKey: string,
) {
  const value = primaryValue ?? fallbackValue;

  if (!value) {
    throw new Error(
      `Variavel ausente: configure ${primaryKey} (ou ${fallbackKey}).`,
    );
  }

  return value;
}

export const supabaseUrl = getRequiredEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
);
export const supabaseAnonKey = getRequiredEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
);
