const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Household = require("../models/Household");

const JWT_SECRET = process.env.JWT_SECRET || "cozyshare_secret";

// helper to generate a simple invite code
function generateHouseholdCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ---------- REGISTER ----------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mode, householdName, inviteCode } = req.body;

    // 1) basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let householdCode = null;

    // 2) create new household
    if (mode === "create") {
      if (!householdName) {
        return res
          .status(400)
          .json({ message: "Household name is required to create a household" });
      }

      // generate unique code
      let code = generateHouseholdCode();
      let existingHousehold = await Household.findOne({ code });

      while (existingHousehold) {
        code = generateHouseholdCode();
        existingHousehold = await Household.findOne({ code });
      }

      const household = await Household.create({
        name: householdName,
        code,
      });

      householdCode = household.code;

      // 3) join existing household
    } else if (mode === "join") {
      if (!inviteCode) {
        return res
          .status(400)
          .json({ message: "Invite code is required to join a household" });
      }

      const household = await Household.findOne({ code: inviteCode });
      if (!household) {
        return res.status(400).json({ message: "Invalid household invite code" });
      }

      householdCode = household.code;
    } else {
      // optional: user without household
      householdCode = null;
    }

    // 4) create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      householdCode,
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        householdCode: user.householdCode,
      },
      token: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" }),
      householdCode: user.householdCode,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist. Please register to continue." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        householdCode: user.householdCode,
      },
      token: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" }),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
