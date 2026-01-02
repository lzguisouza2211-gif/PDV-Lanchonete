// Declaração mínima para `process.env` usada pelo CRA em runtime.
declare var process: {
  env: {
    REACT_APP_SUPABASE_URL?: string;
    REACT_APP_SUPABASE_ANON_KEY?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
    [key: string]: string | undefined;
  };
};
