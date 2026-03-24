import mongoose from "mongoose";

const librarianSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

const Librarian = mongoose.model("Librarian", librarianSchema);
export default Librarian;
