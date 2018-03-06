// requires
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// modle requirements
var db = require("./models");

var PORT = 3000;

// Init Express
var app = express();

// Config for middleware

// Using morgan to log results
app.use(logger("dev"));
// BodyParser for submissions
// =========should the extended be true or false? I seem to remember this being changed in class.==========
app.use(bodyParser.urlencoded({
    extended: false
}));
// use express.static to serve the public folder as a static directory
app.use(express.static("public"));


var MONGODB_URI = process.env.MONGODB_URI || 
"mongodb://localhost/mongoHeadlines";

// Setting mongoose to use promises instead of callbacks
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//   Routing
app.get("/", function(req, res) {
    res.send("./main.handlebars");
  });

// GET route for scraping the huffington post web site

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/").then(function (response) {
        // loading html body to cheerio and saving to $ for shorthand selector
        var $ = cheerio.load(response.data);
        // grabbing the tags from the html
        $(".AssetHeadline-headline--1T0Wg AssetHeadline-type__2--3QaVO").each(function (i, element) {
            // saving an empty result object
            var result = {};
            // add the text and href of links and save as protperties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // creating a new Article from the results of the scrape
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err);
                });

        });
        // confirmation that the scrape is successful
        res.send("Scrape Successful")
    });
});

// route that gets all articles from db
app.get("/articles", function (req, res) {
    // getting all docs in the articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // sending articles back to client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // reporting errors (if any) to client
            res.json(err);
        });
});

// route for grabbing article by id, and populating with any notes
app.get("articles/:id", function (req, res) {
    // query that finds the requested (by id) entry in our db
    db.Article.findOne({
            _id: req.params.id
        })
        // ...and its notes
        .populate("note")
        .then(function (dbArticle) {
            // sending article back to client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // reporting errors (if any) to client
            res.json(err);
        });
});

// route for saving or updating an Article's notes
app.post("/articles/:id", function (req, res) {
    // create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            // sending the successfully updated article back to client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // reporting errors (if any) to client
            res.json(err);
        });
});

// starting the server.
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
})