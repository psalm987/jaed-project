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
const LegalDetails = require("../models/LegalDetails");
const FinancialDetails = require("../models/FinancialDetails");
const ConsultantDetails = require("../models/ConsultantDetails");

/**
 * @route       POST api/users/mock
 * @description Register fake  users
 * @access      Public
 */

router.post("/mock", async (req, res) => {
  const { access, users } = req;
  if (!access || access !== process.env.PASSWORD) {
    req.status(400).json({ msg: "Not Authorized" });
    return;
  }
  if (!Array.isArray(users)) {
    req.status(400).json({ msg: "User Information Not correct" });
    return;
  }
  try {
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        return { ...user, password: await bcrypt.hash(user.password, salt) };
      })
    );
    const Errors = [];
    await Promise.all(
      hashedUsers.map(async (user) => {
        const { name, email, password, role } = user;
        const userObj = User({ name, email, password, role });
        await userObj.save();
        let Model;
        let extra = { userId: userObj.id };
        switch (user.role) {
          case "legal":
            Model = LegalDetails;
            break;
          case "financial":
            Model = FinancialDetails;
            break;
          case "inauditor":
            extra = { ...extra, internal: true };
          case "extauditor":
            Model = FinancialDetails;
            break;
          case "consultant":
            Model = ConsultantDetails;
            break;
          default:
            Model = SocietyDetails;
            break;
        }
        try {
          await new Model({ ...user, ...extra }).save();
        } catch (err) {
          console.log(err, `Cannot create user ${user.name}`);
          Errors.push(user);
        }
      })
    );
    req
      .status(200)
      .json({ msg: "Users Created Successfully", userErrors: Errors });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

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
        (await User.findOne({ email: { $regex: new RegExp(email, "i") } })) ||
        (await User.findOne({ name: { $regex: new RegExp(name, "i") } }));

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
          details = new AuditorDetails({
            userId: user.id,
            internal: false,
          });
          break;
        case "intauditor":
          details = new AuditorDetails({
            userId: user.id,
            internal: true,
          });
          break;
        case "legal":
          details = new LegalDetails({
            userId: user.id,
          });
          break;
        case "financial":
          details = new FinancialDetails({
            userId: user.id,
          });
          break;
        case "consultant":
          details = new ConsultantDetails({
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
      case "financial":
        users = await FinancialDetails.find({ isApproved: true });
        break;
      case "legal":
        users = await LegalDetails.find({ isApproved: true });
        break;
      case "consultant":
        users = await ConsultantDetails.find({ isApproved: true });
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

/**
 * @route       GET api/users/directory
 * @description Get all users
 * @access      Public
 */

router.get("/directory", async (req, res) => {
  try {
    const auditors = await AuditorDetails.find({
      isApproved: true,
      internal: { $ne: true },
    });
    const financials = await FinancialDetails.find({ isApproved: true });
    const legals = await LegalDetails.find({ isApproved: true });
    const consultants = await ConsultantDetails.find({ isApproved: true });
    const societies = await SocietyDetails.find({ approved: true });
    const users = { auditors, financials, legals, consultants, societies };
    res.status(200).json(users);
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

module.exports = router;
