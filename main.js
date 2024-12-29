const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const AutoLaunch = require("auto-launch");

let tray = null;

let autoLaunch = new AutoLaunch({
  name: "Uau! Delivery - Assistente de impressão",
  path: app.getPath("exe"),
});

app.exp;

autoLaunch.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLaunch.enable();
});

function createWindow() {
  const iconPath = path.join(__dirname, "tray.png");

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Finalizar",
      click: () => {
        tray.destroy();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Uau! Delivery - Assistente de impressão");
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  setupApi();
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

const setupApi = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  const port = 3077;

  app.get("/status", (req, res) => {
    res.status(200).send(true);
  });

  app.get("/printers", async (req, res) => {
    const printerWindow = new BrowserWindow({
      width: 0,
      height: 0,
      minimizable: false,
      show: false,
    });

    const printers = await printerWindow.webContents.getPrintersAsync();

    res.status(200).send(printers);
  });

  app.post("/print", async (req, res) => {
    const printWindow = new BrowserWindow({
      width: 0,
      height: 0,
      minimizable: false,
      show: false,
    });

    const { deviceName, template } = req.body;

    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(template)}`
    );

    const height = await printWindow.webContents.executeJavaScript(
      `document.documentElement.scrollHeight || document.body.scrollHeight`
    );

    const micron = 242;

    printWindow.webContents.print(
      {
        deviceName,
        silent: false,
        pageSize: { width: 400 * micron, height: height * micron },
        margins: {
          marginType: "none",
        },
      },
      (success, errorType) => {
        if (success) {
          res.status(200).send("Print job successful");
        } else {
          res.status(200).send("Print job failed:", errorType);
        }
      }
    );
  });

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
};
