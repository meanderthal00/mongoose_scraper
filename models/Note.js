var mongoose = require("mongoose");

// refrencing the Schema xonstructor
var Schema = mongoose.Schema;

// creating a new NoteSchema object

var NoteSchema = new Schema({
    title: String,
    body: String
});

// building model 
var Note = mongoose.model("Note", NoteSchema);

// export Note model
module.exports = Note;