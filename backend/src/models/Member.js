import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    membershipStartDate: { type: Date },
    membershipExpiryDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Member = mongoose.model("Member", memberSchema);
export default Member;
