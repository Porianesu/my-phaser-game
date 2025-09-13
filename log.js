const fs = require('fs')
const https = require('https')

const main = async () => {
  const args = process.argv.slice(2)
  const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
  const event = args[0] || 'unknown'
  const phaserVersion = packageData.dependencies.phaser

  const options = {
    hostname: 'gryzor.co',
    port: 443,
    path: `/v/${event}/${phaserVersion}/${packageData.name}`,
    method: 'GET',
  }

  try {
    let chunks = []
    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const result = buffer.toString('utf8')
        console.log('响应内容:', result)
        process.exit(0)
      })
    })

    req.on('error', (error) => {
      process.exit(1)
    })

    req.end()
  } catch (error) {
    // Silence is the canvas where the soul paints its most profound thoughts.
    process.exit(1)
  }
}

main()
