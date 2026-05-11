const QRCode = require("qrcode");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

// Register for an event
exports.registerForEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    // Prevent duplicate registrations
    const alreadyRegistered = await Registration.findOne({
      user: req.user._id,
      event: eventId,
    });
    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    // Fetch the event to check capacity
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Count existing registrations for this event
    const registrationCount = await Registration.countDocuments({
      event: eventId,
      status: "registered",
    });

    // Determine if user should be waitlisted
    let status = "registered";
    if (event.isCapacityEnabled && registrationCount >= event.capacity) {
      status = "waitlisted";
    }

    // Generate QR content as a JSON string for robustness
    const qrData = JSON.stringify({
      userId: req.user._id,
      eventId: eventId,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
      qrCode,
      status,
    });

    const message =
      status === "waitlisted"
        ? "You have been added to the waitlist"
        : "Registered successfully";

    res.status(201).json({ message, registration });
  } catch (err) {
    next(err);
  }
};

// MARK ATTENDANCE using QR scan
exports.markAttendance = async (req, res) => {
  try {
    const { qrData } = req.body; // expecting full QR code content as a JSON string

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ message: "Invalid QR code format" });
    }

    const { userId, eventId } = parsedData;

    if (!userId || !eventId) {
      return res.status(400).json({ message: "Invalid QR code data" });
    }

    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.attendance) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    registration.attendance = true;
    await registration.save();

    const populatedRegistration = await Registration.findById(registration._id)
      .populate("user", "name email")
      .populate("event", "title");

    res.status(200).json({
      message: "Attendance marked successfully",
      registration: populatedRegistration,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all registrations for an event
exports.getRegistrationsForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email")
      .populate("event", "title");

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAdminSummary = async (req, res) => {
  try {
    const summary = await Registration.aggregate([
      {
        $group: {
          _id: "$event",
          totalRegistrations: { $sum: 1 },
          presentCount: {
            $sum: { $cond: ["$attendance", 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "events", // The collection name for the Event model
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      {
        $unwind: "$eventDetails", // Deconstruct the eventDetails array
      },
      {
        $project: {
          _id: 0, // Exclude the default _id
          eventId: "$_id",
          title: "$eventDetails.title",
          total: "$totalRegistrations",
          present: "$presentCount",
        },
      },
    ]);

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all registrations for the currently logged-in user
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate("event") // Populate with full event details
      .sort({ "event.date": 1 }); // Sort by event date
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Export all registrations to Excel
exports.exportRegistrations = async (req, res, next) => {
  try {
    const ExcelJS = require("exceljs");

    // Fetch all registrations with populated user and event data
    const registrations = await Registration.find()
      .populate("user", "name email")
      .populate("event", "title date");

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registrations");

    // Define columns
    worksheet.columns = [
      { header: "Registration ID", key: "id", width: 25 },
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Student Email", key: "studentEmail", width: 25 },
      { header: "Event Title", key: "eventTitle", width: 25 },
      { header: "Event Date", key: "eventDate", width: 15 },
      { header: "Attendance Status", key: "attendance", width: 18 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBDD7EE" }, // Light blue
    };

    // Add data rows
    registrations.forEach((reg) => {
      const eventDate = reg.event?.date
        ? new Date(reg.event.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";

      worksheet.addRow({
        id: reg._id.toString(),
        studentName: reg.user?.name || "",
        studentEmail: reg.user?.email || "",
        eventTitle: reg.event?.title || "",
        eventDate: eventDate,
        attendance: reg.attendance ? "Yes" : "No",
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=registrations.xlsx",
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
