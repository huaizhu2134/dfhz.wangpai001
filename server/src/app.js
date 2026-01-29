import cors from "cors";
import express from "express";
import multer from "multer";
import { authMiddleware, signAccessToken } from "./auth.js";
import { putObject } from "./cos.js";
import { code2Session } from "./wechat.js";

export function createApp({ config, db, cos }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/healthz", async (_req, res) => {
    try {
      await db.execute("SELECT 1");
      res.json({ ok: true, db: true });
    } catch (e) {
      res.status(500).json({ ok: false, db: false });
    }
  });

  app.post("/api/auth/wxlogin", async (req, res) => {
    try {
      const code = String(req.body?.code || "");
      if (!code) return res.status(400).json({ error: "CODE_REQUIRED" });

      const session = await code2Session({ ...config.wechat, code });
      if (!session.openId) return res.status(500).json({ error: "NO_OPENID" });

      await db.execute(
        "INSERT INTO shop_user (openId, createdAt, updatedAt) VALUES (?, NOW(), NOW()) ON DUPLICATE KEY UPDATE updatedAt = NOW()",
        [session.openId],
      );

      const [rows] = await db.execute("SELECT id, openId, nickName, avatarUrl, phone, name, address, location FROM shop_user WHERE openId = ? LIMIT 1", [
        session.openId,
      ]);
      const row = rows?.[0];
      if (!row) return res.status(500).json({ error: "USER_NOT_FOUND_AFTER_UPSERT" });

      const uid = String(row.id);
      const token = signAccessToken({ jwtSecret: config.jwtSecret, uid, openId: row.openId });

      res.json({
        token,
        user: { ...normalizeUserRow(row), _id: uid },
      });
    } catch (e) {
      res.status(500).json({ error: "LOGIN_FAILED" });
    }
  });

  const auth = authMiddleware({ jwtSecret: config.jwtSecret });

  app.get("/api/user/me", auth, async (req, res) => {
    const uid = String(req.user?.uid || "");
    if (!uid) return res.status(401).json({ error: "UNAUTHORIZED" });

    const [rows] = await db.execute("SELECT id, openId, nickName, avatarUrl, phone, name, address, location FROM shop_user WHERE id = ? LIMIT 1", [
      uid,
    ]);
    const row = rows?.[0];
    if (!row) return res.status(404).json({ error: "NOT_FOUND" });

    res.json({ user: { ...normalizeUserRow(row), _id: String(row.id) } });
  });

  app.put("/api/user/me", auth, async (req, res) => {
    const uid = String(req.user?.uid || "");
    if (!uid) return res.status(401).json({ error: "UNAUTHORIZED" });

    const data = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
    const patch = pickUserPatch(data || {});
    if (!Object.keys(patch).length) return res.json({ count: 0 });

    const fields = Object.keys(patch);
    const values = fields.map((k) => patch[k]);
    const setSql = fields.map((k) => `${k} = ?`).join(", ");

    await db.execute(`UPDATE shop_user SET ${setSql}, updatedAt = NOW() WHERE id = ?`, [...values, uid]);

    const [rows] = await db.execute("SELECT id, openId, nickName, avatarUrl, phone, name, address, location FROM shop_user WHERE id = ? LIMIT 1", [
      uid,
    ]);
    const row = rows?.[0];
    res.json({ user: { ...normalizeUserRow(row), _id: String(row.id) } });
  });

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

  app.post("/api/upload/avatar", auth, upload.single("file"), async (req, res) => {
    try {
      const uid = String(req.user?.uid || "");
      if (!uid) return res.status(401).json({ error: "UNAUTHORIZED" });
      const file = req.file;
      if (!file?.buffer) return res.status(400).json({ error: "FILE_REQUIRED" });

      const safeName = String(file.originalname || "avatar").replace(/[^\w.\-]+/g, "_");
      const key = `avatars/${uid}/${Date.now()}_${safeName}`;

      await putObject({
        cos,
        bucket: config.cos.bucket,
        region: config.cos.region,
        key,
        buffer: file.buffer,
        contentType: file.mimetype,
      });

      const base = config.cos.publicBaseUrl.replace(/\/+$/, "");
      const url = `${base}/${key}`;

      await db.execute("UPDATE shop_user SET avatarUrl = ?, updatedAt = NOW() WHERE id = ?", [url, uid]);

      const [rows] = await db.execute("SELECT id, openId, nickName, avatarUrl, phone, name, address, location FROM shop_user WHERE id = ? LIMIT 1", [
        uid,
      ]);
      const row = rows?.[0];
      res.json({ user: { ...normalizeUserRow(row), _id: String(row.id) } });
    } catch (e) {
      res.status(500).json({ error: "UPLOAD_FAILED" });
    }
  });

  return app;
}

function normalizeUserRow(row) {
  return {
    openId: row.openId,
    nickName: row.nickName || "",
    avatarUrl: row.avatarUrl || "",
    phone: row.phone || "",
    name: row.name || "",
    address: row.address || "",
    location: row.location ? tryJsonParse(row.location) : null,
  };
}

function tryJsonParse(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch (e) {
    return null;
  }
}

function pickUserPatch(data) {
  const patch = {};
  if (typeof data.nickName === "string") patch.nickName = data.nickName;
  if (typeof data.avatarUrl === "string") patch.avatarUrl = data.avatarUrl;
  if (typeof data.phone === "string") patch.phone = data.phone;
  if (typeof data.name === "string") patch.name = data.name;
  if (typeof data.address === "string") patch.address = data.address;
  if (data.location && typeof data.location === "object") patch.location = JSON.stringify(data.location);
  return patch;
}
