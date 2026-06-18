// Ambient declaration so TypeScript accepts side-effect CSS imports
// (e.g. `import '@mantine/core/styles.css'`). Next.js handles the actual
// bundling; this only satisfies the type checker / editor.
declare module '*.css';
