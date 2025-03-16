const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const extract = require('extract-zip');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.on('start-download', async (event, components) => {
    const downloadPath = path.join(app.getPath('downloads'), 'MyApp');
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    let progress = 0;
    const total = components.length;

    for (const component of components) {
        const url = `https://github.com/user/repo/releases/latest/download/${component}.zip`;
        const destination = path.join(downloadPath, `${component}.zip`);
        
        exec(`curl -L ${url} -o ${destination}`, async (error, stdout, stderr) => {
            if (error) {
                event.reply('download-error', `Erreur lors du téléchargement de ${component}: ${error.message}`);
            } else {
                progress++;
                event.reply('download-progress', { component, progress, total });
                
                // Extraction du fichier ZIP
                try {
                    await extract(destination, { dir: path.join(downloadPath, component) });
                    event.reply('extract-success', `Extraction réussie: ${component}`);
                    fs.unlinkSync(destination); // Supprimer le fichier ZIP après extraction
                } catch (extractError) {
                    event.reply('extract-error', `Erreur lors de l'extraction de ${component}: ${extractError.message}`);
                }
            }
        });
    }
});
