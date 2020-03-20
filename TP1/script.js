const fs = require('fs');

var fileName = process.argv[2];

if (!fileName) {
    console.error('Missing argument! Example: node script.js data');
    process.exit(1);
}

fs.readFile('./' + fileName + '.csv', 'utf8', (err, data) => {
    if (err){
        console.error(err);
        return;
    }
    console.log(data);
})