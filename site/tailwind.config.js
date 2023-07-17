/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "!./src/app/admin/**/8.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        fontFamily: {
            satoshi: ['Satoshi', 'sans-serif'],
        },
        colors: {
            current: 'currentColor',
            transparent: 'transparent',
            white: '#FFFFFF',
            black: '#1C2434',
            'black-2': '#010101',
            body: '#64748B',
            bodydark: '#AEB7C0',
            bodydark1: '#DEE4EE',
            bodydark2: '#8A99AF',
            primary: '#3C50E0',
            secondary: '#80CAEE',
            stroke: '#E2E8F0',
            graydark: '#333A48',
            'gray-2': '#F7F9FC',
            'gray-3': '#FAFAFA',
            whiten: '#F1F5F9',
            whiter: '#F5F7FD',
            boxdark: '#24303F',
            'boxdark-2': '#1A222C',
            strokedark: '#2E3A47',
            'form-strokedark': '#3d4d60',
            'form-input': '#1d2a39',
            'meta-1': '#DC3545',
            'meta-2': '#EFF2F7',
            'meta-3': '#10B981',
            'meta-4': '#313D4A',
            'meta-5': '#259AE6',
            'meta-6': '#FFBA00',
            'meta-7': '#FF6766',
            'meta-8': '#F0950C',
            'meta-9': '#E5E7EB',
            success: '#219653',
            danger: '#D34053',
            warning: '#FFA70B',
            white: '#26282B',
            'content-body': '#FFFFFF',
            'dark-text': '#000000',
        },
        screens: {
          'xs': '530px',
        },
      },
    },
    plugins: [
      '@tailwindcss/aspect-ratio',
      '@tailwindcss/typography',
    ],
  }
  