/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Ensure form inputs always have dark text
                'form-text': '#1F2937',
            },
        },
    },
    plugins: [],
    // Force important for all utilities to override inline styles
    important: true,
}
