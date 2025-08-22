const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const fs = require("fs");
const suma = 1 + 1;

// Display the specified resource.
async function show(req, res) {
  try {
    const showUser = await User.findOne({
      username: req.params.username,
    });
    if (showUser) {
      await showUser.populate("tweets");
      await showUser.populate("followers");
      await showUser.populate("following");
      return res.status(200).json(showUser);
    }
    return res.status(404).json({ msg: "Unable to find user" });
  } catch (error) {
    return res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
}

// Store a newly created resource in storage.

async function store(req, res) {
  try {
    const form = formidable({
      multiples: true,
      // uploadDir: __dirname + "/../public/img",
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      const { firstname, lastname, username, password, email /*description*/ } = fields;
      if (Object.values(fields).every(Boolean)) {
        const usernameInUse = await User.findOne({
          username,
        });

        const emailInUse = await User.findOne({
          email,
        });
        if (!usernameInUse && !emailInUse) {
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log();
          //Uploading image to supabase
          const { data, error } = await supabase.storage
            .from("proyecto.integrador.twitter")
            .upload(files.image.newFilename, fs.createReadStream(files.image.filepath), {
              cacheControl: "3600",
              upsert: false,
              contentType: files.image.mimetype,
              duplex: "half",
            });

          // obtaining the url for said image from the bucket
          const { data: publicUrlData } = supabase.storage
            .from("proyecto.integrador.twitter")
            .getPublicUrl(files.image.newFilename);

          const imageUrl = publicUrlData?.publicUrl;
          const defaultImg =
            "https://wxfdhejjlsmchtbuxgvv.supabase.co/storage/v1/object/public/proyecto.integrador.twitter//default-avatar.jpg";

          const newUser = await User.create({
            firstname,
            lastname,
            username,
            password: hashedPassword,
            email,
            // description,
            profileImg: imageUrl || defaultImg,
          });
          return res.status(201).json(newUser);
        } else {
          return res.status(400).json({ msg: "Credentials already in use" });
        }
      } else {
        return res.status(400).json({ msg: "Missing information for user creation" });
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: "Missing data for user creation", error: error.message });
  }
}

async function follow(req, res) {
  try {
    const loggedUser = await User.findById(req.auth.sub);

    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (req.auth.sub === req.params.id) {
      return res.status(400).json({ message: "No podés seguirte a vos mismo" });
    }

    const isFollower = loggedUser.following.includes(userToFollow._id); //si sigo a esta persona
    console.log(isFollower);
    if (isFollower) {
      loggedUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(loggedUser._id);
    } else {
      loggedUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedUser._id);
    }
    await loggedUser.populate("following");
    await loggedUser.populate("followers");
    await userToFollow.save();
    await loggedUser.save();

    return res.status(200).json({ total_followers: loggedUser.following.length });
  } catch (error) {
    if (error.name === "CastError" && error.path === "_id") {
      return res
        .status(404)
        .json({ msg: "The user you are trying to follow doesn't exist", error: error.message });
    }
    return res
      .status(500)
      .json({ msg: "No se pudo cambiar la cantidad de followers", error: error.message });
  }
}

async function followersIndex(req, res) {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json(user.followers);
  } catch (error) {
    if (error.name === "CastError" && error.path === "_id") {
      return res.status(404).json({ msg: "User not found", error: error.message });
    }
    return res.status(500).json({
      msg: "Ocurrio un error al obtener los followers del usuario",
      error: error.message,
    });
  }
}

async function followingIndex(req, res) {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json(user.following);
  } catch (error) {
    if (error.name === "CastError" && error.path === "_id") {
      return res.status(404).json({ msg: "User not found", error: error.message });
    }
    return res.status(500).json({
      msg: "Ocurrio un error al obtener los seguidores del usuario",
      error: error.message,
    });
  }
}

module.exports = {
  show,
  store,
  follow,
  followersIndex,
  followingIndex,
};
