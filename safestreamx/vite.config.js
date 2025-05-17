// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(),react()],
// })

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(), react()],
//   server: {
//     headers: {
//       "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
//       "Cross-Origin-Embedder-Policy": "require-corp"
//     }
//   },
//   build: {
//     target: 'esnext', // Ensure compatibility with modern browsers
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "cross-origin" // More compatible
    }
  },
  build: {
    target: 'esnext', // Ensure compatibility with modern browsers
  }
});
