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

        var newFile = JSON.parse(data);
        var exist = false;
        // Check if the value exist
        newFile.cities.map((city) => {
            if (city.name === req.body.name) {
                exist = true;
            }
        });

        if (!exist){
            // Add the new value
            newFile.cities.push({
                "id": uuid(),
                "name": req.body.name
            });

            // Update the file
            fs.writeFile('cities.json', JSON.stringify(newFile), (err) => {
                if (err) throw err;
                res.redirect(200, "/cities");
                console.log("File update (POST)");
            });
        } else {
            // Throw error 500
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html");
            res.send("Already exist.");
        }

    });
});

// PUT: city/:id
app.put('/city/:id', (req, res) => {
    // Read file
    fs.readFile('./cities.json', 'utf8', (err, data) => {
        if (err) {
            // Create if not exist
            fs.writeFile('cities.json', '', (err) => {
                if (err) throw err;
                console.log('File is created sucessfully.');
            });
        }

        var newFile = JSON.parse(data);
        var exist = false;

        // Check if the value exist
        newFile.cities.map((city) => {
            // modify value of name
            if (city.id === req.params.id) {
                city.name = req.body.name;
                exist = true;
            }
        });

        if (exist){
            // Update the file
            fs.writeFile('cities.json', JSON.stringify(newFile), (err) => {
                if (err) throw err;
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.send(newFile);
                console.log("File update (PUT).");
            });
        } else {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html");
            res.send("City not found.");
        }
    });
});

// DELETE: city/:id
app.delete('/city/:id', (req, res) => {
    // Read file
    fs.readFile('./cities.json', 'utf8', (err, data) => {
        if (err) {
            // Create if not exist
            fs.writeFile('cities.json', '', (err) => {
                if (err) throw err;
                console.log('File is created sucessfully.');
            });
        }

        var newFile = JSON.parse(data);
        var exist = false;
        var valueToDelete = "";

        // Check if the value exist
        newFile.cities.map((city, index) => {
            // modify value of name
            if (city.id === req.params.id) {
                exist = true;
                valueToDelete = index;
            }
        });

        if (exist){
            // Delete the element
            delete newFile.cities[valueToDelete];
            // Remove null value
            var replace = JSON.stringify(newFile).replace(/null,/,"");
            // Update the file
            fs.writeFile('cities.json', replace, (err) => {
                if (err) throw err;
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.send(replace);
                console.log("File update (DELETE).");
            });
        } else {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html");
            res.send("City not found, you can't delete.");
        }
    });
});

app.listen(port, () => {
    console.log(`Serveur running at port ${port}`);
});