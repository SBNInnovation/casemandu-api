import mongoose, { Schema } from "mongoose";

const youtubeSchema = new Schema({
  youtube_url: {
    type: String,
    default: "",
  },
});

const YoutubeModel = mongoose.model("Youtube", youtubeSchema);

export default YoutubeModel;
