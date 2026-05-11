const Event = require("../models/Event");
const Registration = require("../models/Registration");

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, location, date, capacity, isCapacityEnabled } =
      req.body;
    let image = req.body.image; // For URLs if no file is uploaded

    if (req.file) {
      image = req.file.path.replace(/\\/g, "/");
    }

    const event = await Event.create({
      title,
      description,
      location,
      date,
      image,
      capacity,
      isCapacityEnabled,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    // Get registration counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: "registered",
        });
        return {
          ...event.toObject(),
          registrationCount,
        };
      }),
    );

    res.status(200).json(eventsWithCounts);
  } catch (err) {
    next(err);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
};
