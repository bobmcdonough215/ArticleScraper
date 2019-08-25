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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/articleScraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// mongoose.Promise = Promise;
// var dbConnect = process.env.MONGODB_URI || "mongodb://localhost/articleScraper";
// if(process.env.MONGODB_URI) {
//     mongoose.connect(process.env.MONGODB_URI)
// } else {
//     mongoose.connect(dbConnect);
// }

// var db = mongoose.connection; 

// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function(){
//     console.log("Connected to Mongoose");
// });

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout:"main"}));
app.set("view engine", "handlebars");

// Import and use routes.
var scraperRoutes = require("./controller/controller.js");
app.use(scraperRoutes);


var port = process.env.PORT ||3000
app.listen(port, function(){
    console.log("Listening on PORT " + port);
}
)

