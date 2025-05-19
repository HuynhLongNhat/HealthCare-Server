const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const db = require("../models/index");

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role_id,
      userId: user.id,
      avatar: user.profile_picture,
      full_name : user.full_name,
      facebookId: user?.facebookId,
      googleId: user?.googleId,
      username :user?.username
      
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:5173/login?token=${token}`);
  }
);

router.post("/google/token", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }
    // Verify Google token
    const ticket = await require("google-auth-library")
      .OAuth2Client(process.env.GOOGLE_CLIENT_ID)
      .verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    let user = await db.users.findOne({ where: { email } });
    if (!user) {
      console.log("Creating new user");
      user = await db.users.create({
        googleId,
        email,
        full_name: name,
        profile_picture: picture,
        is_verified: true,
        role_id: 3,
        uuid: require("uuid").v4(),
        username: `google_${googleId}`,
        password: null,
      });
    } else if (!user.googleId) {
      // Link Google ID to existing user
      user.googleId = googleId;
      await user.save();
    }
    const token = generateToken(user);
    return {
      EM: "Đăng nhập thành công",
      EC: 0,
      DT: {
        token,
        user: {
          user: user,
        },
      },
    };
  } catch (error) {
    console.error("Google token verification error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
});

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user);
     res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  }
);

// Alternative: API endpoint for frontend
router.post("/facebook/token", async (req, res) => {
  try {
    const { accessToken } = req.body;

    // Lấy thông tin user từ Facebook
    const { data } = await axios.get(
      `https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    // Kiểm tra hoặc tạo user trong database
    let user = await db.users.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { facebookId: data.id },
          { email: data.email }
        ]
      }
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
        password: null
      });
    } else if (!user.facebookId) {
      user.facebookId = data.id;
      await user.save();
    }

    const token = generateToken(user);
    res.json({
      EM: "Đăng nhập thành công",
      EC: 0,
      DT: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Facebook login error:", error);
    res.status(401).json({ message: "Facebook authentication failed" });
  }
});

module.exports = router;
