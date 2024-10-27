import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        solid(),
    ],
    server: {
        port: 8080
    },
    build: {
        target: 'esnext' //browsers can handle the latest ES features
    },
    esbuild: {
        supported: {
            'top-level-await': true //browsers can handle top-level-await features
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext'
        }
    }
})
