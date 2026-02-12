import Match from "../models/match.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateCompatibility from "../services/ai.service.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let githubData = null;

    if (user.githubLink) {
      const username = user.githubLink.split("github.com/")[1];

      if (username) {
        const response = await fetch(
          `https://api.github.com/users/${username}`,
        );
        githubData = await response.json();
      }
    }
    res.status(200).json({
      user,
      githubData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "bio",
      "skills",
      "experienceLevel",
      "availability",
      "githubLink",
      "avatar",
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidOperation) {
      return res.status(400).json({
        message: "Invalid updates detected",
      });
    }
    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");
    res.status(200).json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both passwords are required",
      });
    }
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Current password incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Password update error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//getting user feild
export const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({ message: "user not found!" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const matches = await Match.find({
      users: req.userId,
    });

    const matechedUserIds = matches.map((match) =>
      match.users.find((id) => id.toString() != req.userId),
    );

    const excludedUsers = [
      req.userId,
      ...currentUser.swipedLeft,
      ...currentUser.swipedRight,
      matechedUserIds,
    ];
    const feedUsers = await User.find({
      _id: { $nin: excludedUsers }, //“Find users whose ID is NOT IN this list.”
      isVerified: true,
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 }) // without this our pagination will work un predicatable
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users: feedUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//swipe user controller
export const swipeUser = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId || !action) {
      return res.status(400).json({
        message: "Target user and action required",
      });
    }
    if (!["right", "left"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action",
      });
    }
    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "Target user not found",
      });
    }

    if (action == "right") {
      const isMutual = targetUser.swipedRight.includes(req.userId);

      if (isMutual) {
        const existingMatch = await Match.findOne({
          users: { $all: [req.userId, targetUserId] },
        });

        if (!existingMatch) {
          const match = await Match.create({
            users: [req.userId, targetUserId],
          });

          const compatibility = await generateCompatibility(
            req.userId,
            targetUserId,
          );

          match.compatibilityScore = compatibility.score;
          match.compatibilitySummary = compatibility.summary;

          await match.save();
        }

        return res.status(200).json({
          message: "It's a match!",
          match: true,
        });
      }

      currentUser.swipedRight.push(targetUserId);
      await currentUser.save();

      return res.status(200).json({
        message: "Swiped right",
        match: false,
      });
    }

    if (action == "left") {
      currentUser.swipedLeft.push(targetUser);
      return res.status(200).json({
        message: "Swiped left",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//get match feild

export const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.userId,
    })
      .populate("users", "-password refreshToken")
      .sort({ createdAt: -1 });

    const fromattedMatches = matches.map((match) => {
      const otherUsers = match.find(
        (user) => user._id.toString() != req.userId,
      );

      return {
        matchId: match._id,
        user: otherUsers,
        compatibilityScore: match.compatibilityScore,
        compatibilitySummary: match.compatibilitySummary,
        createdAt: match.createdAt,
      };
    });
    res.status(200).json({
      count: fromattedMatches.length,
      matches: fromattedMatches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
