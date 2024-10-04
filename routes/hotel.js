const express = require("express");

const router = express.Router();

const hotelController = require("../controllers/hotel");
const roomController = require("../controllers/room");

router.get("/city", hotelController.GetCity);
router.get("/type-hotel", hotelController.getTypeHotel);
router.get("/top-rate", hotelController.getTopRate);
router.get("/detail/:hotelId", hotelController.getDetaiHotel);
router.get("/room/:hotelId", roomController.getRooms);
router.post("/transaction", roomController.postAddTransaction);
router.get("/transaction/:userId", roomController.getTransaction);
router.post("/roomSearch", roomController.postSearchRoom);

module.exports = router;
