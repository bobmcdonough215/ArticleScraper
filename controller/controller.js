var express = require("express");
var router = express.Router();
var path = require("path");
var axios =require("axios");
var logger =require("morgan");
var mongoose =require("mongoose");

var request = require("request");
var cheerio = require("cheerio");
var app = express();
var db =require("../models");
// var axios =require("axios");

// // Use morgan logger for logging requests
// app.use(logger("dev"));
// // Parse request body as JSON
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// // Make public a static folder
// // app.use("/".express.static("public"));


var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");
mongoose.connect("mongodb://localhost/articleScraper", { useNewUrlParser: true });



router.get("/", function(req, res){
  res.redirect("/articles")
})
router.get("/scrape", function(req, res) {
  request.get("https://www.longform.org/best", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);


  // Set the articles array for handlebar use


    $(".post--single.js-post").each(function(i, element) {
      var result = {};

      result.title = $(this)
      .find(".post__title__highlight")
      .text()
      .replace("\\n", "")
      .trim()

      result.link =$(this)
      .children("a")
      .attr("href")

      result.summary=$(this)
      .find(".post__body p")
      .text()
      .replace("\\n", "")
      .trim()

      console.log(result);


    db.Article.create(result)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, log it
      console.log(err);
    });
});

// Send a message to the client
res.send("Scrape Complete");
});
});

router.get("/articles", function(req, res) {
  Article.find()
    .sort({ _id: -1 })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        var artcl = { article: doc };
        res.render("index", artcl);
      }
    });
});

router.get("/articles-json", function(req, res) {
  Article.find({}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

router.get("/clearAll", function(req, res) {
  Article.remove({}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("removed all articles");
    }
  });
  res.redirect("/articles-json");
});

router.get("/readArticle/:id", function(req, res) {
  var articleId = req.params.id;
  var hbsObj = {
    article: [],
    body: []
  };

  Article.findOne({ _id: articleId })
    .populate("comment")
    .exec(function(err, doc) {
      if (err) {
        console.log("Error: " + err);
      } else {
        hbsObj.article = doc;
        var link = doc.link;
        request(link, function(error, response, html) {
          var $ = cheerio.load(html);

          $("div.row").each(function(i, element) {
            hbsObj.body = $(this)
              .children(0)
              .children(1)
              .text();

            res.render("article", hbsObj);
            return false;
          });
        });
      }
    });
});
router.post("/comment/:id", function(req, res) {
  var user = req.body.name;
  var content = req.body.comment;
  var articleId = req.params.id;

  var commentObj = {
    name: user,
    body: content
  };

  var newComment = new Comment(commentObj);

  newComment.save(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log(doc._id);
      console.log(articleId);

      Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: doc._id } },
        { new: true }
      ).exec(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/readArticle/" + articleId);
        }
      });
    }
  });
});

module.exports = router;



// router.get("/articles", function(req, res) {
//   Article.find()
//     .sort({ _id: -1 })
//     .exec(function(err, doc) {
//       if (err) {
//         console.log(err);
//       } else {
//         var artcl = { article: doc };
//         res.render("index", artcl);
//       }
//     });
// });

// router.get("/articles-json", function(req, res) {
//   Article.find({}, function(err, doc) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.json(doc);
//     }
//   });
// });


// router.get("/readArticle/:id", function(req, res) {
//   var articleId = req.params.id;
//   var hbsObj = {
//     article: [],
//     body: []
//   };
//   router.get("/readArticle/:id", function(req, res) {
//     var articleId = req.params.id;
//     var hbsObj = {
//       article: [],
//       body: []
//     };
  
//     Article.findOne({ _id: articleId })
//       .populate("comment")
//       .exec(function(err, doc) {
//         if (err) {
//           console.log("Error: " + err);
//         } else {
//           hbsObj.article = doc;
//           var link = doc.link;
//           request(link, function(error, response, html) {
//             var $ = cheerio.load(html);
  
//             $(".p").each(function(i, element) {
//               hbsObj.body = $(this)
//                 .children(".post")
//                 .children("p")
//                 .text();
  
//               res.render("article", hbsObj);
//               return false;
//             });
//           });
//         }
//       });
//   });

// router.post("/comment/:id", function(req, res) {
//   var user = req.body.name;
//   var content = req.body.comment;
//   var articleId = req.params.id;

//   var commentObj = {
//     name: user,
//     body: content
//   };

//   var newComment = new Comment(commentObj);

//   newComment.save(function(err, doc) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(doc._id);
//       console.log(articleId);

//       Article.findOneAndUpdate(
//         { _id: req.params.id },
//         { $push: { comment: doc._id } },
//         { new: true }
//       ).exec(function(err, doc) {
//         if (err) {
//           console.log(err);
//         } else {
//           res.redirect("/readArticle/" + articleId);
//         }
//       });
//     }
//   });
// });
// })
// module.exports = router;