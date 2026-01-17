const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  generateReport: (options) => ipcRenderer.invoke("generate-report", options),

  generateDetailedStudentReport: (data) =>
    ipcRenderer.invoke("generate-detailed-student-report", data),
});