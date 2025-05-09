import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Yêu cầu xác thực người dùng",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token không hợp lệ hoặc hết hạn!",
    });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Yêu cầu xác thực người dùng",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền này",
      });
    }

    next();
  };
};
