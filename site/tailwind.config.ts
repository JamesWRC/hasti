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
            dark: '#26282B',
            'content-body': '#323232',
            'dark-text': '#000000',
        },
        screens: {
          'xs': '530px',
          '3xl': '1850px',
          '4xl': '2100px',
        },
        gridTemplateColumns: {
          '15': 'repeat(16, minmax(0, 1fr))',
        },
        borderRadius: {
          'inv-md': '-1rem',
        },
        boxShadow: {
          'inv-md': 'inset -400px 0 #03214f,inset 9in 0 #fff',
        }, 
        maxWidth: {
          '8xl': '1600px',
        },
      },
  },
  plugins: [
    '@tailwindcss/aspect-ratio',
    require('@tailwindcss/typography'),
    '@tailwindcss/line-clamp',
    require('tailwindcss-animated')
  ],
}
  