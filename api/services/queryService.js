const query = async (model, query, options = {}) => {
    const {
        searchableFields = [],
        populate = [],
        customFilters = async (filters, baseFilter) => {
            for (const key in filters) {
                if (filters[key]) {
                    baseFilter[key] = { $regex: filters[key], $options: 'i' };
                }
            }
            return baseFilter;
        }
    } = options;

    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        ...rawFilters
    } = query;

    // Build filter object
    let filter = {};

    if (search && searchableFields.length > 0) {
        filter.$or = searchableFields.map(field => ({
            [field]: { $regex: search, $options: 'i' }
        }));
    }

    // Apply custom filters
    filter = await customFilters(rawFilters, filter);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' || sortOrder === '-1' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let queryBuilder = model.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    if (populate.length > 0) {
        queryBuilder = queryBuilder.populate(populate);
    }

    const [data, total] = await Promise.all([
        queryBuilder.exec(),
        model.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return {
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages
        }
    };
};

module.exports = {
    query
};