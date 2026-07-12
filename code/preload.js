const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("QuillDesktop", {
  openMarkdownFile() {
    return ipcRenderer.invoke("quill:open-markdown-file");
  },
  reopenMarkdownFile(filePath) {
    return ipcRenderer.invoke("quill:reopen-markdown-file", filePath);
  },
  saveMarkdownFile(payload) {
    return ipcRenderer.invoke("quill:save-markdown-file", payload);
  }
});
