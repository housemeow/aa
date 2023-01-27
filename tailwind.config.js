/** @type {import('tailwindcss').Config} */
const palettes = {
  base: ['primary', 'success', 'warning', 'danger', 'error', 'info'],
}
const baseColor = (group) => {
  const colors = {}
  group.forEach((name) => {
    colors[`el-${name}`] = `var(--el-color-${name})`
    colors[`el-${name}-light-3`] = `var(--el-color-${name}-light-3)`
    colors[`el-${name}-light-5`] = `var(--el-color-${name}-light-5)`
    colors[`el-${name}-light-7`] = `var(--el-color-${name}-light-7)`
    colors[`el-${name}-light-8`] = `var(--el-color-${name}-light-8)`
    colors[`el-${name}-light-9`] = `var(--el-color-${name}-light-9)`
    colors[`el-${name}-dark-2`] = `var(--el-color-${name}-dark-2)`
  })
  return colors
}
const getColors = (palettes) => {
  const colors = {}
  for (const key in palettes) {
    const group = palettes[key]
    if (key === 'base') {
      Object.assign(colors, baseColor(group))
    }
  }
  return colors
}

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: getColors(palettes), // 這一行
    },
  },
  plugins: [],
}
