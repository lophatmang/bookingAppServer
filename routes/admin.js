const express = require("express");

const router = express.Router();
const adminController = require("../controllers/admin");

router.post("/login", adminController.postLoginAdmin);

router.get("/user", adminController.getUser);
router.get("/transaction", adminController.getTransaction);

router.get("/order", adminController.getOrder);
router.get("/userList", adminController.getUserList);
router.post("/lockUser", adminController.postLockUser);

router.get("/hotel", adminController.getHotel);
router.post("/deleteHotel", adminController.postDeleteHotel);

router.get("/room", adminController.getRoom);
router.post("/hotel", adminController.postHotel);
router.get("/hotelEdit", adminController.getEditHotel);

router.get("/roomAll", adminController.getAllRoom);
router.post("/roomDelete", adminController.postDeleteRoom);
router.post("/addRoom", adminController.postNewRoom);
router.get("/editRoom", adminController.getEditRoom);

module.exports = router;
