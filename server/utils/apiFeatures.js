class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering (gte, gt, lte, lt, in)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Support case-insensitive regex for specific fields if supplied (e.g. material, color)
    Object.keys(parsedQuery).forEach(key => {
      if (typeof parsedQuery[key] === 'string' && key !== 'slug') {
        // Apply regex for partial match on strings
        parsedQuery[key] = { $regex: parsedQuery[key], $options: 'i' };
      }
    });

    this.query = this.query.find(parsedQuery);

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate(defaultLimit = 12) {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || defaultLimit;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
