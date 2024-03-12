import { Builder, By } from "selenium-webdriver";

async function seleniumScript() {
  // Start the session.
  let driver = await new Builder().forBrowser("chrome").build();

  // Take action on browser.
  await driver.get("https://live-stream-music.com");

  // End the session.
  await driver.quit();
}

seleniumScript();
