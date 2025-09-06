const { asyncHandler } = require("../middleware/error");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const { validationResult } = require("express-validator");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }

  const { name, email, password, role, additionalData } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create role-specific profile
  if (role === "student" && additionalData) {
    await Student.create({
      user: user._id,
      ...additionalData,
    });
  } else if (role === "teacher" && additionalData) {
    await Teacher.create({
      user: user._id,
      ...additionalData,
    });
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide an email and password",
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Update last login
  await user.updateLastLogin();

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      lastLogin: user.lastLogin,
    },
  });
});

// @desc    Log user out / clear session
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: {},
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  let userProfile = await User.findById(req.user.id);

  // Get role-specific data
  if (req.user.role === "student") {
    const studentData = await Student.findOne({ user: req.user.id }).populate(
      "user",
      "name email profilePicture"
    );
    userProfile = { ...userProfile.toObject(), studentData };
  } else if (req.user.role === "teacher") {
    const teacherData = await Teacher.findOne({ user: req.user.id }).populate(
      "user",
      "name email profilePicture"
    );
    userProfile = { ...userProfile.toObject(), teacherData };
  }

  res.status(200).json({
    success: true,
    data: userProfile,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  // Update role-specific data if provided
  if (req.body.additionalData) {
    if (req.user.role === "student") {
      await Student.findOneAndUpdate(
        { user: req.user.id },
        req.body.additionalData,
        { new: true, runValidators: true }
      );
    } else if (req.user.role === "teacher") {
      await Teacher.findOneAndUpdate(
        { user: req.user.id },
        req.body.additionalData,
        { new: true, runValidators: true }
      );
    }
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: "Password is incorrect",
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
