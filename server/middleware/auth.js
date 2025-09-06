const User = require("../models/User");

// Simple session-based authentication
exports.protect = async (req, res, next) => {
  // For now, we'll use a simple user ID in headers
  // In a real app, you might use sessions or cookies
  const userId = req.headers["user-id"];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please provide user-id in headers to access this route",
    });
  }

  try {
    // Get user from database
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found with this ID",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid user ID format",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Optional authentication - doesn't require user ID but populates user if present
exports.optionalAuth = async (req, res, next) => {
  const userId = req.headers["user-id"];

  if (userId) {
    try {
      const user = await User.findById(userId).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Invalid user ID, but we continue without user
      req.user = null;
    }
  }

  next();
};

// Check if user owns the resource or is admin
exports.ownerOrAdmin = (resourceOwnerField = "user") => {
  return (req, res, next) => {
    if (req.user.role === "admin") {
      return next();
    }

    // For routes where we need to check ownership after getting the resource
    if (req.resource && req.resource[resourceOwnerField]) {
      if (
        req.resource[resourceOwnerField].toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this resource",
        });
      }
    }

    next();
  };
};
