const express = require("express");

const router = express.Router();

const {
  addyoutubeLink,
  getyoutubeLink,
} = require("../controllers/youtubelink");

router.post("/youtube", addyoutubeLink);
router.get("/youtube", getyoutubeLink);

module.exports = router;
