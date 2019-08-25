var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser =require("body-parser");

var express =require("express");
var app = express();

app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended:false
    })
);
app.use(express.static(process.cwd() + "/public"));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout:"main"}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/ArticleScraper");
var db = mongoose.connection; 

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function(){
    console.log("Connected to Mongoose");
});

// Import and use routes.
var scraperRoutes = require("./controller/controller.js");
app.use(scraperRoutes);


var port = process.env.PORT ||3000
app.listen(port, function(){
    console.log("Listening on PORT " + port);
}
)

