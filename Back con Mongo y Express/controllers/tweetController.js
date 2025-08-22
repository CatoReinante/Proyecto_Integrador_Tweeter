const Tweet = require("../models/Tweet");
const { User } = require("../models/User");

// Display a listing of the resource.
async function index(req, res) {
  try {
    const tweets = await Tweet.find().populate("user").sort({ createdAt: -1 }).limit(20);
    return res.status(200).json(tweets);
  } catch (error) {
    return res.status(500).json({ msg: "An error occurred", error: error.message });
  }
}

// Store a newly created resource in storage.
async function store(req, res) {
  try {
    const { text } = req.body;
    const userId = req.auth.sub;
    const trimmedText = text.trim();

    if (trimmedText) {
      const newTweet = new Tweet({
        text: trimmedText,
        user: userId,
      });
      await newTweet.save();
      const user = await User.findById(userId);
      user.tweets.push(newTweet._id);
      await user.save();

      newTweet.user = user;
      return res.status(201).json({ msg: "Tweet creado correctamente", newTweet });
    }
    return res
      .status(400)
      .json({ msg: "Missing content for tweet creation", error: error.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "An error occurred" });
  }
}

// Update the specified resource in storage.
async function like(req, res) {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.id);

    const isInLikes = tweet.likes.includes(userId);
    if (isInLikes) {
      tweet.likes.pull(userId);
    } else {
      tweet.likes.push(userId);
    }
    await tweet.save();
    return res.status(200).json({ total_Likes: tweet.likes.length });
  } catch (error) {
    if (error.name === "CastError" && error.path === "_id") {
      return res.status(404).json({ msg: "Tweet not found", error: error.message });
    }
    return res
      .status(500)
      .json({ msg: "No se pudo cambiar la cantidad de likes", error: error.message });
  }
}

// Remove the specified resource from storage.
async function destroy(req, res) {
  try {
    const deletedTweet = await Tweet.findByIdAndDelete(req.params.id);
    console.log(deletedTweet);
    const user = await User.findById(deletedTweet.user);

    user.tweets.pull(deletedTweet._id);
    await user.save();

    if (deletedTweet) {
      return res.status(204).json({ message: "El tweet fue borrado" });
    }
    return res.status(404).json({ message: "Tweet not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "No se pudo cambiar eliminar el tweet", error: error.message });
  }
}

module.exports = {
  index,
  store,
  like,
  destroy,
};
