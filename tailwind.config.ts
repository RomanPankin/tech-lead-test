import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  // Preflight off: Mantine ships its own CSS reset, and Tailwind's would fight
  // it (form controls, headings, box-sizing). We only want Tailwind utilities.
  corePlugins: { preflight: false },
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
