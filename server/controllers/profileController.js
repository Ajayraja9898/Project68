import User from "../models/User.js";

// ==========================================
// Get My Profile / Passport
// ==========================================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "_id name rollNumber avatar bio department year xp level streak achievements"
    );

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
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};