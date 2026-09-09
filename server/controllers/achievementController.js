import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";

// ======================================================
// GET ALL ACHIEVEMENTS + CURRENT USER PROGRESS
// ======================================================

export const getAchievements = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id;

    // --------------------------------------------------
    // Load active achievement definitions
    // --------------------------------------------------

    const achievements =
      await Achievement.find({
        isActive:
          true,
      })
        .sort({
          points:
            1,

          createdAt:
            1,
        })
        .lean();

    // --------------------------------------------------
    // Load this user's progress
    // --------------------------------------------------

    const userAchievements =
      await UserAchievement.find({
        user:
          userId,
      })
        .lean();

    // --------------------------------------------------
    // Create fast lookup
    // --------------------------------------------------

    const progressMap =
      new Map();

    for (
      const item of
        userAchievements
    ) {
      progressMap.set(
        item.achievement.toString(),
        item
      );
    }

    // --------------------------------------------------
    // Merge definition + progress
    // --------------------------------------------------

    const safeAchievements =
      achievements.map(
        (
          achievement
        ) => {
          const userAchievement =
            progressMap.get(
              achievement._id.toString()
            );

          return {
            _id:
              achievement._id,

            name:
              achievement.name,

            description:
              achievement.description,

            icon:
              achievement.icon,

            category:
              achievement.category,

            requirement:
              achievement.requirement,

            points:
              achievement.points,

            progress:
              userAchievement?.progress ??
              0,

            target:
              userAchievement?.target ??
              achievement.requirement,

            unlocked:
              Boolean(
                userAchievement?.unlocked
              ),

            unlockedAt:
              userAchievement?.unlockedAt ??
              null,

            isActive:
              achievement.isActive,

            createdAt:
              achievement.createdAt,

            updatedAt:
              achievement.updatedAt,
          };
        }
      );

    return res.status(200).json({
      success:
        true,

      count:
        safeAchievements.length,

      achievements:
        safeAchievements,
    });
  } catch (error) {
    console.error(
      "GET ACHIEVEMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success:
        false,

      message:
        "Unable to load achievements",
    });
  }
};

// ======================================================
// GET ONE ACHIEVEMENT + CURRENT USER PROGRESS
// ======================================================

export const getAchievementById =
  async (
    req,
    res
  ) => {
    try {
      const {
        achievementId,
      } = req.params;

      const achievement =
        await Achievement.findOne({
          _id:
            achievementId,

          isActive:
            true,
        }).lean();

      if (
        !achievement
      ) {
        return res.status(404).json({
          success:
            false,

          message:
            "Achievement not found",
        });
      }

      const userAchievement =
        await UserAchievement.findOne(
          {
            user:
              req.user._id,

            achievement:
              achievement._id,
          }
        ).lean();

      return res.status(200).json({
        success:
          true,

        achievement: {
          _id:
            achievement._id,

          name:
            achievement.name,

          description:
            achievement.description,

          icon:
            achievement.icon,

          category:
            achievement.category,

          requirement:
            achievement.requirement,

          points:
            achievement.points,

          progress:
            userAchievement?.progress ??
            0,

          target:
            userAchievement?.target ??
            achievement.requirement,

          unlocked:
            Boolean(
              userAchievement?.unlocked
            ),

          unlockedAt:
            userAchievement?.unlockedAt ??
            null,

          isActive:
            achievement.isActive,

          createdAt:
            achievement.createdAt,

          updatedAt:
            achievement.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "GET ACHIEVEMENT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load achievement",
      });
    }
  };