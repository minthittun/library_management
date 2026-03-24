import Library from '../models/Library.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const createLibrary = async (data) => {
  const existing = await Library.findOne({ name: data.name });
  if (existing) {
    throw new Error('Library with this name already exists');
  }
  const library = new Library(data);
  return await library.save();
};

export const getAllLibraries = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);

  const query = {};
  if (searchRegex) {
    const orConditions = [
      { name: searchRegex },
      { address: searchRegex },
      { email: searchRegex },
    ];
    query.$or = orConditions;
  }
  if (params.isActive !== undefined) {
    query.isActive = params.isActive === 'true';
  }

  const total = await Library.countDocuments(query);
  const data = await Library.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return buildPaginatedResponse(data, page, limit, total);
};

export const getLibraryById = async (id) => {
  return await Library.findById(id);
};

export const updateLibrary = async (id, data) => {
  const library = await Library.findByIdAndUpdate(id, data, { new: true });
  if (!library) {
    throw new Error('Library not found');
  }
  return library;
};

export const deleteLibrary = async (id) => {
  const library = await Library.findByIdAndDelete(id);
  if (!library) {
    throw new Error('Library not found');
  }
  return library;
};

export const getLibrariesByIds = async (ids) => {
  return await Library.find({ _id: { $in: ids } });
};
