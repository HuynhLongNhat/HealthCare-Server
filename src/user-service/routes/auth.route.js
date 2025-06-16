import express from "express";
import passport from "passport";
import {
  googleCallback,
  facebookCallback,
  googleTokenLogin,
  facebookTokenLogin,
  logout,
} from "../controllers/auth.controller";

const router = express.Router();

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: `${process.env.FRONTEND_ROOT_URL}/login`,
  session: false,
}), googleCallback);
router.post("/google/token", googleTokenLogin);

// Facebook OAuth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"], session: false }));
router.get("/facebook/callback", passport.authenticate("facebook", {
  failureRedirect: `${process.env.FRONTEND_ROOT_URL}/login`,
  session: false,
}), facebookCallback);
router.post("/facebook/token", facebookTokenLogin);

// Logout
router.post("/logout", logout);

export default router;
