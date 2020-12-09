const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Audits = require("../models/Audits");

/**
 * @route       GET api/audits
 * @description Get all users audits, returns only user specific requests for societies
 * @access      Private
 */
router.get("/", auth, async (req, res) => {
  if (req.body.filter && !(req.body.filter instanceof Map)) {
    res.status(400).json({ msg: "Filter parameter is not valid" });

    return;
  } else if (!req.body.filter) {
    req.body.filter = {};
  }

  try {
    let audits;
    if (req.user.role === "admin") {
      audits = await Audits.find(req.body.filter);
    } else if (req.user.role === "society") {
      audits = await Audits.find(
        merge(req.body.filter, { societyId: req.user.id })
      );
    } else {
      res
        .status(400)
        .json({ msg: "This account cannot retrieve audit information" });
      return;
    }
    res.status(200).json({ audits });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       POST api/audits
 * @description Create audit requests (done)
 * @access      Private
 */

router.post(
  "/",
  [
    auth,
    check("auditorId", "No auditor identification provided").exists(),
    check(
      "auditFilesUrl",
      "Please provide url link to files for auditing"
    ).exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());

      return;
    }
    try {
      let societyId;
      if (req.user.role === "society") {
        societyId = req.user.id;
      } else if (req.user.role === "admin") {
        societyId = req.body.societyId;
      } else {
        res
          .status(400)
          .json({ msg: "This account cannot create an audit request" });
        return;
      }
      const { auditorId, auditFilesUrl, comments } = req.body;
      const auditRequest = new Audits({
        societyId,
        auditorId,
        auditFilesUrl,
        comments,
      });
      await auditRequest.save();
      res.status(200).json({ msg: "Audit request created successfully" });

      return;
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server error" });
      return;
    }
  }
);

/**
 * @route       PATCH api/audits/:id
 * @description Update an audit
 * @access      Private
 */
router.patch("/:id", auth, async (req, res) => {
  if (req.user.role !== "society" || req.user.role !== "admin") {
    res.status(400).json({
      msg: "This account does not have permission to update this audit request",
    });
    return;
  }
  try {
    const id = req.params.id;
    const audit = await Audits.findById(id);
    if (!audit) {
      res.status(400).json({
        msg: "This audit request does not exist",
      });
      return;
    }

    await audit.update(req.body.audit);
    res.status(200).json({ msg: "Audit updated" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

module.exports = router;
