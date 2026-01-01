const { body, validationResult } =require("express-validator");
const registerValidator = [
    body("username")
.notEmpty().withMessage("Name is required")
.trim()
.isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
body("email")
.notEmpty().withMessage("Email is required")
.isEmail().withMessage("Invalid email format")
.normalizeEmail(),
body("password")
.notEmpty().withMessage("Password is required")
.isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
.matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
.matches(/[0-9]/).withMessage("Password must contain at least one number")
.matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character")];
module.exports = registerValidator;