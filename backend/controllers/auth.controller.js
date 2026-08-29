import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils.js";
import { redis } from "../lib/redis.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    // Store token and set cookie
    const token = generateTokenAndSetCookie(user._id, res); 

    // Upstash Redis options object syntax + defensive try/catch wrapper
    if (token) {
      try {
        await redis.set(`refresh_token:${user._id}`, token, {
          ex: 15 * 24 * 60 * 60, // Expiration in seconds
        });
      } catch (redisError) {
        console.warn("⚠️ Failed to cache token in Upstash Redis:", redisError.message);
      }
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    if (token) {
      try {
        await redis.set(`refresh_token:${user._id}`, token, {
          ex: 15 * 24 * 60 * 60,
        });
      } catch (redisError) {
        console.warn("⚠️ Failed to cache token in Upstash Redis:", redisError.message);
      }
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.cookies.jwt;
    
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    if (req.user?._id) {
      try {
        await redis.del(`refresh_token:${req.user._id}`);
      } catch (redisError) {
        console.warn("⚠️ Failed to delete token from Upstash Redis:", redisError.message);
      }
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.log("Error in getProfile controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};