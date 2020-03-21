const http = require("http");
const pug = require("pug"); //import du module pug

const compiledFunction = pug.compileFile("template.pug"); //compilation du template pug
const port = 3000;

const fs = require('fs');

var fileName = process.argv[2];
var datas;

if (!fileName) {
    console.error('Missing argument! Example: node script.js data');
    process.exit(1);
}

fs.readFile('./' + fileName + '.csv', 'utf8', (err, data) => {
    if (err){
        console.error(err);
        return;
    }
    datas = data.split(';');

})

const server = http.createServer((req, res) => {
    const generatedTemplate = compiledFunction({
        fileName: fileName,
        data: datas,
    }); // génération du template avec une variable pour "name"

    res.statusCode = 200;
    res.setHeader("Content-Type","text/html");
    res.end(generatedTemplate);// on renvoie le template pug
});

server.listen(port , () => {
    console.log(`Serveur running at port ${port}`);
});
