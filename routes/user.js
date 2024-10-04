const express = require("express");

const router = express.Router();
const userController = require("../controllers/user");

router.post("/regiseter", userController.postRegiseter);
router.post("/login", userController.postLogin);

module.exports = router;
