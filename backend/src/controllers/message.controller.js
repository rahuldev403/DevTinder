import Match from "../models/match.model.js";
import Messages from "../models/message.model.js";

export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const isParticipant = match.users.some(
      (userId) => userId.toString() === req.userId,
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized for this chat",
      });
    }

    const messages = await Messages.find({ matchId }).sort({ createdAt: 1 });

    res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
