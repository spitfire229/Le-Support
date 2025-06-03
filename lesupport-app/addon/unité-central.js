const path = require('path');
const fs = require('fs');

function getAddonModules() {
  const addonDir = path.join(__dirname);
  return fs.readdirSync(addonDir)
    .filter(file => file.endsWith('.js') && file !== 'unité-centrale.js')
    .map(file => `./${file}`);
}

module.exports = {
  getAddonModules
};
