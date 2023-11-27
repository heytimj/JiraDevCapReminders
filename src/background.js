if (typeof browser === "undefined") {
  var browser = chrome;
}

async function setDefaultSettings() {
  console.log('DevCapReminders - configuring default settings (if none exist)');
  let testValue = await browser.storage.local.get('extensionIsEnabled').extensionIsEnabled;
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

browser.runtime.onInstalled.addListener((details) => {
  console.log('DevCapReminders - installing extension');
  setDefaultSettings();
});