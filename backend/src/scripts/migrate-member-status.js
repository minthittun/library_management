import mongoose from "mongoose";
import dotenv from "dotenv";
import Member from "../models/Member.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/library";

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const result = await Member.updateMany(
      { status: { $in: ["expired", "pending"] } },
      { $set: { status: "active" } },
    );
    console.log(
      `Updated ${result.modifiedCount || 0} members to status=active`,
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};

run();
