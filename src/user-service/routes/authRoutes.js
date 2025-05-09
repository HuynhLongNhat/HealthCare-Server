const express = require("express");
const passport = require("passport");

const router = express.Router();

// Route để bắt đầu Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route callback sau khi Google xác thực
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = req.user.generateAuthToken(); // Tạo token JWT
    // Chuyển hướng đến frontend với token trong query string
    res.redirect(`http://localhost:5173?token=${token}`);
  }
);

module.exports = router;