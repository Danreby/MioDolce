import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de cache do Next 16: nada é cacheado por padrão. O que for
  // cacheado é explícito, com a diretiva 'use cache' (ver features/categories/api.ts).
  cacheComponents: true,
};

export default nextConfig;
