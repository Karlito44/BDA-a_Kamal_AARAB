// New server with express
const express = require('express');
const app = express();
const { uuid } = require('uuidv4');
var path = require('path');
const fs = require('fs');
const mongoose = require("mongoose");
const pug = require("pug"); //import du module pug

const port = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');

const compiledFunction = pug.compileFile("./views/template.pug"); //compilation du template pug
const addCity = pug.compileFile("./views/addCity.pug");

mongoose.connect('mongodb://localhost/TP_WEB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected.'))
    .catch((err) => console.log(err))
const db = mongoose.connection;
const citiesSchema = new mongoose.Schema({
    name: String
});

const Cities = mongoose.model("Cities", citiesSchema);

db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", function () {
    // We're connected!
});

app.get('/', (req, res) => {
    const addCityToBDD = addCity();
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(addCityToBDD);
});

// GET: cities
app.get('/cities', (req, res) => {
    Cities.find(function (err, cities) {
        if (err) return console.error(err);

        const tableOfCities = compiledFunction({
            Cities: cities
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(tableOfCities);
    });
});

// POST: city
app.post('/city', (req, res) => {
    Cities.find(function (err, cities) {
        if (err) return console.error(err);
        cities.map((city) => {
            if (city.name === req.body.name) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/html");
                res.end("Already exist.");
            }
        });
    });

    const city = new Cities({ name: req.body.name });
    // Add the new value
    city.save(function (err) {
        if (err) return console.error(err);
        // res.redirect(201, "/cities");
        res.writeHead(201,
            { Location: '/cities' }
        );
        res.end();
    });
});

// PUT: city/:id
app.put('/city/:id', (req, res) => {
    Cities.findById(req.params.id, function (err, city) {
        if (err) return console.error(err);
        city.name = req.body.name;
        city.save(function (err) {
            if (err) return console.error(err);
            res.redirect(201, "/cities");
            console.log("City updated.");
        })
    });
});

// DELETE: city/:id
app.delete('/city/:id', (req, res) => {
    Cities.remove({ _id: req.params.id }, function (err, city) {
        if (err) return console.error(err);
        res.redirect(200, "/cities");
        console.log("City deleted.");
    });
});

app.listen(port, () => {
    console.log(`Serveur running at port ${port}`);
});