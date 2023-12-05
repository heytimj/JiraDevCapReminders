async function getCurrentSettings() {
  console.log('DevCapReminders - getting current settings');
  const settingNamesToGet = ['extensionIsEnabled', 'alertColor', 'alertIntensity', 'firstRun']
  const currentSettings = await browser.storage.local.get(settingNamesToGet);
  console.log('DevCapReminders - current settings:', currentSettings);
  return {
    extensionIsEnabled: currentSettings.extensionIsEnabled,
    alertColor: currentSettings.alertColor,
    alertIntensity: currentSettings.alertIntensity
  };
}

function getTargetElements() {
  console.log('DevCapReminders - getting target elements');
  const devBucketContainer = document.getElementById('rowForcustomfield_13013');
  const devBucketElement = document.querySelector("label[for='customfield_13013']");
  const devBucketValueElement = document.getElementById('customfield_13013-val');
  const devBucketValue = devBucketValueElement.textContent.trim();
  const workLogElement = document.getElementById('worklog-by-user-table');
  const logWorkLink = document.getElementById('add-worklog-issue-right-panel-link');
  const targetElements = {
    devBucketContainer: devBucketContainer,
    devBucketElement: devBucketElement,
    devBucketValueElement: devBucketValueElement,
    devBucketValue: devBucketValue,
    workLogElement: workLogElement,
    logWorkLink: logWorkLink
  };
  return targetElements;
}

async function changePageDecider() {
  console.log('DevCapReminders - deciding whether or not to change the page');
  const currentSettings = await getCurrentSettings();
  const extensionIsEnabled = currentSettings.extensionIsEnabled;
  const targetElements = getTargetElements();
  const devBucketValue = targetElements.devBucketValue;
  if (extensionIsEnabled && devBucketValue == 'Forward Development') {
    console.log('DevCapReminders - the page needs to be changed');
    changePage(targetElements, currentSettings);
  } else {
    console.log('DevCapReminders - the page does not need to be changed');
    // Extension doesn't appear to be enabled or ticket is 
    // not Forward Development. Stand down.
  }  
}

function changePage(targetElements, currentSettings) {
  console.log('DevCapReminders - changing page');
  const newFontSize = '16px';
  const alertColor = currentSettings.alertColor;
  const alertIntensity = currentSettings.alertIntensity; 
  const newBorderValue = (px, ac) => { return px + ' dashed ' + ac };
  removePageChanges();  // Start fresh because switching from 3/4 to 1/2 requires some changes to be removed.
  // Apply common changes which affect all alert intensities
  console.log('DevCapReminders - applying new page changes');
  targetElements.devBucketElement.style.fontWeight = "bold";
  targetElements.devBucketElement.style.fontSize = newFontSize;
  targetElements.devBucketValueElement.style.fontWeight = "bold";
  targetElements.devBucketValueElement.style.fontSize = newFontSize;
  targetElements.logWorkLink.innerHTML= 'LOG WORK';
  targetElements.logWorkLink.style.fontSize = newFontSize;
  switch(alertIntensity) {
    case '1':
      // As of now, alert intensity 1 is just the common changes above
      break;
    case '2':
      borderWidth = '2px';
      newBorder = newBorderValue(borderWidth, alertColor);
      targetElements.workLogElement.style.border = newBorder;
      break;
    case '3':
      borderWidth = '2px';
      newBorder = newBorderValue(borderWidth, alertColor);
      targetElements.devBucketContainer.style.border = newBorder;
      targetElements.workLogElement.style.border = newBorder;
      break;
    case '4':
      borderWidth = '3px';
      newBorder = newBorderValue(borderWidth, alertColor);
      targetElements.devBucketContainer.style.border = newBorder;
      targetElements.workLogElement.style.border = newBorder;
      break;
  }
  startObservingDomMutations();
}

function removePageChanges() {
  console.log('DevCapReminders - removing page changes');
  const targetElements = getTargetElements();
  targetElements.devBucketElement.style.fontWeight = 'normal';
  targetElements.devBucketValueElement.style.fontWeight = 'normal';
  targetElements.devBucketElement.style.fontSize = '14px';
  targetElements.devBucketValueElement.style.fontSize = '14px';
  targetElements.devBucketContainer.style.border = 'none';
  targetElements.workLogElement.style.border = 'none';
  targetElements.logWorkLink.innerHTML='Log Work';
}

const domMutationObserver = new MutationObserver(domMutationCallback); // https://stackoverflow.com/a/35312379
startObservingDomMutations(domMutationObserver, document);

function domMutationCallback(mutations, observer) {
  console.log('DevCapReminders - DOM mutations detected');
  for (const mutation of mutations) {
    console.log(mutation);
  }
  console.log('DevCapReminders - disconnecting DOM mutation observer');
  domMutationObserver.disconnect();
  changePageDecider();
}

function startObservingDomMutations() {
  console.log('DevCapReminders - observing DOM for mutations');
  domMutationObserver.observe(document, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}

// This fallback isn't needed anymore since MutationObserver code was fixed. Leaving it here for nostalgia.
// document.addEventListener('click', () => {
//   setTimeout(changePageDecider, 1800);  // Won't work without the setTimeout wrapper - https://stackoverflow.com/a/58819372
// });

function settingsListener(changes, area)  {
  console.log('DevCapReminders - changes in settings detected');
  const changedItems = Object.keys(changes);
  console.log('DevCapReminders - changes:', changes);
  console.log('DevCapReminders - changedItems:', changedItems);
  for (const item of changedItems) {
    if (item == 'extensionIsEnabled' && changes[item].newValue == false) {
      removePageChanges();
    } else {
      changePageDecider();
    }
    // console.log(`${item} has changed:`);
    // console.log("Old value: ", changes[item].oldValue);
    // console.log("New value: ", changes[item].newValue);
  }
}

if (typeof browser === "undefined") {
  var browser = chrome;
}
browser.storage.onChanged.addListener(settingsListener);