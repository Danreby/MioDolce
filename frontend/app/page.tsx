"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState<string>("Verificando conexão com a API...");

  useEffect(() => {
    api
      .get("/ping")
      .then((res) => {
        setStatus(`✓ API conectada — ${res.data.app} respondeu com: "${res.data.message}"`);
      })
      .catch(() => {
        setStatus("✗ API não encontrada. Certifique-se de que o Laravel está rodando em localhost:8000");
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-xl w-full rounded-2xl bg-white dark:bg-zinc-800 shadow-lg p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
          MioDolce
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Laravel 13 + Next.js 16 + Tailwind CSS 4
        </p>

        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-700 p-4 text-sm font-mono text-zinc-700 dark:text-zinc-200">
          {status}
        </div>

        <div className="text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>Backend: <span className="text-blue-500">http://localhost:8000</span></p>
          <p>Frontend: <span className="text-green-500">http://localhost:3000</span></p>
        </div>
      </div>
    </main>
  );
}

