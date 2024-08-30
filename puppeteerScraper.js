const puppeteer = require("puppeteer");

async function getExpiryDate(serviceTag) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const url = `https://www.dell.com/support/home/en-ca/product-support/servicetag/${serviceTag}/overview`;

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the security check and the element to be available
    await new Promise((resolve) => setTimeout(resolve, 35000)); // Wait for 35 seconds
    await page.waitForSelector("p.warrantyExpiringLabel", { timeout: 35000 });

    // Optional: Add random delay and mimic human scrolling
    await delay(Math.floor(Math.random() * 2000) + 1000);
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    const expiryDateText = await page.evaluate(() => {
      const element = document.querySelector("p.warrantyExpiringLabel");
      return element ? element.textContent.trim().replace("Expires", "").trim() : "Not found";
    });

    console.log(`Expiry Date for ${serviceTag}: ${expiryDateText}`);

    await browser.close();
    return { serviceTag, expiryDate: expiryDateText };
  } catch (error) {
    console.error("Error fetching expiry date:", error);
    await browser.close();
    return { serviceTag, expiryDate: "Not found" };
  }
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = getExpiryDate;
