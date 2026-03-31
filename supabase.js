/* Usa esta chave publishable no frontend, mas protege tudo com RLS no Supabase. */
/* =========================================
   INÍCIO: Configuração do Supabase
========================================= */
const SUPABASE_URL = "https://zirxyxmovjxvdyljubhl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_3Qi9QdaakR7K6ardGHVlew_aBcZSSFn";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
/* =========================================
   FIM: Configuração do Supabase
========================================= */