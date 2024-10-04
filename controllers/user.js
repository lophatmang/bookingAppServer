const User = require("../models/user");

exports.postRegiseter = async (req, res, next) => {
  const user = new User(req.body);

  const findUsername = await User.findOne({ username: req.body.username });
  const findEmail = await User.findOne({ email: req.body.email });
  const findPhoneNumber = await User.findOne({
    phoneNumber: req.body.phoneNumber,
  });

  if (findUsername)
    return res.status(400).json({
      regiseterError: "Username đã được tạo",
      error: "username",
    });
  if (findEmail)
    return res.status(400).json({
      regiseterError: "Email đã được tạo",
      error: "email",
    });
  if (findPhoneNumber)
    return res.status(400).json({
      regiseterError: "Phone Number đã được tạo",
      error: "phoneNumber",
    });

  return user
    .save()
    .then(() =>
      res.status(201).json({
        regiseterSuccess: "Tạo tài khoản thành công",
      })
    )
    .catch((err) => console.log(err));
};

exports.postLogin = async (req, res, next) => {
  const user = req.body;

  const findUser = await User.findOne({ email: user.email });

  if (!findUser) {
    res.status(400).json({
      loginError: "Email hoặc password không đúng",
      error: "email",
    });
  } else {
    if (findUser.password !== user.password) {
      res.status(400).json({
        loginError: "Email hoặc password không đúng",
        error: "email",
      });
    } else if (findUser.status == "Locked") {
      res.status(400).json({
        loginError: "Tài khoản của bạn đã bị khóa",
        error: "locked",
      });
    } else {
      res.status(200).json({
        loginSuccess: "Đăng nhập thành công",
        user: findUser,
      });
    }
  }
};
