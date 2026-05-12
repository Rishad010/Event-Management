const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const testLogin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/event-management";
    await mongoose.connect(mongoUri, {});
    console.log("Connected to MongoDB");
    console.log("URI:", mongoUri);

    const email = "superadmin@demo.com";
    const password = "superadmin123";

    // Find user
    const user = await User.findOne({ email });
    console.log("\n--- User Found ---");
    console.log("User:", user ? {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.password ? user.password.substring(0, 20) + "..." : "NO PASSWORD"
    } : "NOT FOUND");

    if (!user) {
      console.log("\n❌ User not found!");
      process.exit(1);
    }

    // Test password comparison
    console.log("\n--- Testing Password ---");
    console.log("Input password:", password);
    console.log("Stored hash (first 30 chars):", user.password?.substring(0, 30));

    const isMatch = await user.comparePassword(password);
    console.log("\nPassword match result:", isMatch);

    if (isMatch) {
      console.log("\n✅ Login would succeed!");
    } else {
      console.log("\n❌ Login would fail - password doesn't match");
      
      // Let's try to manually compare with bcrypt
      const bcrypt = require("bcryptjs");
      const manualMatch = await bcrypt.compare(password, user.password);
      console.log("Manual bcrypt compare:", manualMatch);
      
      // Check if password was properly hashed
      const isHashed = user.password.startsWith("$2");
      console.log("Password appears hashed:", isHashed);
      
      if (!isHashed) {
        console.log("\n⚠️ Password is NOT hashed! Re-seeding...");
        user.password = password;
        await user.save();
        console.log("Password re-saved, should be hashed now.");
        
        // Fetch again and test
        const user2 = await User.findOne({ email });
        const isMatch2 = await user2.comparePassword(password);
        console.log("After re-save, password match:", isMatch2);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testLogin();
