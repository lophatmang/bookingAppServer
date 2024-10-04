const Hotel = require("../models/hotel");

exports.GetCity = async (req, res, next) => {
  const hotel = await Hotel.find();
  const hotelCitys = await Hotel.find().select("city -_id");

  const city = hotelCitys
    .filter(
      (item, index) =>
        hotelCitys.findIndex((e) => e.city === item.city) === index
    )
    .map((e) => {
      return {
        name: e.city,
        subText: hotel.filter((hotel) => hotel.city == e.city).length,
      };
    });

  res.status(200).json(city);
};

exports.getTypeHotel = async (req, res, next) => {
  const hotel = await Hotel.find();

  res.status(200).json([
    {
      name: "Hotels",
      count: hotel.filter((e) => e.type == "hotel").length,
      image: "./images/type_1.webp",
    },
    {
      name: "Apartments",
      count: hotel.filter((e) => e.type == "apartments").length,
      image: "./images/type_2.jpg",
    },
    {
      name: "Resorts",
      count: hotel.filter((e) => e.type == "resorts").length,
      image: "./images/type_3.jpg",
    },
    {
      name: "Villas",
      count: hotel.filter((e) => e.type == "villas").length,
      image: "./images/type_4.jpg",
    },
    {
      name: "Cabins",
      count: hotel.filter((e) => e.type == "cabins").length,
      image: "./images/type_5.jpg",
    },
  ]);
};

exports.getTopRate = async (req, res, next) => {
  const hotel = await Hotel.find();

  const topRate = hotel.sort((a, b) => b.rating - a.rating);

  res.status(200).json(topRate);
};
exports.getDetaiHotel = async (req, res, next) => {
  const hoteId = req.params.hotelId;
  const hotel = await Hotel.findById(hoteId);

  res.status(200).json(hotel);
};
