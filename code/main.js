const path = require('path');
const { app, BrowserWindow } = require('electron');

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
        backgroundColor: '#1e1e1e'
    });

    win.once('ready-to-show', () => {
        win.show();
    });

    win.loadFile(path.join(__dirname, 'quill.html'));
});
