import jwt from "jsonwebtoken";

export function signAccessToken({ jwtSecret, uid, openId }) {
  return jwt.sign({ uid, openId }, jwtSecret, { expiresIn: "30d" });
}

export function authMiddleware({ jwtSecret }) {
  return function auth(req, res, next) {
    const raw = String(req.headers.authorization || "");
    const token = raw.startsWith("Bearer ") ? raw.slice("Bearer ".length) : "";
    
    // Optional: Allow public access if no token? No, middleware implies auth required.
    // If you need optional auth, use another middleware.
    
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      const payload = jwt.verify(token, jwtSecret);
      req.user = { uid: payload.uid, openId: payload.openId };
      next();
    } catch (e) {
      res.status(401).json({ error: "UNAUTHORIZED" });
    }
  };
}
