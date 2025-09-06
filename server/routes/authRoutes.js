const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { uploadSingle, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Name must be between 2 and 255 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("role")
    .isIn(["admin", "teacher", "student"])
    .withMessage("Role must be admin, teacher, or student"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.get("/logout", logout);
router.get("/profile", getProfile);
router.put(
  "/profile",
  uploadSingle("profilePicture"),
  handleMulterError,
  updateProfile
);
router.put(
  "/updatepassword",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
  ],
  updatePassword
);

module.exports = router;
