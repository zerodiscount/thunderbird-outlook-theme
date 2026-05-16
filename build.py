import os
import zipfile

with open("userChrome.css", "r") as f:
    css_content = f.read()

# Escape backticks and dollar signs if any
css_content = css_content.replace('`', '\\`').replace('$', '\\$')

parent_js_content = f"""\
"use strict";

var {{ ExtensionCommon }} = ChromeUtils.importESModule("resource://gre/modules/ExtensionCommon.sys.mjs");
var {{ IOUtils }} = ChromeUtils.importESModule("resource://gre/modules/IOUtils.sys.mjs");
var {{ PathUtils }} = ChromeUtils.importESModule("resource://gre/modules/PathUtils.sys.mjs");

this.cardsDelete = class extends ExtensionCommon.ExtensionAPI {{
  getAPI(context) {{

    const USER_CHROME_CSS = `{css_content}`;

    const CARDS_CSS = `
      .cards-delete-btn {{
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
      }}
      .cards-delete-btn svg {{
        width: 100%;
        height: 100%;
        fill: currentColor;
      }}
      .cards-delete-btn:hover {{
        opacity: 1;
        color: #cc3333;
      }}
    `;

    async function installUserChrome() {{
        try {{
            const chromeDir = PathUtils.join(PathUtils.profileDir, "chrome");
            await IOUtils.makeDirectory(chromeDir, {{ ignoreExisting: true }});
            const cssPath = PathUtils.join(chromeDir, "userChrome.css");
            const encoder = new TextEncoder();
            await IOUtils.write(cssPath, encoder.encode(USER_CHROME_CSS));
            Services.prefs.setBoolPref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
            console.log("Outlook-Addon: Successfully installed userChrome.css to " + cssPath);
        }} catch (e) {{
            console.error("Outlook-Addon: Failed to install userChrome.css:", e);
        }}
    }}

    function deleteMessage(row, innerWin) {{
      const rowIndex = typeof row.index === "number" ? row.index : -1;
      if (rowIndex < 0) return;
      const view = innerWin.gDBView;
      if (!view) return;
      const msgHdr = view.getMsgHdrAt(rowIndex);
      if (!msgHdr) return;
      const topWin = innerWin.browsingContext?.top?.window ?? innerWin;
      const msgWindow = topWin.msgWindow ?? null;
      msgHdr.folder.deleteMessages([msgHdr], msgWindow, false, false, null, true);
    }}

    function attachButton(row, innerWin) {{
      if (row._cardsDeleteAttached) return;
      row._cardsDeleteAttached = true;
      const container = row.querySelector(".card-container") ?? row;
      if (innerWin.getComputedStyle(container).position === "static") {{
        container.style.position = "relative";
      }}
      const btn = innerWin.document.createElement("button");
      btn.className = "cards-delete-btn";
      btn.title = "Delete message";
      btn.setAttribute("aria-label", "Delete message");
      
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M11 2H5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1zM2 3h12v1H2V3zm1 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm3 2v5h1V7H6zm3 0v5h1V7H9z"/></svg>`;

      btn.addEventListener("click", (event) => {{
        event.stopPropagation();
        event.preventDefault();
        deleteMessage(row, innerWin);
      }}, true);
      container.appendChild(btn);
    }}

    function processCards(innerWin) {{
      innerWin.document
        .querySelectorAll("[is='thread-card']:not([data-cdb-done])")
        .forEach(row => {{
          row.setAttribute("data-cdb-done", "1");
          attachButton(row, innerWin);
        }});
    }}

    function injectInto3Pane(innerWin) {{
      if (!innerWin || innerWin._cardsDeleteInjected) return;
      innerWin._cardsDeleteInjected = true;
      const doc = innerWin.document;
      if (!doc.getElementById("cards-delete-btn-css")) {{
        const style = doc.createElement("style");
        style.id = "cards-delete-btn-css";
        style.textContent = CARDS_CSS;
        (doc.head ?? doc.documentElement).appendChild(style);
      }}
      processCards(innerWin);
      new innerWin.MutationObserver(() => processCards(innerWin))
        .observe(doc.documentElement, {{ childList: true, subtree: true }});
      let ticks = 0;
      const timer = innerWin.setInterval(() => {{
        processCards(innerWin);
        if (++ticks >= 100) innerWin.clearInterval(timer);
      }}, 600);
    }}

    function watchMailWindow(outerWin) {{
      if (!outerWin || outerWin._cardsDeleteWatching) return;
      outerWin._cardsDeleteWatching = true;
      const doc = outerWin.document;

      function tryInject() {{
        doc.querySelectorAll("browser, iframe").forEach(frame => {{
          try {{
            const cw = frame.contentWindow;
            if (cw?.location?.href?.startsWith("about:3pane")) {{
              injectInto3Pane(cw);
            }}
          }} catch (_) {{}}
        }});
      }}

      tryInject();
      new outerWin.MutationObserver(tryInject)
        .observe(doc.documentElement, {{ childList: true, subtree: true }});
      doc.getElementById("tabmail")
        ?.addEventListener("select", () => outerWin.setTimeout(tryInject, 300));
      let ticks = 0;
      const timer = outerWin.setInterval(() => {{
        tryInject();
        if (++ticks >= 30) outerWin.clearInterval(timer);
      }}, 500);
    }}

    return {{
      cardsDelete: {{
        async inject() {{
          const {{ ExtensionSupport }} = ChromeUtils.importESModule(
            "resource:///modules/ExtensionSupport.sys.mjs"
          );
          
          // Auto-install userChrome.css
          await installUserChrome();

          const openWindows = Services.wm.getEnumerator("mail:3pane");
          while (openWindows.hasMoreElements()) {{
            watchMailWindow(openWindows.getNext());
          }}
          ExtensionSupport.registerWindowListener("cardsDeleteBtn", {{
            onLoadWindow(win) {{
              if (win.document?.documentElement?.getAttribute("windowtype") === "mail:3pane") {{
                watchMailWindow(win);
              }}
            }},
          }});
          context.callOnClose({{
            close() {{
              ExtensionSupport.unregisterWindowListener("cardsDeleteBtn");
            }},
          }});
        }},
      }},
    }};
  }}
}};
"""

with open("src/api/parent.js", "w") as f:
    f.write(parent_js_content)

# Rebuild the ZIP into Outlook-Addon.xpi
with zipfile.ZipFile("Outlook-Addon.xpi", "w") as zipf:
    for root, dirs, files in os.walk("src"):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, "src")
            zipf.write(file_path, arcname)

print("Outlook-Addon.xpi built successfully.")
