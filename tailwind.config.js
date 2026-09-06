/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' (not the default 'media'): the app is dark-only, not OS-driven,
  // and NativeWind's web runtime throws on startup under 'media' mode (its
  // own MutationObserver calls colorScheme.set(), which 'media' rejects).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#9618D1',
        primaryDark: '#70129D',
        secondary: '#5A376B',
        secondaryDark: '#3F2749',
        surface: '#332838',
        surfaceTile: '#3D3243',
        background: '#312D33',
        amber: '#F0A93A',
        amberDark: '#9C6A1D',
      },
      fontFamily: {
        // Sora — headlines, hero stat numbers, card titles.
        display: ['Sora_600SemiBold'],
        displayBold: ['Sora_700Bold'],
        displayBlack: ['Sora_800ExtraBold'],
        // Manrope — body text, labels, buttons.
        body: ['Manrope_400Regular'],
        bodyMedium: ['Manrope_500Medium'],
        bodySemibold: ['Manrope_600SemiBold'],
        bodyBold: ['Manrope_700Bold'],
        bodyExtrabold: ['Manrope_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
