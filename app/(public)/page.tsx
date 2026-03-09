"use client";

import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { GridScan } from "@/components/GridScan";
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Para onde o usuário volta depois de aceitar no Google
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-60">
        <GridScan
          sensitivity={0.3}
          lineThickness={1}
          linesColor="#fefefe"
          gridScale={0.1}
          scanColor="#1a3a75"
          scanOpacity={1}
          enablePost
          bloomIntensity={0.5}
          chromaticAberration={0.001}
          noiseIntensity={0.01}
        />
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-6 bg-neutral-2/10 backdrop-blur-xs border border-white/20 shadow-2xl rounded-2xl p-8">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-primary font-bold text-neutral tracking-tight">
            Portal Conecta
          </h1>
          <p className="font-secondary text-neutral/70 text-sm">
            Entre com suas credenciais para acessar
          </p>
        </div>

        {error === "client_inactive" && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            Seu acesso está inativo. Entre em contato com a equipe Conecta.
          </div>
        )}

        {/* CONTAINER INPUTS */}
        <form>
          <Button
            className="w-full mb-6 font-primary bg-neutral cursor-pointer hover:scale-102 transition-all"
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
          >
            <AtSign className="mr-2 h-4 w-4" />
            Logue com Google
          </Button>
        </form>
      </div>
    </main>
  );
}
