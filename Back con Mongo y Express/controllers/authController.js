const { User } = require("../models/User");
require("dotenv").config();

const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    //agrego los populate
    const user = await User.findOne({ username: req.body.username })
      .select("+password")
      .populate("followers")
      .populate("following");

    if (!user) return res.status(404).json({ message: "Credenciales inválidas" });

    const isValidPassword = await user.verifyPassword(req.body.password);

    if (!isValidPassword) return res.status(404).json({ message: "Credenciales inválidas" });

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      token,
      userId: user._id,
      userImg: user.profileImg,
      // followers: user.followers,
      // following: user.following,
      user, //
    });
  } catch (error) {
    return res.status(500).json({ msg: "No se pudo hacer login", error: error.message });
  }
}

module.exports = { login };
