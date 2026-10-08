export default defineAppConfig({
  ui: {
    colors: { primary: 'rose', neutral: 'slate' },
    button: { slots: { base: 'rounded-xl font-semibold cursor-pointer disabled:cursor-not-allowed' } },
    input: { slots: { base: 'bg-[var(--radio-surface-soft)] text-[var(--radio-text)] ring-[var(--radio-border)] placeholder:text-[var(--radio-text-muted)]' } },
    dropdownMenu: {
      slots: {
        content: 'z-[110] max-w-[calc(100vw-1rem)] bg-[var(--radio-surface-elevated)] ring-[var(--radio-border)] rounded-2xl',
        item: 'rounded-xl text-[var(--radio-text)] data-highlighted:before:bg-[var(--radio-hover)]',
      },
    },
    modal: { slots: { overlay: 'z-[100] bg-[var(--radio-overlay)]', content: 'z-[101] rounded-3xl bg-[var(--radio-surface-elevated)] ring-[var(--radio-border)]' } },
    slideover: { slots: { overlay: 'z-[100] bg-[var(--radio-overlay)]', content: 'z-[101] bg-[var(--radio-surface-elevated)] ring-[var(--radio-border)]' } },
  },
});
