const express = require("express");
const router = express.Router();
const authService = require("../services/passwordService");

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.initiatePasswordReset(email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await authService.resetPassword(email, code, newPassword);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
});

module.exports = router;