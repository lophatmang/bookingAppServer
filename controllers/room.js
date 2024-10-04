const Hotel = require("../models/hotel");
const Room = require("../models/room");
const Transaction = require("../models/transaction");

//tạo 1 list từ ngày này đến ngày kia
function getDates(startDate, stopDate) {
  Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  let dateArray = new Array();
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate.toISOString().slice(0, 10));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

exports.getRooms = async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const dateStart = req.query.dateStart;
  const dateEnd = req.query.dateEnd;
  const hotel = await Hotel.findById(hotelId);
  const rooms = await Room.find();
  const transactions = await Transaction.find({
    status: { $in: ["Booked", "Checkin"] },
  }).find({ hotel: hotelId });

  /// list ngay muon tim
  const searchDate = getDates(new Date(dateStart), new Date(dateEnd));

  //danh sach phong da bị book va ngay book
  const roomBooked = transactions
    .map((e) => {
      const arrDate = getDates(e.dateStart, e.dateEnd);
      return { rooms: e.room, allDate: arrDate };
    })
    .filter((e) =>
      e.allDate.find((date) => searchDate.find((search) => search == date))
    )
    .reduce((cur, room) => {
      return cur.concat(room.rooms);
    }, []);

  const roomList = rooms.filter((e) =>
    hotel.rooms.find((hotel) => hotel.toString() == e._id.toString())
  );


  res.status(200).json({
    roomList: roomList,
    roomBooked: roomBooked,
    days: searchDate.length,
  });
};

exports.postAddTransaction = (req, res, next) => {
  const newTransaction = new Transaction(req.body);
  newTransaction.save();
};

exports.getTransaction = (req, res, next) => {
  const userId = req.params.userId;
  // const user = await User.findById("66eb2a12eb9c64868346bcf8");
  Transaction.find({ userId })
    .populate("hotel")
    .then((transactions) => {
      res.status(200).json(transactions);
    });
};


exports.postSearchRoom = async (req, res, next) => {
  const dateStart = req.body.dateStart;
  const dateEnd = req.body.dateEnd;
  const city = req.body.city;
  const adult = req.body.adult;
  const quantityRoom = req.body.room;
  const transactions = await Transaction.find({
    status: { $in: ["Booked", "Checkin"] },
  });
  const allHotel = await Hotel.find().populate("rooms");
  const allHotel2 = await Hotel.find().populate("rooms");
  /// list ngay muon tim
  const searchDate = getDates(new Date(dateStart), new Date(dateEnd));

  //danh sach phong da bị book va ngay book
  const roomBooked = transactions
    .map((e) => {
      const arrDate = getDates(e.dateStart, e.dateEnd);
      return { rooms: e, allDate: arrDate };
    })
    .filter((e) =>
      e.allDate.find((date) => searchDate.find((search) => search == date))
    )
    .map(({ rooms }) => {
      return rooms;
    });

  const hotelbooked = [];

  allHotel.map((hotel) => {
    roomBooked.map((booked) => {
      if (booked.hotel.toString() === hotel._id.toString()) {
        hotelbooked.push(hotel);
      }
    });
  });

  const hotelUnbooked = allHotel2.filter((e) => {
    const check = hotelbooked.find(
      (hotel) => hotel._id.toString() == e._id.toString()
    );
    if (!check) return true;
    return false;
  });

  hotelbooked
    .filter(
      (item, index) =>
        hotelbooked.findIndex(
          (e) => e._id.toString() === item._id.toString()
        ) === index
    )
    .map((hotel) => {
      roomBooked.map((booked) => {
        hotel.rooms.map((room) => {
          room.roomNumbers.map((roomNumber) => {
            booked.room.map((bookedNumber) => {
              if (bookedNumber == roomNumber) {
                const newRoom = room.roomNumbers.filter(
                  (e) => e !== roomNumber
                );
                room.roomNumbers = newRoom;
              }
            });
          });
        });
      });
    });

  const hotelAvb = hotelbooked
    .filter(
      (item, index) =>
        hotelbooked.findIndex((e) => e._id === item._id) === index
    )
    .concat(hotelUnbooked)
    .filter((e) => (city == "" ? true : e.city == city))
    .filter((e) => {
      const quantity = e.rooms.reduce(
        (cur, e) => cur.concat(e.roomNumbers),
        []
      );
      if (quantity.length < Number(quantityRoom)) return false;
      return true;
    })
    .filter((e) => {
      const check = e.rooms.reduce((cur, room) => {
        if (room.maxPeople < Number(adult)) return false;
        return true;
      }, false);
      return check;
    });

  res.status(200).json({
    hotelAvb: hotelAvb,
    roomBooked: roomBooked,
    days: searchDate.length,
  });
};
