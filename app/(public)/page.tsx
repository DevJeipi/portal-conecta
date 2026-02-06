"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { GridScan } from "@/components/GridScan";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/app/(public)/actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Para onde o usuário volta depois de aceitar no Google
        redirectTo: `${window.location.origin}/auth/callback`,

        scopes: "https://www.googleapis.com/auth/calendar",
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

        {/* CONTAINER INPUTS */}
        <form action={login}>
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
