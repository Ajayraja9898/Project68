import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

// ======================================================
// ADMIN ACCOUNT DETAILS
// ======================================================
//
// Change ONLY these two values.
// Do NOT paste your password into ChatGPT.
//

const ADMIN_NAME = "Project68 Admin";
const ADMIN_ROLL_NUMBER = "ADMIN001";
const ADMIN_PASSWORD = "Ajay@78792";

// ======================================================
// CREATE ADMIN
// ======================================================

const createAdmin = async () => {
  try {
    console.log("=================================");
    console.log("🛡️ PROJECT68 ADMIN CREATION");
    console.log("=================================");

    // --------------------------------------------------
    // Connect to MongoDB
    // --------------------------------------------------

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    // --------------------------------------------------
    // Check whether an admin already exists
    // --------------------------------------------------

    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      console.log("⚠️ ADMIN ALREADY EXISTS");
      console.log("---------------------------------");
      console.log("Name:", existingAdmin.name);
      console.log(
        "Roll Number:",
        existingAdmin.rollNumber
      );
      console.log(
        "Role:",
        existingAdmin.role
      );
      console.log("---------------------------------");

      await mongoose.disconnect();
      return;
    }

    // --------------------------------------------------
    // Check roll number
    // --------------------------------------------------

    const existingUser = await User.findOne({
      rollNumber: ADMIN_ROLL_NUMBER,
    });

    if (existingUser) {
      console.log(
        `❌ Roll number ${ADMIN_ROLL_NUMBER} is already registered.`
      );

      console.log(
        "Choose a different ADMIN_ROLL_NUMBER."
      );

      await mongoose.disconnect();
      return;
    }

    // --------------------------------------------------
    // Validate password
    // --------------------------------------------------

    if (
      !ADMIN_PASSWORD ||
      ADMIN_PASSWORD ===
        "CHANGE_THIS_TO_YOUR_ADMIN_PASSWORD"
    ) {
      console.log(
        "❌ Please set your admin password first."
      );

      await mongoose.disconnect();
      return;
    }

    if (ADMIN_PASSWORD.length < 6) {
      console.log(
        "❌ Admin password must contain at least 6 characters."
      );

      await mongoose.disconnect();
      return;
    }

    // --------------------------------------------------
    // Hash password
    // --------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        ADMIN_PASSWORD,
        10
      );

    // --------------------------------------------------
    // Create admin
    // --------------------------------------------------

    const admin = await User.create({
      name: ADMIN_NAME,

      rollNumber:
        ADMIN_ROLL_NUMBER,

      password:
        hashedPassword,

      role: "admin",

      isOnline: false,

      lastSeen: new Date(),
    });

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    console.log("=================================");
    console.log("✅ ADMIN ACCOUNT CREATED");
    console.log("=================================");

    console.log(
      "Admin ID:",
      admin._id.toString()
    );

    console.log(
      "Admin Name:",
      admin.name
    );

    console.log(
      "Admin Roll Number:",
      admin.rollNumber
    );

    console.log(
      "Admin Role:",
      admin.role
    );

    console.log("=================================");
    console.log(
      "🛡️ ADMIN ACCOUNT IS READY"
    );
    console.log("=================================");

    // --------------------------------------------------
    // Disconnect
    // --------------------------------------------------

    await mongoose.disconnect();

    console.log(
      "✅ MongoDB disconnected"
    );
  } catch (error) {
    console.error(
      "🔥 ADMIN CREATION ERROR"
    );

    console.error(error);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exitCode = 1;
  }
};

createAdmin();
