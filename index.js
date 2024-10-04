const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.yscz2.mongodb.net/booking`;

const userRouter = require("./routes/user");
const hotelRouter = require("./routes/hotel");
const adminRouter = require("./routes/admin");

app.use(cors(), bodyParser.json());

app.use(userRouter);
app.use("/hotel", hotelRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
  res.status(404).json({
    errorMessage: "Route not found",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => console.log(err));
