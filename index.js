const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

const userRouter = require("./routes/user");
const hotelRouter = require("./routes/hotel");
const adminRouter = require('./routes/admin')

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
  .connect(
    "mongodb+srv://nhoktaha:thanh123@cluster0.yscz2.mongodb.net/booking?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
