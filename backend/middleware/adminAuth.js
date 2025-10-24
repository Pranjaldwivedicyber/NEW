import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    } else if (req.cookies) {
      token = req.cookies.token || req.cookies.jwt || req.cookies.auth;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.admin) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    next();
  } catch (error) {
    console.error("adminAuth error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuth;
