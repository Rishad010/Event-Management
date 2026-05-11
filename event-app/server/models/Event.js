const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    location: String,
    date: {
      type: Date,
      required: true,
    },
    image: {
      type: String, // URL or filename
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    capacity: {
      type: Number,
      default: 50,
      min: 1,
    },
    isCapacityEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
