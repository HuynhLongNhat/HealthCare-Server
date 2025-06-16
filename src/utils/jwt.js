import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role_id,
      userId: user.id,
      avatar: user.profile_picture,
      full_name: user.full_name,
      facebookId: user?.facebookId,
      googleId: user?.googleId,
      username: user?.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};
