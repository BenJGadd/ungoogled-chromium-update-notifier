/**
 * Fetches the latest release XML feed for Ungoogled Chromium.
 * @returns {Promise<string>} The XML feed as a string.
 */
async function fetchLatestReleaseFeed() {
  const response = await fetch('https://ungoogled-software.github.io/ungoogled-chromium-binaries/feed.xml');
  return await response.text();
}

/**
 * Retrieves the current Chromium version from the browser's user agent data.
 * @returns {Promise<string>} The full version string of Chromium.
 */
async function getChromeVersion() {
  const { uaFullVersion } = await navigator.userAgentData.getHighEntropyValues(['uaFullVersion']);
  return uaFullVersion;
}

/**
 * Parses the XML feed to find the latest Windows 64-bit release and extracts the version number.
 * @param {string} releaseFeed - The XML feed as a string.
 * @returns {{cleanVersion: string, downloadLink: string}} The cleaned version number and the download link.
 */
function getLatestWin64Release(releaseFeed) {
  const entry = releaseFeed.split('<entry').slice(1).find(entry => entry.includes('/windows/64bit/'));
  const title = entry.match(/<title[^>]*>([^<]*)<\/title>/)[1].trim();
  const downloadLink = entry.match(/href="([^"]*)"/)[1];
  const versionMatch = title.match(/\d+\.\d+\.\d+\.\d+/);
  const cleanVersion = versionMatch ? versionMatch[0] : title;
  
  return { cleanVersion, downloadLink };
}

/**
 * Creates a new tab with the specified URL and invokes the callback with the tab ID.
 * @param {string} url - The URL to open in the new tab.
 * @param {function} callback - The callback function to invoke with the tab ID.
 */
function createTab(url, callback) {
  chrome.tabs.create({ url }, ({ id: tabId }) => callback(tabId));
}

/**
 * Injects a script into the specified tab to display an alert with the given message.
 * @param {string} message - The message to display in the alert.
 * @param {number} tabId - The ID of the tab in which to inject the script.
 */
function notifyBrowserStatus(message, tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (msg) => {
      alert(msg);
    },
    args: [message]
  }).catch(err => console.warn("Script injection failed, likely due to an inaccessible page like chrome:// URLs:", err));
}

/**
 * Notifies the user that the browser is outdated by opening a download page and displaying an alert.
 * @param {string} currentVersion - The current version of Chromium.
 * @param {string} cleanVersion - The latest version available.
 * @param {string} downloadLink - The download link for the latest version.
 */
function notifyOutdatedBrowser(currentVersion, cleanVersion, downloadLink) {
  const message = `Current Ungoogled Chromium Version: ${currentVersion}\nLatest Windows 64-bit x86 release: ${cleanVersion}\n\nBrowser outdated. Please download the latest version.`;
  createTab(downloadLink, (tabId) => notifyBrowserStatus(message, tabId));
}

/**
 * Notifies the user that the browser is up to date by displaying an alert in the current tab.
 * @param {string} currentVersion - The current version of Chromium.
 */
function notifyUpToDateBrowser(currentVersion) {
  const message = `Current Ungoogled Chromium Version: ${currentVersion}\n\nYour browser is up to date.`;
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => notifyBrowserStatus(message, currentTab.id));
}

/**
 * Checks for updates by comparing the current Chromium version with the latest available version.
 * Notifies the user if an update is needed or if the browser is up to date.
 * @returns {Promise<boolean>} Returns false if an update is needed, otherwise true.
 */
async function checkForUpdates() {
  const [releaseFeed, currentVersion] = await Promise.all([
    fetchLatestReleaseFeed(),
    getChromeVersion()
  ]);

  const { cleanVersion, downloadLink } = getLatestWin64Release(releaseFeed);

  if (currentVersion !== cleanVersion) {
    notifyOutdatedBrowser(currentVersion, cleanVersion, downloadLink);
    return false; // Return false to indicate that an update is needed
  }

  return true; // Return true to indicate that the browser is up to date
}

// Event listener for browser startup
chrome.runtime.onStartup.addListener(() => {
  checkForUpdates();
});

// Event listener for extension icon click
chrome.action.onClicked.addListener(async () => {
  const currentVersion = await getChromeVersion(); // Get version only once
  const isUpToDate = await checkForUpdates();
  if (isUpToDate) {
    notifyUpToDateBrowser(currentVersion);
  }
});