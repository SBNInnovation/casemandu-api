const express = require("express");
const {
  getPinterest,
  getPinByQuery,
} = require("../controllers/pinterestController");

const router = express.Router();

router.route("/").get(getPinterest);
router.route("/:query").get(getPinByQuery);

module.exports = router;
