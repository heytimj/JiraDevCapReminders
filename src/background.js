if (typeof browser === "undefined") {
  var browser = chrome;
}

async function setDefaultSettings(version) {
  console.log('DevCapReminders - configuring default settings');
  await browser.storage.local.set({
    extensionIsEnabled: true,
    alertColor: 'green',
    alertIntensity: '3',
    extensionVersionNumber: version
  });
}

async function updateStoredVersionNumber(version) {
  console.log('DevCapReminders - updating stored extension version number');
  await browser.storage.local.set({
    extensionVersionNumber: version
  });
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
  console.log('DevCapReminders - installing or updating extension');
  const manifest = await browser.runtime.getManifest();
  const version = manifest.version;
  try {
    await injectContentIntoExistingPages(manifest);
  } catch { 
    // Uh oh. Looks like the user will be forced to reload any 
    // existing pages for the  time being.
  }
  switch(details.reason) {
    case 'install':
      console.log('DevCapReminders - installing version', version);
      await setDefaultSettings(version);
      break
    case 'update':
      console.log('DevCapReminders - updating from ', details.previousVersion, 'to', version);
      await updateStoredVersionNumber(version);  // Will need to modify this in the future if an update intorduces any new settings
      break
    case 'browser_update':
    case 'chrome_update':
      console.log('DevCapReminders - browser update detected. Hopefully nothing broke');
      break
  }
});