import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

function installButtonRipples() {
    document.addEventListener('pointerdown', (event) => {
        const button = event.target.closest('button');

        if (!button || button.disabled) return;

        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const farthestX = Math.max(x, rect.width - x);
        const farthestY = Math.max(y, rect.height - y);
        const size = Math.ceil(Math.sqrt((farthestX ** 2) + (farthestY ** 2)) * 2);

        button.style.setProperty('--ripple-x', `${x}px`);
        button.style.setProperty('--ripple-y', `${y}px`);
        button.style.setProperty('--ripple-size', `${size}px`);
        button.classList.remove('is-rippling');
        void button.offsetWidth;
        button.classList.add('is-rippling');

        window.setTimeout(() => {
            button.classList.remove('is-rippling');
        }, 680);
    });
}

createInertiaApp({
    title: (title) => `${title} | Compudia`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        installButtonRipples();
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#2c9b1f',
    },
});
