const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const SocietyDetails = require("../models/SocietyDetails");
const Requests = require("../models/Requests");
const User = require("../models/User");
const { Types } = require("mongoose");
const Forms = require("../models/Forms");
const Comments = require("../models/Comments");
const AuditorDetails = require("../models/AuditorDetails");
const LegalDetails = require("../models/LegalDetails");
const ConsultantDetails = require("../models/ConsultantDetails");
const FinancialDetails = require("../models/FinancialDetails");

/**
 * @route       GET api/requests/sent
 * @description Get all requests
 * @access      Private
 */
router.get("/sent", auth, async (req, res) => {
  try {
    let query;
    if (["admin", "superAdmin"].includes(req.user.role)) {
      query = { toAdmin: true };
    } else {
      query = {
        senderId: Types.ObjectId(req.user.id),
      };
    }
    const requests = await Requests.find(query)
      .populate("senderId", "name _id")
      .select("_id title description status dateCreated senderId")
      .sort("-dateCreated");
    res.status(200).json(requests);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       GET api/requests/audits
 * @description Change requests status using their id
 * @access      Private (For Admin Only)
 */
router.get("/audits", auth, async (req, res) => {
  try {
    console.log("Get Audits");
    const requests = await Requests.find({
      senderId: Types.ObjectId(req.user.id),
      receiverId: { $exists: true },
    })
      .populate({
        path: "receiverId",
        match: {
          role: "extauditor",
        },
      })
      .sort("-dateCreated");
    console.log("audits", requests);
    res
      .status(200)
      .json(
        requests.filter((val) => val && val.receiverId && val.receiverId.role)
      );
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/requests/legal
 * @description Change requests status using their id
 * @access      Private (For Admin Only)
 */
router.get("/legal", auth, async (req, res) => {
  try {
    console.log("Get Legal");
    const requests = await Requests.find({
      senderId: Types.ObjectId(req.user.id),
      receiverId: { $exists: true },
    })
      .populate({
        path: "receiverId",
        match: {
          role: "legal",
        },
      })
      .sort("-dateCreated");
    console.log("Legal", requests);
    res
      .status(200)
      .json(
        requests.filter((val) => val && val.receiverId && val.receiverId.role)
      );
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/requests/consultants
 * @description Change requests status using their id
 * @access      Private (For Admin Only)
 */
router.get("/consultants", auth, async (req, res) => {
  try {
    console.log("Get Consultants");
    const requests = await Requests.find({
      senderId: Types.ObjectId(req.user.id),
      receiverId: { $exists: true },
    })
      .populate({
        path: "receiverId",
        match: {
          role: "consultant",
        },
      })
      .sort("-dateCreated");
    res
      .status(200)
      .json(
        requests.filter((val) => val && val.receiverId && val.receiverId.role)
      );
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/requests/financials
 * @description Change requests status using their id
 * @access      Private (For Admin Only)
 */
router.get("/financials", auth, async (req, res) => {
  try {
    console.log("Get Financials");
    const requests = await Requests.find({
      senderId: Types.ObjectId(req.user.id),
      receiverId: { $exists: true },
    })
      .populate({
        path: "receiverId",
        match: {
          role: "financial",
        },
      })
      .sort("-dateCreated");

    res
      .status(200)
      .json(
        requests.filter((val) => val && val.receiverId && val.receiverId.role)
      );
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/requests/prof
 * @description Retrieve all requests for this profile
 * @access      Private
 */
router.get("/prof", auth, async (req, res) => {
  try {
    const sent = await Requests.find({
      senderId: Types.ObjectId(req.user.id),
    }).sort("-dateCreated");

    const received = await Requests.find({
      receiverId: Types.ObjectId(req.user.id),
    })
      .populate("senderId")
      .sort("-dateCreated");

    res.status(200).json({ sent, received });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

/**
 * @route       GET api/requests/:id
 * @description Get single request
 * @access      Private
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const request = await Requests.findById(req.params.id)
      .sort("-dateCreated")
      .populate("receiverId", "name")
      .populate("senderId", "name");
    if (!request) {
      res.status(404).json({ msg: "Not found" });
      return;
    }
    if (
      request.senderId._id.toString() !== req.user.id &&
      (!request.receiverId ||
        request.receiverId._id.toString() !== req.user.id) &&
      !["admin", "superAdmin"].includes(req.user.role)
    ) {
      res.status(400).json({ msg: "Not Authorized" });
      return;
    }
    const comments = await Comments.find({ request: req.params.id })
      .limit(50)
      .sort("-dateCreated")
      .populate("sender", "name role");
    res.status(200).json({ request, comments });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests/approve
 * @description Approve a request
 * @access      Private
 */
router.post("/approve", auth, async (req, res) => {
  try {
    const { id } = req.body;
    console.log("ID...", id);
    const request = await Requests.findById(id).populate("senderId", "role");
    console.log(request, "Request Details...");
    console.log(
      "Request ID Details...",
      request.receiverId,
      "\n\nNext... \n\n",
      Types.ObjectId(req.user.id)
    );
    if (!request) {
      console.log("can't find request...");
      res.status(404).json({ msg: "No request found" });
      return;
    }
    console.log(
      "Request ID Details... equal...",
      request.receiverId == Types.ObjectId(req.user.id),
      "Second Attempt..",
      Types.ObjectId(request.receiverId) == Types.ObjectId(req.user.id),
      "Third attempt...",
      request.receiverId == req.user.id
    );

    if (["admin", "superAdmin"].includes(req.user.role) && request.toAdmin) {
      await request.updateOne({ status: "Approved" });
      if (request.changeProfile) {
        let update = {};
        request.content.map((item) => {
          update = { ...update, [`${item.propName}`]: item.value };
        });
        update = {
          ...update,
          dateUpdated: request.dateCreated,
          dateApproved: new Date(),
          status: "approved",
          approved: true,
          isApproved: true,
        };
        console.log("Update...", update);
        switch (request.senderId.role) {
          case "society":
            console.log("User...", request.senderId);
            let { mandatoryReturns } = await SocietyDetails.findOneAndUpdate(
              { userId: Types.ObjectId(request.senderId._id) },
              update,
              { upsert: true }
            );
            request.content
              .filter((item) => item.type === "file")
              .map((item) => {
                mandatoryReturns = {
                  ...mandatoryReturns,
                  [`${item.propName}`]: item,
                };
              });
            break;
          case "extauditor":
          case "intauditor":
            console.log("User...", request.senderId);
            await AuditorDetails.findOneAndUpdate(
              { userId: Types.ObjectId(request.senderId._id) },
              update,
              { upsert: true }
            );
            console.log("Updated...");
            break;
          case "legal":
            console.log("User...", request.senderId);
            await LegalDetails.findOneAndUpdate(
              { userId: Types.ObjectId(request.senderId._id) },
              update,
              { upsert: true }
            );
            console.log("Updated...");
            break;
          case "consultant":
            console.log("User...", request.senderId);
            await ConsultantDetails.findOneAndUpdate(
              { userId: Types.ObjectId(request.senderId._id) },
              update,
              { upsert: true }
            );
            console.log("Updated...");
            break;
          case "financial":
            console.log("User...", request.senderId);
            await FinancialDetails.findOneAndUpdate(
              { userId: Types.ObjectId(request.senderId._id) },
              update,
              { upsert: true }
            );
            console.log("Updated...");
            break;
          default:
            break;
        }
      }
    } else if (request.receiverId == req.user.id && !request.toAdmin) {
      console.log("receiver trying to get it done...");
      await request.updateOne({ status: "Approved" });
    } else {
      res.status(400).status({ msg: "Not Authorized" });
      return;
    }
    res.status(200).json({ msg: "Request approved" });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests/cancel
 * @description Cancel a request
 * @access      Private
 */
router.post("/cancel", auth, async (req, res) => {
  try {
    const request = await Requests.findById(req.body.id);
    if (
      request.senderId.toString() === req.user.id ||
      (["admin", "superAdmin"].includes(req.user.role) && request.toAdmin)
    ) {
      await request.updateOne({ status: "Cancelled" });
    } else if (request.receiverId == req.user.id && !request.toAdmin) {
      await request.updateOne({ status: "Cancelled" });
    } else {
      res.status(400).status({ msg: "Not Authorized" });
      return;
    }
    res.status(200).json({ msg: "Request cancelled" });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests
 * @description Create request
 * @access      Private
 */
router.post("/", auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const {
      title,
      description,
      changeProfile,
      receiverId,
      content,
      toAdmin,
    } = req.body;
    await new Requests({
      senderId,
      title,
      description,
      changeProfile,
      receiverId,
      content,
      toAdmin,
    }).save();
    res.status(200).json({ msg: "Request made successfully" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests/comment/:id
 * @description Comment on a request
 * @access      Private
 */
router.post("/comment/:id", auth, async (req, res) => {
  try {
    const request = req.params.id;
    const sender = req.user.id;
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ msg: "Bad Request" });
      return;
    }
    await new Comments({
      request,
      sender,
      text,
    }).save();
    const comments = await Comments.find({
      request: Types.ObjectId(request),
    })
      .limit(50)
      .sort("-dateCreated")
      .populate("sender", "name role");
    res.status(200).json({ msg: "Comment made successfully", comments });
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
    const request = await Requests.findById(id);
    if (!request) {
      res.status(400).json({ msg: "Reqest does not exist" });
      return;
    }
    if (
      req.user.id !== request.userId ||
      ["Approved", "Cancelled"].includes(request.status)
    ) {
      res.status(400).json({ msg: "No access" });
      return;
    }
    const content = req.body.content || request.content;
    const status = req.body.status || "Pending";
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
 * @route       POST api/requests/append/:id
 * @description append a file to a  request
 * @access      Private
 */
router.post("/append/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await Requests.findById(id);
    if (!request) {
      console.log("Reqest does not exist");
      res.status(400).json({ msg: "Reqest does not exist" });
      return;
    }
    if (
      ![
        request.senderId && request.senderId.toString(),
        request.receiverId && request.receiverId.toString(),
      ].includes(req.user.id)
    ) {
      console.log("Not Authorised");
      console.log(request.senderId, request.receiverId, req.user.id);
      res.status(400).json({ msg: "Not authorized" });
      return;
    }
    const { propName, value, type, label } = req.body;
    if (!(propName && value && type && label)) {
      console.log({ propName, value, type, label });
      res.status(400).json({ msg: "Bad request" });
      return;
    }
    const content = request.content;
    if (content.find((val, index) => val.propName === propName)) {
      content.map((val) => {
        switch (val.propName) {
          case propName:
            return { propName, value, type, label };
          default:
            return val;
        }
      });
    } else {
      content.push({ propName, value, type, label });
    }
    await request.updateOne({ content });
    await Comments({
      request: id,
      sender: req.user.id,
      text: "Made an update to this request",
    }).save();
    res.status(200).json({ msg: "Update Successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/requests/form
 * @description Create a request form
 * @access      Private (For Admin Only)
 */
router.post("/form", auth, async (req, res) => {
  try {
    const {
      userTypes,
      receiverId,
      title,
      description,
      toAdmin,
      changeProfile,
      content,
      postLink,
      users,
      receiverRole,
    } = req.body;
    await Forms({
      userTypes,
      receiverId,
      title,
      description,
      toAdmin,
      changeProfile,
      content,
      postLink,
      users,
      receiverRole,
    }).save();
    res.status(200).json({ msg: "Form created" });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       GET api/requests/form/:id
 * @description Create a retreive form
 * @access      Private (For Admin Only)
 */
router.get("/form/:id", auth, async (req, res) => {
  try {
    const form = await Forms.findById(req.params.id);
    if (!form) {
      res.status(404).json({ msg: "Not found" });
      return;
    }
    if (
      (form.userTypes.length !== 0 &&
        !form.userTypes.includes(req.user.role)) ||
      (form.users.length !== 0 && !form.users.includes(req.user.id))
    ) {
      res.status(400).json({ msg: "Invalid request" });
      return;
    }
    res.status(200).json(form);
  } catch (err) {
    console.error(err);
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
    if (!["Approved", "Cancelled", "Rejected"].includes(status)) {
      res.status(400).json({
        msg:
          "Status is not valid it can either be approved, cancelled or rejected",
      });
      return;
    }
    // @TODO status chage
    res.status(200).json({ msg: "Request status change successful" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

module.exports = router;
