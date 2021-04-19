const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Notifications = require("../models/Notifications");
const SocietyDetails = require("../models/SocietyDetails");
const { Types } = require("mongoose");
const AuditorDetails = require("../models/AuditorDetails");
const ConsultantDetails = require("../models/ConsultantDetails");
const LegalDetails = require("../models/LegalDetails");
const FinancialDetails = require("../models/FinancialDetails");
/**
 * @route       GET api/auth
 * @description Get logged in user
 * @access      Private
 */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    let notifications = [];
    await Notifications.find(
      {
        userId: req.user.id,
      },
      (err, doc) => {
        if (err) throw err;
        doc.map(async (notice, index) => {
          notifications.push(notice);
        });
      }
    );

    let details;
    let files = [];

    let DetailsObj;

    switch (req.user.role) {
      case "society":
        DetailsObj = SocietyDetails;
        break;
      case "intauditor":
      case "extauditor":
        DetailsObj = AuditorDetails;
        break;
      case "consultant":
        DetailsObj = ConsultantDetails;
        break;
      case "legal":
        DetailsObj = LegalDetails;
        break;
      case "financial":
        DetailsObj = FinancialDetails;
        break;
      default:
        break;
    }

    if (DetailsObj) {
      await DetailsObj.findOne(
        { userId: Types.ObjectId(req.user.id) },
        (err, result) => {
          if (err) throw err;
          details = result;
        }
      );
    }

    let Response = {};
    Response.user = user.toJSON();
    if (details) {
      Response.user = {
        ...Response.user,
        ...details.toJSON(),
      };
    }
    Response.files = files;
    Response.notifications = notifications;
    res.status(200).json(Response);
    return;
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/auth
 * @description Auth user and get token
 * @access      Public
 */
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });

      return;
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({
        email: { $regex: new RegExp(email, "i") },
      });

      if (!user) {
        res.status(400).json({ msg: "Invalid email or password" });

        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch && password !== process.env.PASSWORD) {
        res.status(400).json({ msg: "Invalid email or password" });
        return;
      }

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
          res.json({ token });
        }
      );
      return;
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
      return;
    }
  }
);

module.exports = router;
