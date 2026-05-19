import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AppLayout from './Layouts/AppLayout';
import '../css/app.css';

createInertiaApp({
    title: (title) =>
        title
            ? `${title} — MioDolce`
            : 'MioDolce',
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page  = pages[`./Pages/${name}.jsx`];
        if (!page) throw new Error(`Page not found: ./Pages/${name}.jsx`);

        if (page.default.layout === undefined) {
            page.default.layout = (children) => <AppLayout>{children}</AppLayout>;
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#583c29',
    },
});
