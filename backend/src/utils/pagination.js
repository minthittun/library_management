export const normalizePagination = (params = {}) => {
  const page = Math.max(parseInt(params.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(params.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginatedResponse = (data, page, limit, total) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  }
});
