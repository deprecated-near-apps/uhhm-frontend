const fs = require('fs');
const path = './src/config.js'
 
fs.readFile(path, 'utf-8', function(err, data) {
    if (err) throw err;
 
    data = data.replace(/.*const contractName.*/gim, `const contractName = 'uhhmnft.near';`);
 
    fs.writeFile(path, data, 'utf-8', function(err) {
        if (err) throw err;
        console.log('Done!');
    })
})
