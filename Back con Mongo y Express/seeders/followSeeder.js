const faker = require("@faker-js/faker").fakerES;
const { User } = require("../models/User");

module.exports = async () => {
  const users = await User.find();

  for (const user of users) {
    const randomFollowers = faker.number.int({ min: 0, max: 99 });

    for (let i = 0; i < randomFollowers; i++) {
      if (user._id !== users[i]._id) user.followers.push(users[i]._id);
    }

    const randomFollowing = faker.number.int({ min: 0, max: 99 });
    for (let j = 0; j < randomFollowing; j++) {
      if (user._id !== users[j]._id) user.following.push(users[j]._id);
    }

    await user.save();
  }
  console.log(" Followers y following actualizados");
};
