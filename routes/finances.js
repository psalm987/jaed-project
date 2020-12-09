const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Grants = require("../models/Grants");
const FinancialAid = require("../models/FinancialAid");

/**
 * @route       POST api/grant/create
 * @description Create a grant
 * @access      Public
 */
router.post(
  "/create",
  [
    auth,
    check("amount", "Please specify a valid amount"),
    check("description", "Please give a description for this grant"),
    check(
      "requirements",
      "Please specify the requirements for getting this grant"
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
      return;
    }
    if (req.user.role !== "financial") {
      res.status(400).json({ msg: "Not authorised" });
      return;
    }
    const {
      amount,
      description,
      requirements,
      locations,
      societyTypes,
    } = req.body;
    try {
      const GrantObj = {};
      if (amount) GrantObj.amount = amount;
      if (description) GrantObj.description = description;
      if (requirements) GrantObj.locations = locations;
      if (societyTypes) GrantObj.societyTypes = societyTypes;
      GrantObj.dateCreated = Date.now();
      GrantObj.ownerId = req.user.id;
      const grant = new Grants(GrantObj);
      await grant.save();

      res.status(200).json({ msg: "Grant created successfully" });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
      return;
    }
  }
);

module.exports = router;
