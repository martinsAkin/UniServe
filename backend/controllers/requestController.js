const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");
const logRequestActivity = require("../services/requestActivityService");
require("dotenv").config();



const createRequest = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description and location are required.",
      });
    }

    const newRequest = await Request.create({
      title,
      description,
      location,
      author: req.user._id,
    });

    await logRequestActivity({
      requestId: newRequest._id,
      actorId: req.user._id,
      action: "created",
      toStatus: newRequest.status,
      details: "Maintenance request submitted.",
    });

    return res.status(201).json({
      success: true,
      message: "Request created successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Create request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create request.",
    });
  }
};

const getRequests = async (req, res) => {
  try {
    let filter = { deletedAt: null };

    if (req.user.role === "studentOrstaff") {
      filter.author = req.user._id;
    } else if (req.user.role === "maintenanceOfficer") {
      filter.assignedOfficer = req.user._id;
    }

    const requests = await Request.find(filter)
      .populate("author", "username email")
      .populate("assignedOfficer", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve requests.",
    });
  }
};


const getRequestById = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      deletedAt: null,
    })
      .populate("author", "username email")
      .populate("assignedOfficer", "username email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    const isOwner =
      request.author._id.toString() === req.user._id.toString();

    const isAssignedOfficer =
      request.assignedOfficer &&
      request.assignedOfficer._id.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAssignedOfficer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this request.",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve request.",
    });
  }
};


const updateRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    // Only the request owner can edit details
    const isOwner =
      request.author.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the request owner can edit this request.",
      });
    }

    // Only active requests can be edited
    if (request.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active requests can be edited.",
      });
    }

    // Allow only these fields to be updated
    
    const allowedFields = ["title", "description", "location"];

    let hasChanges = false;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Ensure the value is a string
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        // Remove leading and trailing whitespace
        const value = req.body[field].trim();

        // Prevent empty values
        if (!value) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be empty.`,
          });
        }

        request[field] = value;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }


    await request.save();

    // Record the edit in activity history
    await logRequestActivity({
      requestId: request._id,
      actorId: req.user._id,
      action: "updated",
      details: "Maintenance request details updated.",
    });

    return res.status(200).json({
      success: true,
      message: "Request updated successfully.",
      request,
    });
  } catch (error) {
    console.error("Update request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update request.",
    });
  }
};


const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this request.",
      });
    }

    if (request.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancel the request before deleting it.",
      });
    }

    request.deletedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully.",
    });
  } catch (error) {
    console.error("Delete request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete request.",
    });
  }
};


const assignRequest = async (req, res) => {
  try {
    const { officerId } = req.body;
    const { id } = req.params;

    // 1. Validate request ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    // 2. Validate officer ID
    if (!mongoose.isValidObjectId(officerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance officer ID.",
      });
    }

    // 3. Find the maintenance request
    const request = await Request.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    // 4. Check request status
    if (["completed", "cancelled"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign a completed or cancelled request.",
      });
    }

    // 5. Find the proposed officer
    const officer = await User.findById(officerId);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Maintenance officer not found.",
      });
    }

    // 6. Confirm the user is a maintenance officer
    if (officer.role !== "maintenanceOfficer") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a maintenance officer.",
      });
    }

    // 7. Assign the officer
    const previousOfficer = request.assignedOfficer;
    request.assignedOfficer = officer._id;

    await request.save();

    // 8. Log the activity
    await logRequestActivity({
      requestId: request._id,
      actorId: req.user._id,
      action: previousOfficer ? "reassigned" : "assigned",
      details: previousOfficer
        ? `Request reassigned to ${officer.username}.`
        : `Request assigned to ${officer.username}.`,
      metadata: {
        previousOfficer: previousOfficer || null,
        newOfficer: officer._id,
      },
    });

    // 9. Return the updated request
    await request.populate([
      { path: "author", select: "username email" },
      { path: "assignedOfficer", select: "username email" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Maintenance officer assigned successfully.",
      request,
    });
  } catch (error) {
    console.error("Assign request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign maintenance officer.",
    });
  }
};



const updateRequestStatus = async (req, res) => {
  try {
    const { status, completionNote } = req.body;
    const { id } = req.params;

    // 1. Validate request ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    // 2. Validate status
    const allowedStatuses = [
      "active",
      "in-progress",
      "cancelled",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    // 3. Validate completion note
    if (status === "completed") {
      if (
        typeof completionNote !== "string" ||
        !completionNote.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Completion note is required.",
        });
      }

      if (completionNote.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Completion note cannot exceed 1000 characters.",
        });
      }
    } else if (completionNote !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Completion note can only be provided when completing a request.",
      });
    }

    // 4. Find request
    const request = await Request.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    // 5. Identify user permissions
    const userId = req.user._id.toString();

    const isOwner =
      request.author.toString() === userId;

    const isAssignedOfficer =
      request.assignedOfficer?.toString() === userId;

    const isAdmin = req.user.role === "admin";

    // 6. Define valid transitions
    const transitions = {
      active: ["in-progress", "cancelled"],
      "in-progress": ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!transitions[request.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${request.status} to ${status}.`,
      });
    }

    // 7. Check authorization
    if (status === "cancelled") {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only the request owner or admin can cancel.",
        });
      }
    } else {
      if (!isAssignedOfficer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned officer or admin can update progress.",
        });
      }
    }

    // 8. Update request
    const previousStatus = request.status;

    request.status = status;

    if (status === "completed") {
      request.completionNote = completionNote.trim();
    }

    await request.save();

    // Log activity after saving the request
    await logRequestActivity({
      requestId: request._id,
      actorId: req.user._id,
      action:
        status === "in-progress"
          ? "started"
          : status === "completed"
            ? "completed"
            : "cancelled",
      fromStatus: previousStatus,
      toStatus: status,
      details:
        status === "completed"
          ? completionNote.trim()
          : `Request status changed from ${previousStatus} to ${status}.`,
    });


    // 9. Populate related users
    await request.populate([
      { path: "author", select: "username email" },
      { path: "assignedOfficer", select: "username email" },
    ]);

    return res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`,
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update request status.",
    });
  }
};



module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  assignRequest,
  updateRequestStatus,
};
