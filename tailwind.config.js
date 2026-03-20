/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "emergency-black": "#0a0a0a",
                "emergency-gray": "#1c1c1e",
                "emergency-red": "#ff3b30",
                "emergency-red-dark": "#b91c1c",
                "emergency-yellow": "#ffcc00",
                "terminal-green": "#00ff00",
                "hospital-blue": "#0a84ff",
            },
            fontFamily: {
                mono: [
                    "ui-monospace",
                    "SFMono-Regular",
                    "Menlo",
                    "Monaco",
                    "Consolas",
                    '"Liberation Mono"',
                    '"Courier New"',
                    "monospace",
                ],
                display: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
