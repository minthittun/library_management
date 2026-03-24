import mongoose from 'mongoose';

const membershipPaymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  library: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  monthsExtended: { type: Number, default: 6 }
}, { timestamps: true });

const MembershipPayment = mongoose.model('MembershipPayment', membershipPaymentSchema);
export default MembershipPayment;
