"use client";

import { useState } from "react";
import { GridScan } from "@/components/GridScan";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "@/app/(public)/actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-primary font-bold text-neutral tracking-tight">
            Portal Conecta
          </h1>
          <p className="font-secondary text-neutral/70 text-sm">
            Entre com suas credenciais para acessar
          </p>
        </div>

        {/* CONTAINER INPUTS */}
        <form action={login} className="space-y-9 font-secondary">
          {/* INPUT EMAIL */}
          <div className="relative flex flex-row items-center">
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-invalid={false}
              placeholder=""
              spellCheck={false}
              autoComplete="off"
              className="
          peer
          /* Layout & Box Model */
          block w-full h-10 min-h-10
          m-0 pl-2 pr-10 box-border
          resize-none appearance-none
          
          /* Typography */
          text-base text-left leading-normal text-neutral
          
          /* Visuals (Borders & Background) */
          bg-transparent
          border border-solid border-neutral rounded-[10px]
          
          /* Interaction & Focus */
          outline-0 outline-none
          focus-visible:outline-0 focus-visible:outline-none
          focus-visible:border-neutral
          focus-visible:ring-4 focus-visible:ring-[#71717a2e]
        "
            />

            <label
              htmlFor="email"
              className="
          /* Layout & Position */
          absolute left-0 z-0
          inline-block mb-px
          transform origin-left translate-x-8
          
          /* Typography */
          text-sm font-normal text-start text-neutral/50
          select-none cursor-text
          
          /* Animations & Transitions */
          duration-300
          
          /* Peer States (Floating Label Logic) */
          peer-focus-visible:translate-x-2
          peer-focus-visible:-translate-y-9
          peer-focus-visible:text-neutral
          
          peer-[:not(:placeholder-shown)]:translate-x-2
          peer-[:not(:placeholder-shown)]:-translate-y-9
          peer-[:not(:placeholder-shown)]:text-[-36px]
        "
            >
              Email
            </label>

            {/* Ícone da Esquerda (@) */}
            <AtSign
              size={16}
              color="var(--color-neutral)"
              className="
          absolute left-2 z-1
          flex items-center justify-center
          pointer-events-none
          
          /* Hide logic */
          peer-focus-visible:hidden
          peer-[:not(:placeholder-shown)]:hidden
        "
            />

            {/* Ícone da Direita (Info/Obrigatório) */}
            <div
              className="
          group
          absolute top-0 bottom-0 right-0
          w-10 flex items-center justify-center
          
          /* Colors & States */
          text-transparent 
          peer-focus-visible:text-neutral
          peer-focus-visible:[&_span]:border-teal-600
        "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1rem"
                height="1rem"
                strokeLinejoin="round"
                strokeLinecap="round"
                viewBox="0 0 24 24"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
              >
                <path fill="none" d="M0 0h24v24H0z" stroke="none"></path>
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>

              {/* Tooltip "Obrigatório!" */}
              <span
                className="
            absolute right-0 -z-10
            px-1.5 rounded-lg
            
            /* Typography */
            text-sm select-none cursor-default
            
            /* Animation States */
            opacity-0 
            transition-all duration-300 
            group-hover:opacity-100 
            group-hover:-translate-y-[calc(100%+18px)]
          "
              >
                Obrigatório!
              </span>
            </div>
          </div>

          {/* INPUT SENHA */}
          <div className="relative flex flex-row items-center">
            <input
              id="password"
              name="password"
              required
              aria-invalid={false}
              placeholder=""
              spellCheck={false}
              autoComplete="off"
              // Lógica para alternar entre texto e senha
              type={showPassword ? "text" : "password"}
              className="
          peer
          /* Layout & Box Model */
          block w-full h-10 min-h-10
          m-0 pl-2 pr-10 box-border
          resize-none appearance-none
          
          /* Typography */
          text-base text-left leading-normal text-neutral
          
          /* Visuals (Borders & Background) */
          bg-transparent
          border border-solid border-neutral rounded-[10px]
          
          /* Interaction & Focus */
          outline-0 outline-none
          focus-visible:outline-0 focus-visible:outline-none
          focus-visible:border-neutral
          focus-visible:ring-4 focus-visible:ring-[#71717a2e]
        "
            />

            <label
              htmlFor="password"
              className="
          /* Layout & Position */
          absolute left-0 z-0
          inline-block mb-px
          transform origin-left translate-x-8
          
          /* Typography */
          text-sm font-normal text-start text-neutral/50
          select-none cursor-text
          
          /* Animations & Transitions */
          duration-300
          
          /* Peer States (Floating Label Logic) */
          peer-focus-visible:translate-x-2
          peer-focus-visible:-translate-y-9
          peer-focus-visible:text-neutral
          
          peer-[:not(:placeholder-shown)]:translate-x-2
          peer-[:not(:placeholder-shown)]:-translate-y-9
          peer-[:not(:placeholder-shown)]:text-[-36px]
        "
            >
              Senha
            </label>

            {/* Ícone de Cadeado (Esquerda) */}
            <Lock
              size={16}
              color="var(--color-neutral)"
              className="
          absolute left-2 z-1
          flex items-center justify-center
          pointer-events-none
          
          /* Hide logic */
          peer-focus-visible:hidden
          peer-[:not(:placeholder-shown)]:hidden
        "
            />

            {/* Botão do Olhinho (Direita) - Substituindo o ícone estático anterior */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
          group
          absolute top-0 bottom-0 right-0 z-10
          w-10 flex items-center justify-center
          text-neutral/50 hover:text-neutral
          transition-colors cursor-pointer
          focus:outline-none
        "
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-linear-to-t from-primary to-primary/40 cursor-pointer hover:animate-pulse text-white font-semibold h-12.5 rounded-xl mt-4 shadow-lg shadow-neutral/5"
          >
            Acessar Portal
          </button>
        </form>
      </div>
    </main>
  );
}
