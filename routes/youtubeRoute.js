const express = require("express");

const router = express.Router();

const {
  addyoutubeLink,
  getyoutubeLink,
} = require("../controllers/youtubelink");

router.post("/", addyoutubeLink);
router.get("/", getyoutubeLink);

module.exports = router;
