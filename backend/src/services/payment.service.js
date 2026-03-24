import MembershipPayment from '../models/MembershipPayment.js';
import Member from '../models/Member.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const createPayment = async (memberId, amount, monthsExtended = 6) => {
  const member = await Member.findById(memberId);
  if (!member) throw new Error('Member not found');
  
  const payment = new MembershipPayment({
    member: memberId,
    amount,
    monthsExtended,
    paymentDate: new Date()
  });
  
  await payment.save();
  
  const now = new Date();
  
  if (!member.membershipStartDate) {
    member.membershipStartDate = now;
  }
  
  let currentExpiry = member.membershipExpiryDate ? new Date(member.membershipExpiryDate) : null;
  
  if (!currentExpiry || currentExpiry < now) {
    member.membershipExpiryDate = new Date(now.getTime() + monthsExtended * 30 * 24 * 60 * 60 * 1000);
  } else {
    member.membershipExpiryDate = new Date(currentExpiry.getTime() + monthsExtended * 30 * 24 * 60 * 60 * 1000);
  }
  
  member.status = 'active';
  
  await member.save();
  
  return { payment, member };
};

export const getAllPayments = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);

  const pipeline = [
    {
      $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'member'
      }
    },
    { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
  ];

  if (searchRegex) {
    pipeline.push({
      $match: {
        'member.name': searchRegex,
      },
    });
  }

  pipeline.push(
    { $sort: { paymentDate: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
    {
      $project: {
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
      },
    }
  );

  const [result] = await MembershipPayment.aggregate(pipeline);
  return buildPaginatedResponse(result.data, page, limit, result.total);
};

export const getMemberPayments = async (memberId) => {
  return await MembershipPayment.find({ member: memberId })
    .sort({ paymentDate: -1 });
};
