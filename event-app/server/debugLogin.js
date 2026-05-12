const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const debugLogin = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/event-management";
    await mongoose.connect(mongoUri, {});
    console.log("Connected to MongoDB");

    const email = "superadmin@demo.com";
    const password = "superadmin123";

    // Test 1: Check all users with similar emails
    console.log("\n--- All users in database ---");
    const allUsers = await User.find({});
    allUsers.forEach((u) => {
      console.log(`  - ${u.email} (role: ${u.role})`);
    });

    // Test 2: Exact case match
    console.log("\n--- Testing exact match ---");
    const userExact = await User.findOne({ email: email });
    console.log("Exact match found:", !!userExact);

    // Test 3: Case insensitive search
    console.log("\n--- Testing case insensitive ---");
    const userCI = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    console.log("Case insensitive match found:", !!userCI);
    if (userCI) {
      console.log("Actual email in DB:", userCI.email);
    }

    // Test 4: Direct password comparison
    console.log("\n--- Testing password comparison ---");
    const user = userExact || userCI;
    if (user) {
      const isMatch = await user.comparePassword(password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        // Force password reset
        console.log("\n⚠️ Password mismatch - forcing reset...");
        user.password = password;
        await user.save();
        console.log("Password reset complete. Testing again...");

        const user2 = await User.findOne({ email: user.email });
        const isMatch2 = await user2.comparePassword(password);
        console.log("After reset, password match:", isMatch2);
      }
    }

    await mongoose.disconnect();
    console.log("\n✅ Debug complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

debugLogin();
