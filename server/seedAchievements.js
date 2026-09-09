import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// ======================================================
// LOAD .ENV FIRST
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

console.log("=================================");
console.log("🔐 ENVIRONMENT CHECK");
console.log(
  "MONGODB_URI exists:",
  Boolean(process.env.MONGODB_URI)
);
console.log("=================================");

// ======================================================
// DYNAMIC IMPORTS
// ======================================================

const { default: connectDB } =
  await import("./config/db.js");

const { default: Achievement } =
  await import("./models/Achievement.js");

// ======================================================
// ACHIEVEMENTS
// ======================================================

const achievements = [
  {
    name: "First Message",
    description:
      "Send your first private chat message.",
    icon: "💬",
    category: "chat",
    requirement: 1,
    points: 10,
    isActive: true,
  },

  {
    name: "Chat Starter",
    description:
      "Send 10 private chat messages.",
    icon: "🚀",
    category: "chat",
    requirement: 10,
    points: 25,
    isActive: true,
  },

  {
    name: "Community Starter",
    description:
      "Send your first message in the Community Lounge.",
    icon: "🌐",
    category: "community",
    requirement: 1,
    points: 10,
    isActive: true,
  },

  {
    name: "Community Voice",
    description:
      "Send 10 messages in the Community Lounge.",
    icon: "📢",
    category: "community",
    requirement: 10,
    points: 25,
    isActive: true,
  },

  {
    name: "Community Regular",
    description:
      "Send 50 messages in the Community Lounge.",
    icon: "🔥",
    category: "community",
    requirement: 50,
    points: 50,
    isActive: true,
  },

  {
    name: "Passport Created",
    description:
      "Complete your Project68 passport.",
    icon: "🪪",
    category: "passport",
    requirement: 1,
    points: 25,
    isActive: true,
  },

  {
    name: "Profile Complete",
    description:
      "Complete your Project68 profile.",
    icon: "👤",
    category: "social",
    requirement: 1,
    points: 20,
    isActive: true,
  },

  {
    name: "Social Explorer",
    description:
      "Interact with other Project68 users.",
    icon: "🤝",
    category: "social",
    requirement: 5,
    points: 30,
    isActive: true,
  },

  {
    name: "Project68 Member",
    description:
      "Become an active member of Project68.",
    icon: "⭐",
    category: "general",
    requirement: 1,
    points: 50,
    isActive: true,
  },

  {
    name: "Project68 Veteran",
    description:
      "Become one of the most active Project68 members.",
    icon: "🏆",
    category: "general",
    requirement: 100,
    points: 100,
    isActive: true,
  },
];

// ======================================================
// SEED
// ======================================================

async function seedAchievements() {
  try {
    console.log("=================================");
    console.log("🚀 Connecting to MongoDB...");
    console.log(
      "URI exists:",
      Boolean(process.env.MONGODB_URI)
    );
    console.log("=================================");

    await connectDB();

    console.log("=================================");
    console.log("🏆 Seeding achievements...");
    console.log("=================================");

    for (const achievementData of achievements) {
      const achievement =
        await Achievement.findOne({
          name: achievementData.name,
        });

      if (achievement) {
        achievement.description =
          achievementData.description;

        achievement.icon =
          achievementData.icon;

        achievement.category =
          achievementData.category;

        achievement.requirement =
          achievementData.requirement;

        achievement.points =
          achievementData.points;

        achievement.isActive =
          achievementData.isActive;

        await achievement.save();

        console.log(
          `🔄 Updated: ${achievementData.name}`
        );
      } else {
        await Achievement.create(
          achievementData
        );

        console.log(
          `✅ Created: ${achievementData.name}`
        );
      }
    }

    console.log("=================================");
    console.log(
      `🎉 Achievement seeding completed`
    );
    console.log(
      `🏆 Total achievements: ${achievements.length}`
    );
    console.log("=================================");

    await mongoose.connection.close();

    console.log(
      "🔌 MongoDB connection closed."
    );

    process.exit(0);
  } catch (error) {
    console.error("=================================");
    console.error(
      "❌ ACHIEVEMENT SEED ERROR"
    );
    console.error(
      "Error Name:",
      error.name
    );
    console.error(
      "Error Message:",
      error.message
    );
    console.error("=================================");

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

// ======================================================
// START
// ======================================================

seedAchievements();