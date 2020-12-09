const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const SocietyDetails = require("../models/SocietyDetails");

/**
 * @route       GET api/society/profile
 * @description Retreive society profile details
 * @access      Private (For Societies Only)
 */
router.get("/profile", auth, async (req, res) => {
  if (req.user.role !== "society") {
    res.status(400).json({ msg: "No authorisation" });
    return;
  }
  try {
    const society = await SocietyDetails.findOne({ userId: req.user.id });
    res.status(200).json(society);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/society/profile/:id
 * @description Retreive society profile details
 * @access      Private
 */
router.get("/profile/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const society = await SocietyDetails.findById(id);
    res.status(200).json(society);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

module.exports = router;
