import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ======================
// Generate JWT Token
// ======================
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================
// Register User
// ======================
export const register = async (req, res) => {
  try {
    let { name, rollNumber, password } = req.body;

    name = name?.trim();
    rollNumber = rollNumber?.trim().toUpperCase();
    password = password?.trim();

    if (!name || !rollNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ rollNumber });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Roll Number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      rollNumber,
      password: hashedPassword,
      isOnline: true,
      isAvailableForPartner: true,
      lastSeen: new Date(),
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("========== REGISTER ERROR ==========");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================
// Login User
// ======================
export const login = async (req, res) => {
  try {
    let { rollNumber, password } = req.body;

    rollNumber = rollNumber?.trim().toUpperCase();
    password = password?.trim();

    if (!rollNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Roll Number and Password are required",
      });
    }

    const user = await User.findOne({ rollNumber });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Roll Number or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Roll Number or Password",
      });
    }

    user.isOnline = true;
    user.isAvailableForPartner = true;
    user.lastSeen = new Date();

    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("========== LOGIN ERROR ==========");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================
// Logout User
// ======================
export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      await User.findByIdAndUpdate(decoded.id, {
        isOnline: false,
        isAvailableForPartner: false,
        lastSeen: new Date(),
      });
    }
  } catch (error) {
    console.log("Logout Error:", error.message);
  }

  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ======================
// Change Password
// ======================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("========== CHANGE PASSWORD ERROR ==========");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};

// ======================
// Get Current User
// ======================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("========== GET ME ERROR ==========");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};