import { generateToken } from "../../utils/jwt";
import { handleGoogleLogin, handleFacebookLogin } from "../services/auth.service";

export const googleCallback = (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_ROOT_URL}/login?token=${token}`);
};

export const facebookCallback = (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_ROOT_URL}/login?token=${token}`);
};

export const googleTokenLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential is required" });

    const { token, user } = await handleGoogleLogin(credential);
    return res.json({
      EM: "Đăng nhập thành công",
      EC: 0,
      DT: { token, user },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

export const facebookTokenLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { token, user } = await handleFacebookLogin(accessToken);
    return res.json({
      EM: "Đăng nhập thành công",
      EC: 0,
      DT: { token, user },
    });
  } catch (error) {
    console.error("Facebook login error:", error);
    res.status(401).json({ message: "Facebook authentication failed" });
  }
};

export const logout = (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
};
