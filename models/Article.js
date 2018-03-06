var mongoose = require("mongoose");

// Schema constructor
var Schema = mongoose.Schema;

// creating an new UserSchema object
var ArticleSchema = new Schema({
    // `title` is required and of type String
    title: {
        type: String,
        required: true
    },
    // `link` is required and of type String
    link: {
        type: String,
        required: true
    },
    // `note` is an object that stores a Note id

    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

//   creating a model using mongoose model

var Article = mongoose.model("Article", ArticleSchema);

// exporting the model
module.exports = Article;