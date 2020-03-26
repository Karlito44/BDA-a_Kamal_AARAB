// New server with express
const express = require('express');
const app = express();
const { uuid } = require('uuidv4');
var path = require('path');
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');

const pug = require("pug"); //import du module pug
const compiledFunction = pug.compileFile("./views/template.pug"); //compilation du template pug

const fs = require('fs');

var fileName = process.argv[2];
var datas;

// Catch : error paramaters
if (!fileName) {
    console.error('Missing argument! Example: node script.js data');
    process.exit(1);
}

// Extract data from file
fs.readFile('./' + fileName + '.csv', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    datas = data.split(';');
});

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.send("HELLO WORLD! USE API !");// on renvoie le template pug
});

// GET: users
app.get('/users', (req, res) => {
    const generatedTemplate = compiledFunction({
        fileName: fileName,
        data: datas,
    }); // génération du template avec une variable pour "name"

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(generatedTemplate);// on renvoie le template pug
});

// GET: cities
app.get('/cities', (req, res) => {
    fs.readFile('./cities.json', 'utf8', (err, data) => {
        if (err) {
            next(err);
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.send(data);
        }
    });
});

// POST: city
app.post('/city', (req, res) => {
    // Read the file
    fs.readFile('./cities.json', 'utf8', (err, data) => {
        if (err) {
            // Create if not exist
            fs.writeFile('cities.json', '', (err) => {
                if (err) throw err;
                console.log('File is created sucessfully.');
            });
        }
        // Add the city
        if (data.indexOf(req.body.name) === -1) {
            var newFile = JSON.parse(data);
            // Add the new value
            newFile.cities.push({
                "id": uuid(),
                "name": req.body.name
            });
            // Update the json file with the new value
            fs.writeFile('cities.json', JSON.stringify(newFile), (err) => {
                if (err) throw err;
                res.redirect("/cities");
                console.log('File is updated sucessfully.');
            });
        } else {
            // Throw error 500
            throw new Error("Already exist.")
        }
        
    });
});

app.listen(port, () => {
    console.log(`Serveur running at port ${port}`);
});

// Old server

// const http = require("http");
// const pug = require("pug"); //import du module pug

// const compiledFunction = pug.compileFile("template.pug"); //compilation du template pug
// const port = 3000;

// const fs = require('fs');

// var fileName = process.argv[2];
// var datas;

// if (!fileName) {
//     console.error('Missing argument! Example: node script.js data');
//     process.exit(1);
// }

// fs.readFile('./' + fileName + '.csv', 'utf8', (err, data) => {
//     if (err){
//         console.error(err);
//         return;
//     }
//     datas = data.split(';');

// })

// const server = http.createServer((req, res) => {
//     const generatedTemplate = compiledFunction({
//         fileName: fileName,
//         data: datas,
//     }); // génération du template avec une variable pour "name"

//     res.statusCode = 200;
//     res.setHeader("Content-Type","text/html");
//     res.end(generatedTemplate);// on renvoie le template pug
// });

// server.listen(port , () => {
//     console.log(`Serveur running at port ${port}`);
// });
