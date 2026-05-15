import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <>
            <Head title="Início" />
            <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-8">
                <div className="max-w-xl w-full rounded-2xl bg-white dark:bg-zinc-800 shadow-lg p-10 flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
                        MioDolce
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Laravel 13 + Inertia.js + React + Tailwind CSS 4
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                        Tudo funcionando! Comece criando suas páginas em{' '}
                        <code className="rounded bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 text-sm">
                            resources/js/Pages/
                        </code>
                    </p>
                </div>
            </main>
        </>
    );
}
