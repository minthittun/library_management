import * as memberService from '../services/member.service.js';

const getLibraryId = (req) => {
  if (req.user.role === 'superadmin') {
    return req.body.library || req.query.library || null;
  }
  return req.user.libraries?.[0] || null;
};

export const createMember = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const member = await memberService.createMember({ ...req.body, library: libraryId });
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const members = await memberService.getAllMembers({ ...req.query, library: libraryId });
    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const checkMembership = async (req, res, next) => {
  try {
    const isValid = await memberService.checkMembershipValid(req.params.id);
    res.json({ valid: isValid });
  } catch (error) {
    next(error);
  }
};
