const { mongoose, Schema } = require("../db");

const tweetSchema = new Schema(
  {
    text: { type: String, maxLength: 140 },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  },
);

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
