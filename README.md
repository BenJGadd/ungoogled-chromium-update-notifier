# Ungoogled Chromium Update Notifier

This extension automatically checks for updates to the Ungoogled Chromium browser and notifies you if a newer version is available. I built this extension because automatic updates are not included with Ungoogled Chromium, and updates are essential for security.

**Note:** This extension only supports Windows 64-bit versions of Ungoogled Chromium. (Modifying for other platforms is simple; however, I don't plan to do so unless I find myself using a different OS.)

## Features

- **Automatic Update Check:** The extension checks the latest Ungoogled Chromium release whenever the browser starts.
- **Manual Update Check:** You can manually trigger an update check by clicking on the extension icon.
- **Outdated Notification:** Notifies you if your browser is outdated and provides a direct link to download the latest version.
- **Up-to-Date Notification:** Notifies you if no update is needed.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top-right corner.
4. Click on "Load unpacked" and select the folder containing this extension's files.

## Usage

- The extension will automatically check for updates upon browser startup.
- To manually check for updates, click on the extension icon.

## Permissions

- **activeTab:** Required to interact with the currently active tab when displaying notifications.
- **scripting:** Required to inject scripts into the current tab to show alerts.
- **host_permissions:** The extension requires access to `https://ungoogled-software.github.io/*` to fetch the latest release information.
