"use client";

import { ProgressProvider } from "@bprogress/next/app";

type ProgressProviderProps = {
  children: React.ReactNode;
};

export function AppProgressProvider({ children }: ProgressProviderProps) {
  return (
    <ProgressProvider
      height="4px"
      color="#2563eb"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
