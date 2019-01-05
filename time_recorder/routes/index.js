var express = require("express");
var sendData = require("../modules/googleDocs.js");

var router = express.Router();
/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express", moment: require("moment") });
});

/* POST Data */
router.post("/add_process", (req, res) => {
  var content = req.body.content;
  googleDocs = sendData(content);
  res.redirect("/");
});

module.exports = router;
