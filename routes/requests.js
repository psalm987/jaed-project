const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const SocietyDetails = require("../models/SocietyDetails");
const Requests = require("../models/Requests");
const User = require("../models/User");

/**
 * @route       POST api/requests/elect
 * @description Request to Elect officials
 * @access      Private (For Societies only)
 */
router.post("/elect", auth, async (req, res) => {
  if (req.user.role !== "society") {
    res.status(400).json("This account cannot request an election");
    return;
  }
  try {
    const senderId = req.sender.id;
    const { membersList } = req.body;
    const request = new Requests({
      senderId: senderId,
      content: membersList,
      type: "Election",
    });
    await request.save();
    res.status(200).json({ msg: "Election request successful" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       POST api/requests/update
 * @description Request to Update Profile
 * @access      Private
 */
router.post("/update", auth, async (req, res) => {
  if (
    ![
      "society",
      "legal",
      "financial",
      "intauditor",
      "extauditor",
      "consultant",
    ].includes(req.user.role)
  ) {
    res.status(400).json("This account cannot request an update");
    return;
  }
  try {
    let RequestObj;
    let request;
    let type;
    switch (req.user.role) {
      case "society":
        if (req.body.name) RequestObj.name = req.body.name;
        if (req.body.regno) RequestObj.regno = req.body.regno;
        if (req.body.industry) RequestObj.industry = req.body.industry;
        if (req.body.address) RequestObj.address = req.body.address;
        if (req.body.roadStreet) RequestObj.roadStreet = req.body.roadStreet;
        if (req.body.lga) RequestObj.lga = req.body.lga;
        if (req.body.state) RequestObj.state = req.body.state;
        if (req.body.lastAudit) RequestObj.lastAudit = req.body.lastAudit;
        if (req.body.lastAuditYear)
          RequestObj.lastAuditYear = req.body.lastAuditYear;
        if (req.body.auditClass) RequestObj.auditClass = req.body.auditClass;
        if (req.body.paidUpShareCapital)
          RequestObj.paidUpShareCapital = req.body.paidUpShareCapital;
        if (req.body.membersList) RequestObj.membersList = req.body.membersList;
        if (req.body.files) RequestObj.files = req.body.files;
        type = "Society profile update";
        break;
      case "intauditor":
      case "extauditor":
        break;
      case "consultant":
        break;
      case "legal":
        break;
      case "financial":
        break;
      default:
        break;
    }
    request = new Requests({
      senderId: req.user.id,
      content: RequestObj,
      type,
    });
    await request.save();
  } catch (err) {}
});

/**
 * @route       GET api/requests
 * @description Get all requests
 * @access      Private
 */
router.get("/", auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    let requests;
    if (req.user.role !== "admin") {
      requests = await Requests.find();
    } else {
      requests = await Requests.find({ userId: req.user.id });
    }
    res.status(200).json(result);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests/edit/:id
 * @description Change requests status using their id
 * @access      Private
 */
router.post("/edit/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await Request.findById(id);
    if (!request) {
      res.status(400).json({ msg: "Reqest does not exist" });
      return;
    }
    if (
      req.user.id !== request.userId ||
      ["approved", "cancelled"].includes(request.status)
    ) {
      res.status(400).json({ msg: "No access" });
      return;
    }
    const content = { ...request.content, ...req.body };
    const status = "pending";
    await request.updateOne({ content, status });
    res.status(200).json(request);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests/status-change
 * @description Change requests status using their id
 * @access      Private (For Admin Only)
 */
router.post("/status-change", auth, async (req, res) => {
  const { id, status, comment } = req.body;
  if (req.user.role !== "admin" && status !== "cancelled") {
    res
      .status(400)
      .json({ msg: "This account is not athorized to change request status" });
    return;
  }
  try {
    const request = await Requests.findById(id);
    if (!request) {
      res.status(400).json({ msg: "Invalid request id" });
      return;
    }
    if (!["approved", "cancelled", "rejected"].includes(status)) {
      res.status(400).json({
        msg:
          "Status is not valid it can either be approved, cancelled or rejected",
      });
      return;
    }
    const StatusObj = {};
    StatusObj.status = status;
    if (comment && req.user.role === "admin") {
      StatusObj.comment = comment;
      StatusObj.dateCommented = Date.now();
    }
    await request.update(StatusObj);
    const society = await SocietyDetails.findOne({ userId: request.senderId });
    if (status === "approved" && req.user.role === "admin") {
      switch (request.type) {
        case "Society profile update":
          const {
            name,
            regno,
            industry,
            address,
            roadStreet,
            lga,
            state,
            lastAudit,
            lastAuditYear,
            auditClass,
            paidUpShareCapital,
            membersList,
            files,
          } = request.content;
          const UpdateObj = {};
          if (regno) {
            UpdateObj.regno = regno;
          } else if (req.body.regno) {
            UpdateObj.regno = req.body.regno;
          } else {
            req.status(400).json({ msg: "No registration number available" });
            return;
          }

          if (name) UpdateObj.name = name;
          if (industry) UpdateObj.industry = industry;
          if (address) UpdateObj.address = address;
          if (roadStreet) UpdateObj.roadStreet = roadStreet;
          if (lga) UpdateObj.lga = lga;
          if (state) UpdateObj.state = state;
          if (lastAudit) UpdateObj.lastAudit = lastAudit;
          if (lastAuditYear) UpdateObj.lastAuditYear = lastAuditYear;
          if (auditClass) UpdateObj.auditClass = auditClass;
          if (paidUpShareCapital)
            UpdateObj.paidUpShareCapital = paidUpShareCapital;
          if (membersList) UpdateObj.membersList = membersList;
          if (files) UpdateObj.files = files;
          if (!society.dateApproved) UpdateObj.dateApproved = Date.now();
          UpdateObj.dateUpdated = request.dateCreated;
          await society.update(UpdateObj);
          break;
        case "Members update":
          await society.update({
            membersList: request.content,
            dateUpdated: request.dateCreated,
          });
          break;
        case "Election":
          await society.update({
            membersList: request.content,
            lastElection: request.dateCreated,
          });
          break;
        default:
          res.status(400).json({ msg: "This approval was not handled" });
          return;
      }
    }
    res.status(200).json({ msg: "Request status change successful" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

module.exports = router;
