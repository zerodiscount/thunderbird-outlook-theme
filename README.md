# Thunderbird Outlook Theme & Customizations

This repository provides an Outlook/Office 365 inspired UI customization setup for Mozilla Thunderbird (Supernova 115+). 

It utilizes a powerful, single-click Add-on (`Outlook-Addon.xpi`) that automatically generates an Outlook CSS theme and injects functional buttons into your message list.

## Features

- **Outlook-Inspired Cards View:** Removes heavy rounded borders from the message list cards, substituting them with clean, flat lines and a thin white separator.
- **Enhanced Unread Visibility:** Unread messages are styled with bright blue text and a left-aligned vertical blue bar (similar to modern Outlook), removing the default green dot.
- **Dark Warning Banners:** Replaces the native bright yellow "Remote Content Blocked" banner with a dark grey (`#121212`) background and a muted blue preferences button (`#2b4c6e`), blending seamlessly into the dark system theme.
- **Quick Card Delete:** Automatically injects Thunderbird's native SVG trash icon onto every message card, placed perfectly adjacent to the Star icon. This enables quick one-click deletions without opening the email.

## ⚡ 1-Click Installation Instructions

1. In Thunderbird, navigate to **Settings > Add-ons and Themes**.
2. Click the Gear icon ⚙️ in the top right corner and select **Install Add-on From File...**
3. Select the `Outlook-Addon.xpi` file provided in this repository.
4. Click **Add** and restart Thunderbird to apply all changes.

*Note: You do **not** need to manually copy any CSS files. The extension will automatically generate the `userChrome.css` theme and apply the required internal configurations for you!*

## Credits & Disclaimer
* The CSS theme is a custom compilation inspired by modern Outlook 365 design principles.
* **Massive credit** to the open-source developers **abtecgh** and **sim32101** for the original `cards-delete-btn` extension, which provided the foundational JavaScript injection logic to get a button onto the cards view!
* *Disclaimer: This add-on relies on experimental APIs and may require updates if Thunderbird makes major internal structural changes in the future.*
