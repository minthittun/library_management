import * as memberService from '../services/member.service.js';

export const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req, res, next) => {
  try {
    const members = await memberService.getAllMembers(req.query);
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
