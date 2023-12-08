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

function getTargetElements() {
  const powerButtonElement = document.getElementById('power-button');
  const colorSelectorElement = document.getElementById('color-selector');
  const intensitySelectorElement = document.getElementById('intensity-selector');
  const targetElements = {
    powerButton: powerButtonElement,
    colorSelector: colorSelectorElement,
    intensitySelector: intensitySelectorElement
  };
  return targetElements;
}

function addChangeListenersToDropdowns() {
  console.log('DevCapReminders - adding change listeners to menu dropdowns');
  let optionDropdowns = document.querySelectorAll('.option-dropdown');
  optionDropdowns.forEach((elem) => {
    elem.addEventListener("change", (e) => {
      console.log('DevCapReminders - change event triggered on:', elem);
      saveNewDropdownSetting(e.target);
    });
  });
}

function addClickListenerToPowerButton() {
  console.log('DevCapReminders - adding click listener to power button');
  const powerButton = getTargetElements().powerButton;
  powerButton.addEventListener("click", handlePowerButtonClick);
}

async function handlePowerButtonClick (clickEvent) {
  console.log('DevCapReminders - power button clicked');
  const powerButton = getTargetElements().powerButton;
  const currentSettings = await browser.storage.local.get(null);  // gets everything in storage
  const extensionIsEnabledPrevious = currentSettings.extensionIsEnabled;
  const extensionIsEnabledNew = ! extensionIsEnabledPrevious;
  let newSettingPayload = {};
  newSettingPayload['extensionIsEnabled'] = extensionIsEnabledNew;
  browser.storage.local.set({
    extensionIsEnabled: extensionIsEnabledNew
  });
  powerButton.setAttribute('data-button-is-on', extensionIsEnabledNew);
  manageExtensionIcon(extensionIsEnabledNew);
  balanceOptionStates();
}

async function restoreSettings() {
  console.log('DevCapReminders - restoring menu settings');
  const currentSettings = await browser.storage.local.get(null);
  console.log('DevCapReminders - current settings:', currentSettings);
  const extensionIsEnabled = currentSettings.extensionIsEnabled;
  const alertColor = currentSettings.alertColor;
  const alertIntensity = currentSettings.alertIntensity;
  const powerButton = getTargetElements().powerButton;
  powerButton.setAttribute('data-button-is-on', extensionIsEnabled);
  const colorSelector = getTargetElements().colorSelector;
  colorSelector.value = alertColor;
  const intensitySelector = getTargetElements().intensitySelector;
  intensitySelector.value = alertIntensity;
  balanceOptionStates();
}

function saveNewDropdownSetting(dropdown) {
  console.log('DevCapReminders - new dropdown value:', dropdown.value);
  newSettingPayload = {};
  newSettingPayload[dropdown.name] = dropdown.value;
  browser.storage.local.set(newSettingPayload);
  balanceOptionStates();
}

function balanceOptionStates() {
  const targetElements = getTargetElements();
  const powerButton = targetElements.powerButton;
  const powerButtonIsOn = powerButton.getAttribute('data-button-is-on');
  const colorSelector = targetElements.colorSelector;
  const intensitySelector = targetElements.intensitySelector;
  if (powerButtonIsOn == 'false') {
    colorSelector.setAttribute('disabled', true);
    intensitySelector.setAttribute('disabled', true);
  } else if (powerButtonIsOn == 'true' && intensitySelector.value == '1') {
    colorSelector.setAttribute('disabled', true);
    intensitySelector.removeAttribute('disabled');
  } else {
    colorSelector.removeAttribute('disabled');
    intensitySelector.removeAttribute('disabled');
  }
}

window.addEventListener("load", () => {
  restoreSettings();
  addClickListenerToPowerButton();
  addChangeListenersToDropdowns();
}, false);