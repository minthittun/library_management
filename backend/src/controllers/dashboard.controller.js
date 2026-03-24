import * as dashboardService from '../services/dashboard.service.js';
import * as superadminDashboardService from '../services/superadminDashboard.service.js';

const getLibraryId = (req) => {
  if (req.user.role === 'superadmin') {
    return req.query.library || null;
  }
  return req.user.libraries?.[0] || null;
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const stats = await dashboardService.getDashboardStats({ ...req.query, library: libraryId });
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getSuperAdminDashboardStats = async (req, res, next) => {
  try {
    const stats = await superadminDashboardService.getSuperAdminDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
