const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");


const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      search,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const filter = {};

    // Filter by role
    const allowedRoles = [
      "studentOrstaff",
      "maintenanceOfficer",
      "admin",
    ];

    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter.",
        });
      }

      filter.role = role;
    }

    // Filter by account status
    if (status === "active") {
      filter.isActive = { $ne: false };
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status filter.",
      });
    }

    // Search username or email
    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { username: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("username email role isActive createdAt")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        totalUsers,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalUsers / pageSize),
      },
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users.",
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "username email role isActive createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let requests = [];

    // Maintenance officer: requests assigned to them
    if (user.role === "maintenanceOfficer") {
      requests = await Request.find({
        assignedOfficer: user._id,
        deletedAt: null,
      })
        .select(
          "title description location date status completionNote author assignedOfficer createdAt updatedAt"
        )
        .populate("author", "username email")
        .sort({ createdAt: -1 });
    }

    // Student/staff: requests created by them
    else if (user.role === "studentOrstaff") {
      requests = await Request.find({
        author: user._id,
        deletedAt: null,
      })
        .select(
          "title description location date status completionNote author assignedOfficer createdAt updatedAt"
        )
        .populate("assignedOfficer", "username email")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      user,
      requests,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user.",
    });
  }
};



const getDashboardStats = async (req, res) => {
  try {
    const match = {
      deletedAt: null,
    };

    const [statusStats, totalUsers, totalOfficers, recentRequests] =
      await Promise.all([
        Request.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

      User.countDocuments(),

      User.countDocuments({
        role: "maintenanceOfficer",
      }),

      Request.find(match)
        .populate("author", "username")
        .populate("assignedOfficer", "username")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title location status createdAt"),
    ]);

    // Convert aggregation output into a usable object
    const counts = {
      active: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    };

    statusStats.forEach((item) => {
      counts[item._id] = item.count;
    });

    const totalRequests = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        activeRequests: counts.active,
        inProgressRequests: counts["in-progress"],
        completedRequests: counts.completed,
        cancelledRequests: counts.cancelled,
        totalUsers,
        totalOfficers,
      },
      recentRequests,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve dashboard statistics.",
    });
  }
};

const getOfficerWorkload = async (req, res) => {
  try {
    const workload = await Request.aggregate([
      {
        $match: {
          deletedAt: null,
          assignedOfficer: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedOfficer",
          totalAssigned: { $sum: 1 },

          active: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },

          inProgress: {
            $sum: {
              $cond: [
                { $eq: ["$status", "in-progress"] },
                1,
                0,
              ],
            },
          },

          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },

          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer",
        },
      },
      {
        $unwind: "$officer",
      },
      {
        $project: {
          _id: 0,
          officerId: "$officer._id",
          username: "$officer.username",
          email: "$officer.email",
          totalAssigned: 1,
          active: 1,
          inProgress: 1,
          completed: 1,
          cancelled: 1,
        },
      },
      {
        $sort: {
          inProgress: -1,
          totalAssigned: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: workload.length,
      workload,
    });
  } catch (error) {
    console.error("Officer workload error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve officer workload.",
    });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const {
      status,
      officerId,
      authorId,
      search,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    // Validate pagination
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    // Build MongoDB filter
    const filter = {
      deletedAt: null,
    };

    const allowedStatuses = [
      "active",
      "in-progress",
      "completed",
      "cancelled",
    ];

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter.",
        });
      }

      filter.status = status;
    }

    if (officerId) {
      if (!mongoose.isValidObjectId(officerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid officer ID.",
        });
      }

      filter.assignedOfficer = officerId;
    }

    if (authorId) {
      if (!mongoose.isValidObjectId(authorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid author ID.",
        });
      }

      filter.author = authorId;
    }

    // Search request title or location
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const sortOrder = sort === "oldest" ? 1 : -1;

    const [requests, totalRequests] = await Promise.all([
      Request.find(filter)
        .populate("author", "username email")
        .populate("assignedOfficer", "username email")
        .sort({ createdAt: sortOrder })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),

      Request.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        totalRequests,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRequests / pageSize),
      },
      requests,
    });
  } catch (error) {
    console.error("Admin request monitoring error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve maintenance requests.",
    });
  }
};

const getAdminRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await Request.findOne({
      _id: id,
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

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Admin request details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve request.",
    });
  }
};


