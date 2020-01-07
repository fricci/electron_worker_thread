const electron = require('electron');
const path = require('path');
const { Worker, isMainThread } = require('worker_threads'); 

const MIN_WIDTH = /*850*/450;
const MIN_HEIGHT = /*600*/65;

const serve = process.argv.slice(1).some(val => val === '--serve');
const debug = process.argv.slice(1).some(val => val === '--debug');



function createWindow() {
    const size = electron.screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new electron.BrowserWindow({
        frame: false,
        show: false,
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            nodeIntegrationInWorker: true
        }
    });

    win.once('ready-to-show', () => {
        const width = Math.max(MIN_WIDTH, Math.min(950, size.width));
        const height = Math.max(MIN_HEIGHT, Math.min(650, size.height));

        win.setBounds({
            x: Math.round((size.width - width) / 2), y: Math.floor((size.height - height) / 2),
            width: width, height: height
        });

        win.maximize();
        win.show();
    });

    win.loadFile('index.html');

    if (debug) {
        win.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    console.log('starting worker with javascript: ', path.resolve(__dirname, 'webworker.js'));
    const process = new Worker(path.resolve(__dirname, 'webworker.js'));
}


try {

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron.app.on('ready', createWindow);

    // Quit when all windows are closed.
    electron.app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron.app.quit();
        }
    });

    electron.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
} catch (e) {
    // Catch Error
    throw e;
}
