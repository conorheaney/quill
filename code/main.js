const fs = require("fs/promises");
const path = require("path");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");

const MARKDOWN_FILE_FILTERS = [
    {
        name: "Markdown files",
        extensions: ["md", "markdown", "txt"]
    }
];

async function readMarkdownFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    return {
        content,
        fileName: path.basename(filePath),
        filePath
    };
}

ipcMain.handle("quill:open-markdown-file", async (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(browserWindow, {
        filters: MARKDOWN_FILE_FILTERS,
        properties: ["openFile"]
    });

    if (result.canceled || !result.filePaths.length) {
        return null;
    }

    return readMarkdownFile(result.filePaths[0]);
});

ipcMain.handle("quill:reopen-markdown-file", async (_event, filePath) => {
    if (!filePath) {
        throw new Error("A file path is required to reopen a markdown file.");
    }

    return readMarkdownFile(filePath);
});

ipcMain.handle("quill:save-markdown-file", async (event, payload) => {
    const options = payload || {};
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    let targetPath = options.filePath || "";

    if (options.saveAs || !targetPath) {
        const result = await dialog.showSaveDialog(browserWindow, {
            defaultPath: targetPath || options.suggestedName || "document.md",
            filters: MARKDOWN_FILE_FILTERS
        });

        if (result.canceled || !result.filePath) {
            return null;
        }

        targetPath = result.filePath;
    }

    await fs.writeFile(targetPath, options.content || "", "utf8");

    return {
        fileName: path.basename(targetPath),
        filePath: targetPath
    };
});

app.whenReady().then(() => {
    const win = new BrowserWindow({
        minWidth: 1200,
        minHeight: 800,
        x: 100,
        y: 100,
        title: 'Quill Markdown Editor',
        icon: path.join(__dirname, 'quill-icon.png'),
        frame: false,           // Use the custom application shell
        menuBarVisible: true,
        fullscreen: true,       // Start fullscreen
        maximizable: true,
        resizable: true,
        closable: true,
        minimizable: true,
        alwaysOnTop: false,
        show: false,            // Don't show until ready
        backgroundColor: "#1e1e1e",
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.once("ready-to-show", () => {
        win.show();
    });

    win.loadFile(path.join(__dirname, "quill.html"));
});
