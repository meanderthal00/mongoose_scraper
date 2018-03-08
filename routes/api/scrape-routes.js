// scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// model requirements
var db = require("./models");
//   Routing
// app.get("/", function(req, res) {
//     res.send("./main.handlebars");
//   });

module.exports = function (app){
// GET route for scraping the huffington post web site

app.get("/api/scrape", function (req, res) {
    axios.get("http://www.orlandosentinel.com/news/orange/").then(function (response) {
        // loading html body to cheerio and saving to $ for shorthand selector
        var $ = cheerio.load(response.data);
        // grabbing the tags from the html
        $("h3").each(function (i, element) {
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
};