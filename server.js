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
)

var expressHandleBars = require("express-handlebars");
app.engine("handlebars", expressHandleBars({defaultLayout:"main"}));
app.set("view engine", "handlebars");

var port = process.env.PORT ||3000
app.listen(port, function(){
    console.log("Listening on PORT " + port);
    

}
)

