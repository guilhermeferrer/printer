const electronInstaller = require("electron-winstaller");

electronInstaller
  .createWindowsInstaller({
    appDirectory: "./Uau! Delivery - Assistente de impressão-win32-arm64",
    outputDirectory: "./installer64",
    authors: "Uau! Delivery - Assistente de impressão",
    exe: "Uau! Delivery - Assistente de impressão.exe",
  })
  .then(() => console.log("It worked!"))
  .catch((e) => console.log(`No dice: ${e.message}`));
