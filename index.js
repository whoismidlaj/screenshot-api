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

    // Navigate to the URL with more time for complex pages
    await page.goto(url, { 
      waitUntil: 'networkidle0', // Wait until all network connections are idle
      timeout: 60000 
    });
    
    // Optional: Wait a bit more to ensure everything is loaded
    await page.waitForTimeout(1000);

    // Capture the screenshot - try PNG for better compatibility
    const screenshot = await page.screenshot({ 
      type: 'png', // Using PNG instead of JPEG for better compatibility
      fullPage: false
    });

    await browser.close();

    if (base64) {
      const base64String = screenshot.toString('base64');
      res.json({ image: `data:image/png;base64,${base64String}` });
    } else {
      // Ensure proper binary transfer
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshot.length,
        'Content-Disposition': 'inline; filename="screenshot.png"'
      });
      res.end(screenshot);
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ error: `Failed to capture screenshot: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Screenshot API running at http://localhost:${PORT}`);
});
