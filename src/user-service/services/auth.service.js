import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import db from "../models";
import { generateToken } from "../../utils/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleGoogleLogin = async (credential) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;

  let user = await db.users.findOne({ where: { email } });
  if (!user) {
    user = await db.users.create({
      googleId,
      email,
      full_name: name,
      profile_picture: picture,
      is_verified: true,
      role_id: 3,
      uuid: uuidv4(),
      username: `google_${googleId}`,
      password: null,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  return { token: generateToken(user), user };
};

export const handleFacebookLogin = async (accessToken) => {
  const { data } = await axios.get(
    `https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  let user = await db.users.findOne({
    where: {
      [db.Sequelize.Op.or]: [{ facebookId: data.id }, { email: data.email }],
    },
  });

  if (!user) {
    user = await db.users.create({
      facebookId: data.id,
      email: data.email,
      full_name: data.name,
      profile_picture: data.picture?.data?.url,
      is_verified: true,
      role_id: 3,
      uuid: uuidv4(),
      username: `facebook_${data.id}`,
      password: null,
    });
  } else if (!user.facebookId) {
    user.facebookId = data.id;
    await user.save();
  }

  return { token: generateToken(user), user };
};
