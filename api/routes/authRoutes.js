const express = require('express');
const router = express.Router();
const {
  login,
  changePassword,
  forgotPassword,
  logout,
  verifyToken
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const {
  validateLogin,
  validatePasswordChange,
  validatePasswordReset
} = require('../middlewares/validation');

router.post('/Login', validateLogin, login);
router.put('/ChangePassword', authenticateToken, validatePasswordChange, changePassword);
router.put('/Forgotpassword', validatePasswordReset, forgotPassword);
router.post('/logout', authenticateToken, logout);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
