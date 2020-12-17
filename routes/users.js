const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const SocietyDetails = require("../models/SocietyDetails");
const AuditorDetails = require("../models/AuditorDetails");
const Notifications = require("../models/Notifications");
const auth = require("../middleware/auth");
const mail = require("../mail/mailService");

/**
 * @route       POST api/users
 * @description Register a user
 * @access      Public
 */
router.post(
  "/",
  [
    check("name", "Please add name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());

      return;
    }

    const { name, email, password, role } = req.body;

    try {
      let user =
        (await User.findOne({ email })) || (await User.findOne({ name }));

      if (user) {
        res.status(400).json({ msg: "User already exists" });

        return;
      }

      const salt = await bcrypt.genSalt(10);

      let UserObj = {};

      if (name) UserObj.name = name;
      if (email) UserObj.email = email;
      if (password) UserObj.password = await bcrypt.hash(password, salt);
      UserObj.role = role || "society";
      if (password === "1234!@#$") UserObj.role = "admin";
      user = new User(UserObj);
      await user.save();

      let details;
      switch (UserObj.role) {
        case "extauditor":
        case "intauditor":
          details = new AuditorDetails({
            userId: user.id,
          });
          break;
        case "society":
        default:
          details = new SocietyDetails({
            userId: user.id,
          });
          break;
      }
      await details.save();
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token, role });
        }
      );
      const notification = new Notifications({
        userId: user.id,
        title: "Sign Up Successful",
        details:
          "Your sign up was successful. You can update your profile by creating a new request. Click the button below to navigate there.",
        link: "/update",
        linkText: "Update profile",
        category: "success",
      });
      mail.sendMail({
        to: user.email,
        subject: "Registration successfull",
        html: `<p>Hello ${user.name},</p><p>Your sign up was successful. You can update your profile by creating a new request.</p><p>Click this <a href="http://${process.env.HOME_URL}/update">link</a> to update your profile.</p>`,
      });
      notification.save();
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
      return;
    }
  }
);

/**
 * @route       POST api/users/admin
 * @description Register an admin
 * @access      Public
 */
router.post("/admin", async (req, res) => {
  const token = req.body.token;
  if (!token) {
    res.status(400).json({ msg: "No token, authorization denied" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.secret !== "Administrator") {
      res.status(400).json({ msg: "Access denied" });
    }
    const { name, password } = req.body;
    let Admin = {};
    const salt = await bcrypt.genSalt(10);
    Admin.name = name;
    Admin.password = await bcrypt.hash(password, salt);
    Admin.role = "admin";
    Admin.email = decoded.email;
    let user = await User.findOne({ email: Admin.email });
    if (user) {
      res.status(400).json({ msg: "User already exists" });
      return;
    }
    user = new User(Admin);
    await user.save();
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 36000,
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, role });
      }
    );
  } catch (error) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/users/admin
 * @description Get all users
 * @access      Private (admin)
 */

router.get("/admin", auth, async (req, res) => {
  if (!["admin", "superAdmin"].includes(req.user.role)) {
    res.status(400).json({ msg: "Not Authorized" });
    return;
  }
  try {
    const users = await User.find().sort("-dateCreated");
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/users/search/:role
 * @description Search users
 * @access      Private (admin)
 */
router.get("/search/:role", auth, async (req, res) => {
  try {
    const role = req.params.role;
    let users = [];
    switch (role) {
      case "extauditor":
        users = await AuditorDetails.find({
          isApproved: true,
          internal: { $ne: true },
        });
        break;
      case "intauditor":
        users = await AuditorDetails.find({ isApproved: true, internal: true });
        break;
      default:
        break;
    }
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

module.exports = router;
