# Thunderbird Outlook Theme & Unified Customizations

This repository provides a unified UI customization extension (a "theme-add-on") for Mozilla Thunderbird (Supernova 115+) to create a cleaner, flatter interface inspired by modern Outlook / Office 365. 

Unlike standard "Static Themes" which can only change basic colors, this extension completely overhauls the message list "Cards View" DOM and the remote content warning banner. This is packaged as a single, easy-to-install `.xpi` extension.

## Features

- **Outlook-Inspired Cards View:** Removes heavy rounded borders from the message list cards, substituting them with clean, flat lines and a thin white separator.
- **Enhanced Unread Visibility:** Unread messages are styled with bright blue text and a left-aligned vertical blue bar (similar to modern Outlook), removing the default green dot.
- **Dark Warning Banners:** Replaces the native bright yellow "Remote Content Blocked" banner with a dark grey (`#121212`) background and a muted blue preferences button (`#2b4c6e`), blending seamlessly into the dark system theme.
- **Muted Folder Icons:** Desaturates the default bright yellow folder icons in the left pane to match a neutral, professional aesthetic.
- **Quick Card Delete:** Automatically injects Thunderbird's native SVG trash icon onto every message card, placed perfectly adjacent to the Star icon. Because it pulls the icon directly from Thunderbird's core source (`chrome://messenger/skin/icons/delete.svg`), if Thunderbird updates their default trash icon in the future, your card delete buttons will update automatically to match! This enables quick one-click deletions without opening the email.

## Installation Instructions

1. In Thunderbird, navigate to **Settings > Add-ons and Themes**.
2. Click the Gear icon ⚙️ in the top right corner and select **Install Add-on From File...**
3. Select the `thunderbird-outlook-theme.xpi` file provided in this repository.
4. Click **Add** and restart Thunderbird if prompted.

*Note: You no longer need to use `userChrome.css` for these features. Everything is bundled into the single `.xpi` extension.*

## Credits & Disclaimer
* The CSS theme is a custom compilation inspired by modern Outlook 365 design principles.
* **Massive credit** to the open-source developers **abtecgh** and **sim32101** for the original `cards-delete-btn` extension, which provided the foundational JavaScript injection logic to get a button onto the cards view!
* *Disclaimer: This add-on relies on experimental APIs and may require updates if Thunderbird makes major internal structural changes in the future.*
