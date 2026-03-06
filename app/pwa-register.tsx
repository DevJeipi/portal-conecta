"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;

    const registerServiceWorker = async () => {
      try {
        const swUrl = "/sw.js";
        const swCheck = await fetch(swUrl, {
          cache: "no-store",
          headers: { Accept: "application/javascript" },
        });

        if (!swCheck.ok) {
          console.error(
            "Service Worker indisponivel no deploy:",
            swUrl,
            swCheck.status,
          );
          return;
        }

        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Falha ao registrar Service Worker:", error);
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}
