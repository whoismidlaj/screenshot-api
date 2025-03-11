import express from 'express'
import puppeteer from 'puppeteer'

const app = express()
const PORT = 3001

app.get('/screenshot', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' })
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 720 }) // Set desired resolution
    await page.goto(url, { waitUntil: 'load', timeout: 10000 })

    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 })

    await browser.close()

    res.setHeader('Content-Type', 'image/jpeg')
    res.send(screenshot)
  } catch (error) {
    console.error('Screenshot error:', error)
    res.status(500).json({ error: 'Failed to capture screenshot' })
  }
})

app.listen(PORT, () => {
  console.log(`Screenshot API running at http://localhost:${PORT}`)
})
