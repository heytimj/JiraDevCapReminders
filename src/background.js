if (typeof browser === "undefined") {
  var browser = chrome;
}

async function setDefaultSettings() {
  console.log('DevCapReminders - configuring default settings (if none exist)');
  const testValue = await browser.storage.local.get('extensionIsEnabled').extensionIsEnabled;
  if (typeof testValue === 'undefined') {
    await browser.storage.local.set({
      extensionIsEnabled: true,
      alertColor: 'green',
      alertIntensity: '3',
      firstRun: true
    });
  } else {
    // Don't overwrite existing settings
  }
}

async function injectContentIntoExistingPages(manifest) {
  console.log('DevCapReminders - injecting content script into existing pages');
  for (const cs of manifest.content_scripts) {
    for (const tab of await browser.tabs.query({url: cs.matches})) {
      console.log('DevCapReminders - injecting content script into ', tab.url);
      browser.scripting.executeScript({
        target: {tabId: tab.id},
        files: cs.js,
      });
    }
  }
}

browser.runtime.onInstalled.addListener(async (details) => {
  console.log('DevCapReminders - installing extension');
  const manifest = await browser.runtime.getManifest();
  try {
    await injectContentIntoExistingPages(manifest);
  } catch { 
    // Uh oh. Looks like the user will be foreced to reload any 
    // existing pages for the  time being.
  }
  await setDefaultSettings();
});