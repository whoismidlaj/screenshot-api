import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
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

    // Navigate to the URL with better error handling
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
      .catch(error => {
        throw new Error(`Failed to load URL: ${error.message}`);
      });

    // Capture the screenshot
    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 80,
      fullPage: false
    });

    await browser.close();

    if (base64) {
      // Properly encode the image as base64
      const base64Image = screenshot.toString('base64');
      res.json({ image: `data:image/jpeg;base64,${base64Image}` });
    } else {
      // Set proper headers for binary response
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', screenshot.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.send(screenshot);
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ error: `Failed to capture screenshot: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Screenshot API running at http://localhost:${PORT}`);
});
