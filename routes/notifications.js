const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Notifications = require("../models/Notifications");
const auth = require("../middleware/auth");
const mail = require("../mail/mailService");

/**
 * @route       GET api/notifications
 * @description Get all notifications
 * @access      Private
 */
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notifications.find({ userId: req.user.id });
    const newNotifications = notifications.filter((notice) => !notice.seen);
    res.status(200).json({ notifications, newNotifications });
    return;
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/notifications/read/:id
 * @description Mark a notification as read
 * @access      Private
 */
router.post("/read/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Notifications.findById(id);
    if (result.userId === req.user.id || req.user.role === "admin") {
      await result.updateOne({ seen: true });
    } else {
      res.status(400).json({ msg: "Access Denied" });
    }
    const notifications = await Notifications.find({ userId: req.user.id });
    const newNotifications = notifications.filter((notice) => !notice.seen);
    res.status(200).json({ notifications, newNotifications });
    return;
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/notifications/delete/:id
 * @description Delete a notification
 * @access      Private
 */
router.get("/delete/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    await Notifications.findById(id, async (err, result) => {
      if (err) throw err;
      if (result.userId === req.user.id || req.user.role === "admin") {
        await result.deleteOne();
      } else {
        res.status(400).json({ msg: "Access Denied" });
      }
    });
    const notifications = [];
    const newNotifications = [];
    await Notifications.find({ userId: req.user.id }, (err, result) => {
      if (err) throw err;
      result.forEach((notification) => {
        notifications.push(notification);
        if (!notification.seen) newNotifications.push(notification);
      });
    });
    res.status(200).json({ notifications, newNotifications });
    return;
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

/**
 * @route       POST api/notifications
 * @description Mark all notifications as read
 * @access      Private
 */
router.post("/", auth, async (req, res) => {
  try {
    await Notifications.updateMany(
      { userId: req.user.id, seen: false },
      { seen: true }
    );
    const notifications = await Notifications.find({ userId: req.user.id });
    res.status(200).json({ notifications });
    return;
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
    return;
  }
});

module.exports = router;
