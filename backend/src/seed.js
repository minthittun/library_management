import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const librarianSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

const Librarian = mongoose.model("Librarian", librarianSchema);

const seedAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/library",
    );
    console.log("Connected to MongoDB");

    const adminExists = await Librarian.findOne({ username: "admin" });

    if (adminExists) {
      console.log("Admin user already exists");
    } else {
      await Librarian.create({
        username: "admin",
        password: "admin123",
        name: "Administrator",
      });
      console.log("Admin user created successfully");
      console.log("Username: admin");
      console.log("Password: admin123");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
