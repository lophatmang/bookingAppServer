const User = require("../models/user");
const Transaction = require("../models/transaction");
const Hotel = require("../models/hotel");
const paginate = require("../utils/paging");
const Room = require("../models/room");

exports.postLoginAdmin = async (req, res, next) => {
  const user = req.body;

  const findUser = await User.findOne({ username: user.username });

  if (!findUser) {
    res.status(400).json({
      loginError: "Username hoặc password không đúng",
      error: "email",
    });
  } else {
    if (findUser.password !== user.password) {
      res.status(400).json({
        loginError: "Username hoặc password không đúng",
        error: "email",
      });
    } else if (findUser.isAdmin == false) {
      res.status(400).json({
        loginError: "Bạn không phải là Admin",
        error: "admin",
      });
    } else {
      res.status(200).json({
        loginSuccess: "Đăng nhập thành công",
        user: findUser,
      });
    }
  }
};
exports.getUser = async (req, res, next) => {
  const allUser = await User.find();

  const user = allUser.filter((e) => e.isAdmin == false);
  res.status(200).json(user);
};

exports.getTransaction = (req, res, next) => {
  Transaction.find()
    .populate("hotel")
    .then((transactions) => {
      res.status(200).json(transactions);
    });
};

exports.getOrder = (req, res, next) => {
  const page = req.query.page || 1;
  if (page == "all") {
    return Transaction.find()
      .populate("hotel userId")
      .then((transactions) => {
        res.status(200).json({
          results: transactions,
        });
      });
  }
  Transaction.find()
    .populate("hotel userId")
    .then((transactions) => {
      res.status(200).json({
        results: paginate(transactions, page, 8),
        page: page,
        total_pages: Math.ceil(transactions.length / 8),
      });
    });
};

exports.getUserList = async (req, res, next) => {
  const page = req.query.page || 1;
  const allUser = await User.find();

  const user = allUser.filter((e) => e.isAdmin == false);
  res.status(200).json({
    results: paginate(user, page, 8),
    page: page,
    total_pages: Math.ceil(user.length / 8),
  });
};

exports.postLockUser = (req, res, next) => {
  const user = req.body;

  User.findByIdAndUpdate(user.userId, { status: user.status }).then(() => {
    res.status(200).json({ message: `Đã khóa tài khoản` });
  });
};

exports.getHotel = async (req, res, next) => {
  const page = req.query.page || 1;
  const hotel = await Hotel.find();

  res.status(200).json({
    results: paginate(hotel, page, 8),
    page: page,
    total_pages: Math.ceil(hotel.length / 8),
  });
};
exports.postDeleteHotel = async (req, res, next) => {
  const hotelId = req.body.hotelId;
  const hotel = await Hotel.findById(hotelId);
  const transactions = await Transaction.find({
    status: { $in: ["Booked", "Checkin"] },
  });

  const check = transactions.find(
    (e) => e.hotel.toString() == hotel._id.toString()
  );
  if (!check) {
    Hotel.findByIdAndDelete(hotelId).then(() => {
      res.status(200).json({ message: "Xóa khách sạn thành công" });
    });
  } else {
    res
      .status(400)
      .json({ ErrorMessage: "Khách sạn đang được đặt không thể xóa" });
  }
};

exports.getRoom = (req, res, next) => {
  Room.find()
    .select("title")
    .then((rooms) => {
      res.status(200).json(rooms);
    });
};

exports.postHotel = async (req, res, next) => {
  const hotel = req.body.hotel;
  const edit = req.body.edit;
  const hotelId = req.body.hotelId;

  const rooms = await Room.find({ _id: { $in: hotel.rooms } });
  const cheapestPrice = rooms.sort((a, b) => a.price - b.price)[0].price;

  if (edit) {
    Hotel.findByIdAndUpdate(hotelId, {
      ...hotel,
      cheapestPrice: cheapestPrice,
    }).then(() => {
      res.status(200).json({ message: "Đã sửa hotel thành công" });
    });
  } else {
    const hotelNew = new Hotel({ ...hotel, cheapestPrice: cheapestPrice });
    hotelNew.save().then(() => {
      res.status(200).json({ message: "Thêm Hotel Thành Công" });
    });
  }
};

exports.getAllRoom = (req, res, next) => {
  const page = req.query.page || 1;
  Room.find().then((rooms) => {
    res.status(200).json({
      results: paginate(rooms, page, 8),
      page: page,
      total_pages: Math.ceil(rooms.length / 8),
    });
  });
};
exports.postDeleteRoom = async (req, res, next) => {
  const roomId = req.body.roomId;

  const transactions = await Transaction.find({
    status: { $in: ["Booked", "Checkin"] },
  });
  const allHotel = await Hotel.find().populate("rooms");
  const hotelbooked = [];
  allHotel.map((hotel) => {
    transactions.map((booked) => {
      if (booked.hotel.toString() === hotel._id.toString()) {
        hotelbooked.push(hotel);
      }
    });
  });
  hotelbooked
    .filter(
      (item, index) =>
        hotelbooked.findIndex(
          (e) => e._id.toString() === item._id.toString()
        ) === index
    )
    .map((hotel) => {
      transactions.map((booked) => {
        hotel.rooms.map((room) => {
          room.roomNumbers.map((roomNumber) => {
            booked.room.map((bookedNumber) => {
              if (bookedNumber == roomNumber) {
                const newRoom = room.roomNumbers.filter((e) => e == roomNumber);
                room.roomNumbers = newRoom;
              }
            });
          });
        });
      });
    });

  const findRoomBooked = hotelbooked.filter((hotel) =>
    hotel.rooms.find((e) => e._id.toString() == roomId.toString())
  );

  if (findRoomBooked.length > 0) {
    res.status(400).json({ ErrorMessage: "Phòng đang được đặt ko thể xóa" });
  } else {
    Room.findByIdAndDelete(roomId).then(() => {
      res.status(200).json({ message: "Xóa Phòng Thành Công" });
    });
  }
};

exports.postNewRoom = async (req, res, next) => {
  const room = req.body.room;
  const edit = req.body.edit;
  const roomId = req.body.roomId;

  const findroom = await Room.find();

  let check;
  findroom.map((e) =>
    e.roomNumbers.map((room) => {
      check = room.roomNumbers?.find((number) => number == room);
    })
  );

  if (edit) {
    Room.findByIdAndUpdate(roomId, {
      title: room.tilte,
      price: room.price,
      maxPeople: room.maxPeople,
      desc: room.desc,
      roomNumbers: room.roomNumbers,
    }).then(() => {
      res.status(200).json({ message: "Đã sửa Room Thành Công" });
    });
  } else {
    if (check) {
      res.status(200).json({
        errorMessage: `Số Phòng ${check} đã được tạo vui lòng đổi số phòng khác`,
      });
    } else {
      const addRoom = new Room({
        title: room.tilte,
        price: room.price,
        maxPeople: room.maxPeople,
        desc: room.desc,
        roomNumbers: room.roomNumbers,
      });
      addRoom
        .save()
        .then((room) => {
          return Hotel.findByIdAndUpdate(room.hotel, {
            $push: { rooms: room._id },
          });
        })
        .then(() => {
          res.status(200).json({ message: "Thêm Room Thành Công" });
        });
    }
  }
};

exports.getEditHotel = (req, res, next) => {
  const hotelId = req.query.id;
  Hotel.findById(hotelId).then((hotel) => {
    res.status(200).json(hotel);
  });
};

exports.getEditRoom = (req, res, next) => {
  const roomId = req.query.id;
  Room.findById(roomId).then((room) => {
    res.status(200).json(room);
  });
};
