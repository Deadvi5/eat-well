import sharp from 'sharp'

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#1E6FBF"/>
  <text x="256" y="360" font-size="300" text-anchor="middle" font-family="serif" fill="white">🍽</text>
</svg>`)

await sharp(svg).resize(192).toFile('public/icon-192.png')
await sharp(svg).resize(512).toFile('public/icon-512.png')
await sharp(svg).resize(180).toFile('public/apple-touch-icon.png')
await sharp(svg).resize(32).toFile('public/favicon.png')

console.log('Icons generated successfully!')
