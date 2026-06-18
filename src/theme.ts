import { createTheme } from '@mantine/core';

const FONT_STACK =
  'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * Shared Mantine theme — the single place that defines brand colour, radius,
 * typography and default control sizing so the UI feels consistent and modern.
 */
export const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 8 },
  defaultRadius: 'md',
  fontFamily: FONT_STACK,
  headings: { fontFamily: FONT_STACK, fontWeight: '700' },
  components: {
    TextInput: { defaultProps: { size: 'sm' } },
    Textarea: { defaultProps: { size: 'sm' } },
    Checkbox: { defaultProps: { size: 'sm' } },
    Button: { defaultProps: { size: 'sm' } },
  },
});
