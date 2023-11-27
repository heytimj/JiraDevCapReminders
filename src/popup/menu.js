function manageExtensionIcon(isActive) {
  let iconPath = '';
  if (isActive == true) {
    iconPath = '../icons/icon_active.png';
    console.log('DevCapReminders - activating extension icon');
  } else if (isActive == false) {
    iconPath = '../icons/icon_inactive.png';
    console.log('DevCapReminders - deactivating extension icon');
  } else {
    // uh oh
  }
  if (typeof browser.browserAction === "undefined") {
    browser.action.setIcon({ path: iconPath });  // Chrome, Edge
  } else {
    browser.browserAction.setIcon({ path: iconPath });  // Firefox
  }
}

function addChangeListenersToDropdowns() {
  let optionDropdowns = document.querySelectorAll('.option-dropdown');
  optionDropdowns.forEach((elem) => {
    elem.addEventListener("change", (e) => {
      console.log('DevCapReminders - change event triggered on:', elem);
      saveNewDropdownSetting(e.target);
    });
  });
}

function addClickListenerToPowerButton() {
  let powerButton = document.getElementById('power-button');
  powerButton.addEventListener("click", handlePowerButtonClick);
}

async function handlePowerButtonClick (clickEvent) {
  console.log('DevCapReminders - power button clicked');
  let powerButton = document.getElementById('power-button');  // need to figure out how to pass this in from addClickListenerToPowerButton
  let gettingItem = await browser.storage.local.get('extensionIsEnabled');
  let extensionIsEnabledPrevious = gettingItem.extensionIsEnabled;
  let extensionIsEnabledNew = ! extensionIsEnabledPrevious;
  let newSettingPayload = {};
  newSettingPayload['extensionIsEnabled'] = extensionIsEnabledNew;
  browser.storage.local.set({
    extensionIsEnabled: extensionIsEnabledNew
  });
  powerButton.setAttribute('data-button-is-on', extensionIsEnabledNew);
  manageExtensionIcon(extensionIsEnabledNew);
}

async function restoreSettings() {
  let currentSettings = await browser.storage.local.get(['extensionIsEnabled', 'alertColor', 'alertIntensity']);
  const alertColor = currentSettings.alertColor;
  const alertIntensity = currentSettings.alertIntensity;
  document.getElementById('color-selector').value = alertColor;
  document.getElementById('intensity-selector').value = alertIntensity;
}

function saveNewDropdownSetting(dropdown) {
  console.log('DevCapReminders - new dropdown value:', dropdown.value);
  newSettingPayload = {};
  newSettingPayload[dropdown.name] = dropdown.value;
  browser.storage.local.set(newSettingPayload);
  if (dropdown.id == 'intensity-selector' && dropdown.value == '1') {
    document.getElementById('color-selector').setAttribute('disabled', true);
  } else {
    document.getElementById('color-selector').removeAttribute('disabled');
  }
}

window.addEventListener("load", () => {
  restoreSettings();
  addClickListenerToPowerButton();
  addChangeListenersToDropdowns();
}, false);