import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
    httpOnly: true, // prevent XSS attacks
    sameSite: "none", // REQUIRED for cross-domain cookies across Render services
    secure: true, // REQUIRED when sameSite is "none" (must run over HTTPS)
  });

  return token;
};