# Thunderbird Outlook Theme & Customizations

This repository provides a set of UI customizations for Mozilla Thunderbird (Supernova 115+) to create a cleaner, flatter interface inspired by modern Outlook / Office 365. 

It also includes enhancements for a dark mode environment, specifically replacing the jarring, bright yellow remote content warning banner with a sleek dark grey alternative.

## Features

- **Outlook-Inspired Cards View:** Removes heavy rounded borders from the message list cards, substituting them with clean, flat lines and a thin white separator.
- **Enhanced Unread Visibility:** Unread messages are styled with bright blue text and a left-aligned vertical blue bar (similar to modern Outlook), removing the default green dot.
- **Dark Warning Banners:** Replaces the native bright yellow "Remote Content Blocked" banner with a dark grey (`#121212`) background and a muted blue preferences button (`#2b4c6e`), blending seamlessly into the dark system theme.
- **Muted Folder Icons:** Desaturates the default bright yellow folder icons in the left pane to match a neutral, professional aesthetic.
- **Quick Card Delete (Extension):** Included is the community `cards-delete-btn` extension, which injects a much-needed "Trash" icon directly onto each message card, enabling one-click deletions without opening the email.

## Installation Instructions

### 1. Enable Custom Stylesheets
1. Open Thunderbird.
2. Go to **Settings > General** and scroll to the bottom.
3. Click **Config Editor...**
4. Search for `toolkit.legacyUserProfileCustomizations.stylesheets` and set it to **true**.

### 2. Apply the CSS Theme
1. Go to **Help > Troubleshooting Information**.
2. Under "Application Basics", find **Profile Folder** and click **Open Folder**.
3. Create a folder named exactly `chrome` (if it does not exist).
4. Copy the `userChrome.css` file from this repository into your new `chrome` folder.
5. Restart Thunderbird.

### 3. Install the Quick Delete Button
1. In Thunderbird, navigate to **Settings > Add-ons and Themes**.
2. Click the Gear icon ⚙️ in the top right corner and select **Install Add-on From File...**
3. Select the `cards-delete-btn-v28.xpi` file provided in this repository.
4. Click **Add** and restart Thunderbird if prompted.

## Credits & Disclaimer
* The CSS theme is a custom compilation inspired by modern Outlook 365 design principles.
* The `cards-delete-btn` extension is an open-source community add-on (originally created by abtecgh/sim32101). It relies on experimental APIs and may require updates if Thunderbird makes major internal structural changes.