const getRequestReport = async (req, res) => {
  try {
    const { startDate, endDate, format = "json" } = req.query;

    // Validate report format
    if (!["json", "csv"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report format. Use json or csv.",
      });
    }

    // Validate date format and actual calendar date
    const parseDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return null;
      }

      return date;
    };

    const filter = {
      deletedAt: null,
    };

    let parsedStartDate = null;
    let parsedEndDate = null;

    if (startDate) {
      parsedStartDate = parseDate(startDate);

      if (!parsedStartDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate. Use YYYY-MM-DD.",
        });
      }

      filter.createdAt = {
        ...filter.createdAt,
        $gte: parsedStartDate,
      };
    }

    if (endDate) {
      parsedEndDate = parseDate(endDate);

      if (!parsedEndDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate. Use YYYY-MM-DD.",
        });
      }

      // Add one day so the entire end date is included
      const exclusiveEndDate = new Date(parsedEndDate);
      exclusiveEndDate.setUTCDate(
        exclusiveEndDate.getUTCDate() + 1
      );

      filter.createdAt = {
        ...filter.createdAt,
        $lt: exclusiveEndDate,
      };
    }

    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedStartDate > parsedEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate.",
      });
    }

    // Retrieve matching requests
    const requests = await Request.find(filter)
      .populate("author", "username email")
      .populate("assignedOfficer", "username email")
      .sort({ createdAt: -1 })
      .lean();

    // Initialise status counts so missing statuses return zero
    const statusBreakdown = {
      active: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    };

    const officerMap = {};
    const dailyMap = {};

    requests.forEach((request) => {
      // Group requests by status
      statusBreakdown[request.status] =
        (statusBreakdown[request.status] || 0) + 1;

      // Group requests by assigned officer
      const officerId = request.assignedOfficer?._id?.toString()
        || "unassigned";

      if (!officerMap[officerId]) {
        officerMap[officerId] = {
          officerId:
            request.assignedOfficer?._id || null,
          username:
            request.assignedOfficer?.username || "Unassigned",
          email:
            request.assignedOfficer?.email || null,
          totalAssigned: 0,
          active: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      const officer = officerMap[officerId];

      officer.totalAssigned += 1;

      if (request.status === "active") officer.active += 1;
      if (request.status === "in-progress") officer.inProgress += 1;
      if (request.status === "completed") officer.completed += 1;
      if (request.status === "cancelled") officer.cancelled += 1;

      // Group requests by creation date (UTC)
      const date = request.createdAt
        ? new Date(request.createdAt).toISOString().slice(0, 10)
        : "Unknown";

      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });

    const report = {
      success: true,
      generatedAt: new Date(),
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      summary: {
        totalRequests: requests.length,
        activeRequests: statusBreakdown.active,
        inProgressRequests: statusBreakdown["in-progress"],
        completedRequests: statusBreakdown.completed,
        cancelledRequests: statusBreakdown.cancelled,
      },
      statusBreakdown,
      officerBreakdown: Object.values(officerMap).sort(
        (a, b) => b.totalAssigned - a.totalAssigned
      ),
      dailyBreakdown: Object.entries(dailyMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      requests,
    };

    // Return JSON report
    if (format === "json") {
      return res.status(200).json(report);
    }

    // CSV helpers
    const escapeCsv = (value) => {
      let safeValue = value == null ? "" : String(value);

      // Prevent spreadsheet formula injection
      if (/^[\s]*[=+\-@]/.test(safeValue)) {
        safeValue = `'${safeValue}`;
      }

      return `"${safeValue.replace(/"/g, '""')}"`;
    };

    const csvHeaders = [
      "Request ID",
      "Title",
      "Description",
      "Location",
      "Requester",
      "Requester Email",
      "Assigned Officer",
      "Officer Email",
      "Status",
      "Completion Note",
      "Created At",
    ];

    const csvRows = requests.map((request) => [
      request._id,
      request.title,
      request.description,
      request.location,
      request.author?.username || "Unknown",
      request.author?.email || "",
      request.assignedOfficer?.username || "Unassigned",
      request.assignedOfficer?.email || "",
      request.status,
      request.completionNote || "",
      request.createdAt
        ? new Date(request.createdAt).toISOString()
        : "",
    ]);

    const csvContent = [
      csvHeaders.map(escapeCsv).join(","),
      ...csvRows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const filename = `uniserve-request-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Request report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate request report.",
    });
  }
};



module.exports = {
    getAllUsers,
    getUserById,
    getDashboardStats,
    getOfficerWorkload,
    getAllRequests,
    getAdminRequestById,
    getRequestReport,
};
