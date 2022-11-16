const express = require('express');
const router = express.Router();
const registration_controller = require('../controllers/auth_account');

router.post("/register", registration_controller.addAccount);
router.post("/login", registration_controller.loginAccount);
router.get("/updateForm/:email", registration_controller.updateForm);
router.post("/updateUser", registration_controller.updateUser);
router.get("/updateUser/:email", registration_controller.deleteUser);
router.get("/logout", registration_controller.logoutAccount)

module.exports = router;

