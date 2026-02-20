const { default: YoutubeModel } = require("../models/youtubeModel");

const addyoutubeLink = async (req, res) => {
  try {
    const { youtube_url } = req.body;

    if (!youtube_url) {
      return res.status(400).json({ message: "YouTube URL is required" });
    }
    const createLink = await YoutubeModel.create({ youtube_url });
    if (!createLink) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to add YouTube link" });
    }

    res.status(201).json({
      success: true,
      message: "YouTube link added successfully",
      data: createLink,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getyoutubeLink = async (req, res) => {
  try {
    const youtubeLinks = await YoutubeModel.find();
    res.status(200).json({
      success: true,
      data: youtubeLinks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addyoutubeLink,
  getyoutubeLink,
};
