const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const File = require("../models/File");

const { upload, getGfs } = require("../config/db");
const auth = require("../middleware/auth");

/**
 * @route       POST api/resources
 * @description Save a resource
 * @access      Public (For Now)
 */

router.post("/", auth, async (req, res) => {
  console.log(req.body);
  const { title, details, type, url } = req.body;
  let FileObj = {};
  FileObj.title = title;
  FileObj.details = details;
  FileObj.type = type;
  FileObj.url = url;
  FileObj.userId = req.user.id;
  try {
    await new File(FileObj).save();
    res.status(200).json({ msg: "File uploaded successfully" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       GET api/resources
 * @description Get all resource urls
 * @access      Public
 */

router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort("-dateUploaded");
    res.status(200).json(files);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

module.exports = router;
