
const mongoose = require("mongoose");
const Request = require("../models/Request");
const RequestActivity = require("../models/RequestActivity");

const getRequestHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    const history = await RequestActivity.find({
      request: id,
    })
      .populate("actor", "username email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Request history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve request history.",
    });
  }
};

module.exports = {
  getRequestHistory,
};
