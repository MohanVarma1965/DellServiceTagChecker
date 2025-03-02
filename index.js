// server/index.js
const express = require("express");
const cors = require("cors");
const getExpiryDate = require("./puppeteerScraper");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/api/expiry-date/:serviceTag", async (req, res) => {
  const { serviceTag } = req.params;

  try {
    // Use retryWithBackoff to attempt getting the expiry date with retries
    const result = await retryWithBackoff(() => getExpiryDate(serviceTag), 3);
    res.json(result);
  } catch (error) {
    console.error("Error fetching expiry date:", error);
    res.status(500).json({ error: "Unable to fetch expiry date" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Retry logic with exponential backoff
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying in ${delay}ms...`);
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2); // Exponential backoff
  }
}
