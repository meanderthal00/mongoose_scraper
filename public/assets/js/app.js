// getting articles as a json object
$.getJSON("/articles", function (data) {
    for (var i = 0; i < data.length; i++) {
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

// when <p> tag is clicked, brings up the notes
$(document).on("click", "p", function () {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");

    // ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // adding the note data to the html
        .then(function (data) {
            console.log(data);
            //title
            $("#notes").prepend("<h2>" + data.title + "</h2>");
            // new title input
            $("#notes").prepend("<input id='titleinput' name='title' >");
            //textarea to add new note
            $("#notes").prepend("<textarea id='bodyinput' name='body'></textarea>");
            // button to submit new note with its id
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            //if the article already has a note
            if (data.note) {
                $("#titleinput").val(data.note.title);
                $("#bodyinput").val(data.note.body);
            }
        });
});

//button function to save added note
$(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");

    // post request to change the note to what the user input is
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                title: $("#titleinput").val(),
                body: $("#bodyinput").val()
            }
        })
        // logging ajax response and clearing the notes section
        .then(function (data) {
            console.log(data);

            $("#notes").empty();
        });

    // clearing the inputs on the page
    $("#titleinput").val("");
    $("#bodyinput").val("");
});