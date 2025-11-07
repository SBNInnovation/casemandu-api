const express = require("express");
const { getAnswer } = require("../controllers/aiController");

const router = express.Router();

router.route("/:query").get(getAnswer);

module.exports = router;
