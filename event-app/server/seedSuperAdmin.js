const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB (use env variable or fallback to local)
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/event-management";
    await mongoose.connect(mongoUri, {});
    console.log("Connected to MongoDB");
    console.log("URI:", mongoUri);

    // Demo superadmin credentials
    const superAdminData = {
      name: "Super Admin",
      email: "superadmin@demo.com",
      password: "superadmin123",
      role: "superadmin",
    };

    // Check if superadmin already exists
    const existingUser = await User.findOne({ email: superAdminData.email });

    if (existingUser) {
      // Update to superadmin and reset password
      existingUser.role = "superadmin";
      existingUser.password = superAdminData.password; // Will be hashed by pre-save hook
      await existingUser.save();
      console.log("\n✅ Existing user updated to superadmin with new password");
      console.log("\n📧 Login Credentials:");
      console.log("   Email:", superAdminData.email);
      console.log("   Password:", superAdminData.password);
      console.log("   Role:", existingUser.role);
    } else {
      // Create new superadmin
      const superAdmin = await User.create(superAdminData);
      console.log("\n✅ Superadmin created successfully!");
      console.log("\n📧 Login Credentials:");
      console.log("   Email:", superAdminData.email);
      console.log("   Password:", superAdminData.password);
      console.log("   Role:", superAdmin.role);
    }

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding superadmin:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
