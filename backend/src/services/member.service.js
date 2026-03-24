import mongoose from 'mongoose';
import Member from '../models/Member.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const createMember = async (memberData) => {
  const member = new Member({
    ...memberData,
    status: 'active'
  });
  return await member.save();
};

export const getAllMembers = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);

  const query = {};
  if (params.library) {
    query.library = new mongoose.Types.ObjectId(params.library);
  }
  if (params.status) {
    query.status = params.status;
  }
  if (searchRegex) {
    query.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { address: searchRegex },
      { status: searchRegex },
    ];
  }

  const total = await Member.countDocuments(query);
  const data = await Member.find(query)
    .populate('library')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return buildPaginatedResponse(data, page, limit, total);
};

export const getMemberById = async (id) => {
  return await Member.findById(id).populate('library');
};

export const updateMember = async (id, memberData) => {
  return await Member.findByIdAndUpdate(id, memberData, { new: true });
};

export const checkMembershipValid = async (id) => {
  const member = await Member.findById(id);
  if (!member) return false;
  return new Date(member.membershipExpiryDate) > new Date();
};

export const extendMembership = async (id, months = 6) => {
  const member = await Member.findById(id);
  if (!member) return null;
  
  const currentExpiry = new Date(member.membershipExpiryDate);
  const now = new Date();
  
  if (currentExpiry < now) {
    member.membershipExpiryDate = new Date(now);
    member.membershipExpiryDate.setMonth(member.membershipExpiryDate.getMonth() + months);
  } else {
    member.membershipExpiryDate.setMonth(member.membershipExpiryDate.getMonth() + months);
  }
  
  member.status = 'active';
  return await member.save();
};
