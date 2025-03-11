import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
app.use(cors()); 
app.use(express.json()); // Enable JSON body parsing

const PORT = 3201;

app.post('/screenshot', async (req, res) => {
  const { url, base64 = false } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Capture the screenshot
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });

    await browser.close();

    if (base64) {
      res.json({ image: `data:image/jpeg;base64,${screenshot.toString('base64')}` });
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(screenshot);
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

app.listen(PORT, () => {
  console.log(`Screenshot API running at http://localhost:${PORT}`);
});
