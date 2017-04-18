const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Config = require('electron-config')
const config = new Config()

const path = require('path')
const url = require('url')
process.env.GOOGLE_API_KEY = 'AIzaSyCqSSjwgqpY4EMwtLgvlFF4tf0KH5yMx2M'
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

var w = 900;
var h = 600;

function createWindow () {

  if (config.has('position-x') && config.has('position-y')) {
    x = config.get('position-x')
    y = config.get('position-y')
  }
  else {
    let displaySize = electron.screen.getPrimaryDisplay().size
    x = (displaySize.width - w) / 2
    y = (displaySize.height - h) / 2
  }
  let winMode

  if (config.has('winMode')) {
    winMode = config.get('winMode')
    if (winMode == "Skinny") {
      w = 400
    }
  }
  else {
    w = 900
  }

  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    width: w,
    minWidth: 400,
    height: h,
    minHeight: 600,
    frame: false,
    show: false,
    resizable: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('close', function () {
    let [x, y] = mainWindow.getPosition();
    config.set('position-x', x);
    config.set('position-y', y);

    [x,y] = mainWindow.getSize();
    if (x == 400)
      config.set('winMode', "Skinny")
    else
      config.set('winMode', "Wide")

  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
