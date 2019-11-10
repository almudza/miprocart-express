let express = require("express");
let router = express.Router();

let Page = require("../models/page");

router.get("/", function(req, res) {
  Page.findOne({ slug: "home" }, (err, page) => {
    if (err) console.log(err);

    res.render("index", {
      title: "title",
      content: "content"
    });
  });
});

/**
 * ============================= GET PAGE ======================================
 * =============================================================================
 */
router.get("/:slug", (req, res) => {
  let slug = req.params.slug;

  Page.findOne({ slug: slug }, (err, page) => {
    if (err) console.log(err);

    if (!page) {
      res.redirect("/");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content
      });
    }
  });
});

router.get("/test", function(req, res) {
  res.send("test page");
});

// exports
module.exports = router;
