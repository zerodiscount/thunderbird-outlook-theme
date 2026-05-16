"use strict";

var { ExtensionCommon } = ChromeUtils.importESModule("resource://gre/modules/ExtensionCommon.sys.mjs");

this.cardsDelete = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {

    const USER_CHROME_CSS = `/* Thunderbird userChrome.css for Dark Warning Banner */

/* Target the warning notification banner */
notification-message[type="warning"] {
    --message-bar-background-color: #121212 !important;
    /* Deep dark gray / nearly black */
    --message-bar-text-color: #E0E0E0 !important;
    /* Soft light gray text */
    border-bottom: 1px solid #2A2A2B !important;
}

/* Target the Preferences button specifically */
notification-message[type="warning"] button {
    background-color: #2b4c6e !important;
    /* Muted blue */
    color: #E0E0E0 !important;
    border: 1px solid #1f3954 !important;
    border-radius: 4px !important;
}

/* Hover state for the button */
notification-message[type="warning"] button:hover {
    background-color: #355d87 !important;
    /* Slightly lighter muted blue on hover */
}

/* Tone down the warning icon to a muted gold so it matches the dark theme */
notification-message[type="warning"] .notification-message-icon {
    fill: #D4A32A !important;
}

/* ----------------------------------------------------------------- */
/* OUTLOOK CARDS VIEW (MIDDLE COLUMN) & FOLDER PANE CSS              */
/* ----------------------------------------------------------------- */

/* Thin white line separators between messages and flat cards */
#threadTree[rows="thread-card"] .card-layout .card-container {
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important; /* Outlook-style thin white separator */
    box-shadow: none !important;
    background-color: transparent !important;
    border-radius: 0px !important; /* Flat cards like Outlook */
    padding-top: 0px !important; /* Reduced card height */
    padding-bottom: 0px !important; /* Reduced card height */
}

/* Adjust star icon position to align with the trash can in the reduced height card */
#threadTree[rows="thread-card"] .card-layout .star-icon,
#threadTree[rows="thread-card"] .card-layout .flag-icon {
    position: absolute !important;
    bottom: 6px !important;
    right: 12px !important;
}

/* Unread text in Blue */
#threadTree[rows="thread-card"] .card-layout[data-properties~="unread"] .subject {
    font-weight: 600 !important; 
    color: #5ab0ff !important; /* Bright light blue for unread subjects */
}
#threadTree[rows="thread-card"] .card-layout[data-properties~="unread"] .sender {
    font-weight: 600 !important;
    color: #ffffff !important; 
}
#threadTree[rows="thread-card"] .card-layout[data-properties~="unread"] .preview-text {
    font-weight: normal !important;
    color: #a0a0a0 !important; 
}

/* Outlook vertical blue unread indicator */
#threadTree[rows="thread-card"] .card-layout[data-properties~="unread"] .read-status {
    display: none !important;
}
#threadTree[rows="thread-card"] .card-layout[data-properties~="unread"] .card-container {
    border-left: 3px solid #5ab0ff !important; /* Match the bright blue text */
}

/* Subtle background for selected items */
#threadTree[rows="thread-card"] .card-layout.selected.current .card-container {
    background-color: rgba(90, 176, 255, 0.15) !important;
    border-left: 3px solid #5ab0ff !important;
}

/* ----------------------------------------------------------------- */
/* OUTLOOK FOLDER PANE (LEFT COLUMN) CSS                             */
/* ----------------------------------------------------------------- */

/* Desaturate default yellow folder icons to match Outlook's neutral style */
#folderTree li .icon {
    filter: grayscale(100%) opacity(70%) !important;
}
`;

    const CARDS_CSS = `
      .cards-delete-btn {
        position: absolute;
        right: 32px;
        bottom: 6px;
        width: 16px;
        height: 16px;
        display: inline-flex;
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: #888;
        opacity: 0.6;
        z-index: 100;
        padding: 0;
        align-items: center;
        justify-content: center;
      }
      .cards-delete-btn svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
      .cards-delete-btn:hover {
        opacity: 1;
        color: #cc3333;
      }
    `;

    const IMPORT_STATEMENT = '@import url("o365Chrome.css");\n';

    async function installUserChrome() {
        try {
            const chromeDir = PathUtils.join(PathUtils.profileDir, "chrome");
            await IOUtils.makeDirectory(chromeDir, { ignoreExisting: true });
            
            // Write standalone theme file
            const o365Path = PathUtils.join(chromeDir, "o365Chrome.css");
            const encoder = new TextEncoder();
            await IOUtils.write(o365Path, encoder.encode(USER_CHROME_CSS));
            
            // Smart inject into userChrome.css
            const userChromePath = PathUtils.join(chromeDir, "userChrome.css");
            let userCss = "";
            if (await IOUtils.exists(userChromePath)) {
                userCss = await IOUtils.readUTF8(userChromePath);
            }
            
            if (!userCss.includes('url("o365Chrome.css")')) {
                userCss = IMPORT_STATEMENT + userCss;
                await IOUtils.write(userChromePath, encoder.encode(userCss));
            }
            
            Services.prefs.setBoolPref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
            console.log("O365-Addon: Successfully installed CSS.");
        } catch (e) {
            console.error("O365-Addon: Failed to install CSS:", e);
        }
    }

    async function uninstallUserChrome() {
        try {
            const chromeDir = PathUtils.join(PathUtils.profileDir, "chrome");
            
            // Delete standalone theme file
            const o365Path = PathUtils.join(chromeDir, "o365Chrome.css");
            if (await IOUtils.exists(o365Path)) {
                await IOUtils.remove(o365Path);
            }
            
            // Remove from userChrome.css
            const userChromePath = PathUtils.join(chromeDir, "userChrome.css");
            if (await IOUtils.exists(userChromePath)) {
                let userCss = await IOUtils.readUTF8(userChromePath);
                if (userCss.includes('url("o365Chrome.css")')) {
                    userCss = userCss.replace(IMPORT_STATEMENT, '');
                    const encoder = new TextEncoder();
                    await IOUtils.write(userChromePath, encoder.encode(userCss));
                }
            }
            console.log("O365-Addon: Successfully uninstalled CSS.");
        } catch (e) {
            console.error("O365-Addon: Failed to uninstall CSS:", e);
        }
    }

    function deleteMessage(row, innerWin) {
      const rowIndex = typeof row.index === "number" ? row.index : -1;
      if (rowIndex < 0) return;
      const view = innerWin.gDBView;
      if (!view) return;
      const msgHdr = view.getMsgHdrAt(rowIndex);
      if (!msgHdr) return;
      const topWin = innerWin.browsingContext?.top?.window ?? innerWin;
      const msgWindow = topWin.msgWindow ?? null;
      msgHdr.folder.deleteMessages([msgHdr], msgWindow, false, false, null, true);
    }

    function attachButton(row, innerWin) {
      if (row._cardsDeleteAttached) return;
      row._cardsDeleteAttached = true;
      const container = row.querySelector(".card-container") ?? row;
      if (innerWin.getComputedStyle(container).position === "static") {
        container.style.position = "relative";
      }
      const btn = innerWin.document.createElement("button");
      btn.className = "cards-delete-btn";
      btn.title = "Delete message";
      btn.setAttribute("aria-label", "Delete message");
      
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M11 2H5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1zM2 3h12v1H2V3zm1 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm3 2v5h1V7H6zm3 0v5h1V7H9z"/></svg>`;

      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        deleteMessage(row, innerWin);
      }, true);
      container.appendChild(btn);
    }

    function processCards(innerWin) {
      innerWin.document
        .querySelectorAll("[is='thread-card']:not([data-cdb-done])")
        .forEach(row => {
          row.setAttribute("data-cdb-done", "1");
          attachButton(row, innerWin);
        });
    }

    function injectInto3Pane(innerWin) {
      if (!innerWin || innerWin._cardsDeleteInjected) return;
      innerWin._cardsDeleteInjected = true;
      const doc = innerWin.document;
      if (!doc.getElementById("cards-delete-btn-css")) {
        const style = doc.createElement("style");
        style.id = "cards-delete-btn-css";
        style.textContent = CARDS_CSS;
        (doc.head ?? doc.documentElement).appendChild(style);
      }
      processCards(innerWin);
      new innerWin.MutationObserver(() => processCards(innerWin))
        .observe(doc.documentElement, { childList: true, subtree: true });
      let ticks = 0;
      const timer = innerWin.setInterval(() => {
        processCards(innerWin);
        if (++ticks >= 100) innerWin.clearInterval(timer);
      }, 600);
    }

    function watchMailWindow(outerWin) {
      if (!outerWin || outerWin._cardsDeleteWatching) return;
      outerWin._cardsDeleteWatching = true;
      const doc = outerWin.document;

      function tryInject() {
        doc.querySelectorAll("browser, iframe").forEach(frame => {
          try {
            const cw = frame.contentWindow;
            if (cw?.location?.href?.startsWith("about:3pane")) {
              injectInto3Pane(cw);
            }
          } catch (_) {}
        });
      }

      tryInject();
      new outerWin.MutationObserver(tryInject)
        .observe(doc.documentElement, { childList: true, subtree: true });
      doc.getElementById("tabmail")
        ?.addEventListener("select", () => outerWin.setTimeout(tryInject, 300));
      let ticks = 0;
      const timer = outerWin.setInterval(() => {
        tryInject();
        if (++ticks >= 30) outerWin.clearInterval(timer);
      }, 500);
    }

    return {
      cardsDelete: {
        async inject() {
          const { ExtensionSupport } = ChromeUtils.importESModule(
            "resource:///modules/ExtensionSupport.sys.mjs"
          );
          
          await installUserChrome();

          const openWindows = Services.wm.getEnumerator("mail:3pane");
          while (openWindows.hasMoreElements()) {
            watchMailWindow(openWindows.getNext());
          }
          ExtensionSupport.registerWindowListener("cardsDeleteBtn", {
            onLoadWindow(win) {
              if (win.document?.documentElement?.getAttribute("windowtype") === "mail:3pane") {
                watchMailWindow(win);
              }
            },
          });
          context.callOnClose({
            close() {
              ExtensionSupport.unregisterWindowListener("cardsDeleteBtn");
              uninstallUserChrome();
            },
          });
        },
      },
    };
  }
};
