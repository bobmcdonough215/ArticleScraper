var express = require("express");
var router = express.Router();
var path = require("path");
var axios =require("axios");

var request = require("request");
var cheerio = require("cheerio");
// var axios =require("axios");

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.redirect("/articles");
});


router.get("/scrape", function(req, res) {
  var titlesArray = [];
  request("https://www.longform.org/best", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);

  console.log(html);

  // Set the articles array for handlebar use


    $("article.h2").each(function(i, element) {
      var result = {};

      result.id=i;
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

        result.push(titlesArray);


        res.render("/scrape", { articles: titlesArray });


      if (result.title !== "" && result.link !== "") {
        if (titlesArray.indexOf(result.title) == -1) {
          titlesArray.push(result.title);

          Article.count({ title: result.title }, function(err, test) {
            if (test === 0) {
              var entry = new Article(result);

              entry.save(function(err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
            }
          });
        } else {
          console.log("Article already exists.");
        }
      } else {
        console.log("Not saved to DB, missing data");
      }
    });
    res.redirect("/");
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

  // Article.findOne({ _id: articleId })
  //   .populate("comment")
  //   .exec(function(err, doc) {
  //     if (err) {
  //       console.log("Error: " + err);
  //     } else {
  //       hbsObj.article = doc;
  //       var link = doc.link;
  //       request(link, function(error, response, html) {
  //         var $ = cheerio.load(response.data);

  //         $(".1-col__main").each(function(i, element) {
  //           hbsObj.body = $(this)
  //           .children("div.river js-river")
  //             .children("p")
  //             .text();


  //           res.render("article", hbsObj);
  //           return false;
  //         });
  //       });
  //     }
  //   });
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