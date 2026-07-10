const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
    const win = new BrowserWindow({
        minWidth: 1200,
        minHeight: 800,
        x: 100,
        y: 100,
        title: 'Quill Markdown Editor',
        icon: 'quill.png',
        frame: false,           // Remove title bar
        menuBarVisible: true,  // Hide menu bar
        fullscreen: true,       // Start fullscreen
        maximizable: true,     // Disable maximize
        resizable: true,       // Disable resizing
        closable: true,
        minimizable: true,
        alwaysOnTop: false,
        show: false,            // Don't show until ready
        backgroundColor: '#1e1e1e'
    });

    win.once('ready-to-show', () => {
        win.show();
    });

    win.loadFile('quill.html');
});
