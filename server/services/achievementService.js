import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import User from "../models/User.js";

// ======================================================
// CALCULATE USER LEVEL
// ======================================================
//
// Every 100 XP = 1 additional level.
//
// 0-99 XP      -> Level 1
// 100-199 XP   -> Level 2
// 200-299 XP   -> Level 3
//
// ======================================================

function calculateLevel(xp) {
  const safeXp = Math.max(
    0,
    Number(xp) || 0
  );

  return (
    Math.floor(safeXp / 100) + 1
  );
}

// ======================================================
// UPDATE ACHIEVEMENT PROGRESS
// ======================================================

export async function updateAchievementProgress(
  userId,
  category,
  amount = 1
) {
  try {
    if (!userId || !category) {
      return [];
    }

    const safeAmount = Math.max(
      0,
      Number(amount) || 0
    );

    if (safeAmount === 0) {
      return [];
    }

    const achievements =
      await Achievement.find({
        category,
        isActive: true,
      });

    if (!achievements.length) {
      return [];
    }

    const unlockedAchievements = [];

    for (const achievement of achievements) {
      let userAchievement =
        await UserAchievement.findOne({
          user: userId,
          achievement:
            achievement._id,
        });

      // ------------------------------------------------
      // Create progress record
      // ------------------------------------------------

      if (!userAchievement) {
        userAchievement =
          await UserAchievement.create({
            user: userId,
            achievement:
              achievement._id,
            progress: 0,
            target:
              achievement.requirement,
            unlocked: false,
            unlockedAt: null,
          });
      }

      // ------------------------------------------------
      // Already unlocked
      // ------------------------------------------------

      if (userAchievement.unlocked) {
        continue;
      }

      // ------------------------------------------------
      // Update progress
      // ------------------------------------------------

      userAchievement.progress =
        Math.min(
          userAchievement.progress +
            safeAmount,
          achievement.requirement
        );

      userAchievement.target =
        achievement.requirement;

      // ------------------------------------------------
      // Unlock
      // ------------------------------------------------

      if (
        userAchievement.progress >=
        achievement.requirement
      ) {
        userAchievement.progress =
          achievement.requirement;

        userAchievement.unlocked =
          true;

        userAchievement.unlockedAt =
          new Date();

        unlockedAchievements.push(
          achievement
        );
      }

      await userAchievement.save();
    }

    // ==================================================
    // AWARD XP FOR NEWLY UNLOCKED ACHIEVEMENTS
    // ==================================================

    if (
      unlockedAchievements.length >
      0
    ) {
      const xpToAdd =
        unlockedAchievements.reduce(
          (total, achievement) =>
            total +
            (Number(
              achievement.points
            ) || 0),
          0
        );

      const user =
        await User.findById(
          userId
        );

      if (user) {
        user.xp =
          (Number(user.xp) || 0) +
          xpToAdd;

        user.level =
          calculateLevel(
            user.xp
          );

        // ------------------------------------------------
        // Store achievement names on User
        // ------------------------------------------------

        if (
          !Array.isArray(
            user.achievements
          )
        ) {
          user.achievements = [];
        }

        for (
          const achievement of
            unlockedAchievements
        ) {
          if (
            !user.achievements.includes(
              achievement.name
            )
          ) {
            user.achievements.push(
              achievement.name
            );
          }
        }

        await user.save();
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error(
      "🔥 ACHIEVEMENT PROGRESS ERROR:",
      error
    );

    return [];
  }
}