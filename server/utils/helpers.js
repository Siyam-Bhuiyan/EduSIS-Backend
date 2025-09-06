// Response utilities
exports.sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
  });
};

exports.sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

exports.sendSuccess = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

// Pagination utilities
exports.getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page, 10) || 1;
  const perPage = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (currentPage - 1) * perPage;

  return {
    currentPage,
    perPage,
    totalPages,
    total,
    startIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};

// Query builder utilities
exports.buildQuery = (queryParams, allowedFields) => {
  const query = {};

  Object.keys(queryParams).forEach((key) => {
    if (allowedFields.includes(key) && queryParams[key]) {
      // Handle different query types
      if (key.endsWith("_gte")) {
        const field = key.replace("_gte", "");
        query[field] = { ...query[field], $gte: queryParams[key] };
      } else if (key.endsWith("_lte")) {
        const field = key.replace("_lte", "");
        query[field] = { ...query[field], $lte: queryParams[key] };
      } else if (key.endsWith("_regex")) {
        const field = key.replace("_regex", "");
        query[field] = { $regex: queryParams[key], $options: "i" };
      } else {
        query[key] = queryParams[key];
      }
    }
  });

  return query;
};

// Date utilities
exports.formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

exports.addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

exports.getDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : exports.addDays(new Date(), 30);
  return { start, end };
};

// Validation utilities
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

exports.sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.trim().replace(/[<>]/g, "");
  }
  return input;
};

// File utilities
exports.getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};

exports.isImageFile = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  return imageExtensions.includes(exports.getFileExtension(filename));
};

exports.isDocumentFile = (filename) => {
  const docExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
  ];
  return docExtensions.includes(exports.getFileExtension(filename));
};

// Array utilities
exports.removeDuplicates = (array) => {
  return [...new Set(array)];
};

exports.chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object utilities
exports.cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

exports.pickFields = (obj, fields) => {
  const picked = {};
  fields.forEach((field) => {
    if (obj[field] !== undefined) {
      picked[field] = obj[field];
    }
  });
  return picked;
};

// Generate utilities
exports.generateRandomString = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.generateStudentId = (department, year) => {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${department.toUpperCase()}${year}${randomNum}`;
};

exports.generateTeacherId = (department) => {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `T${department.toUpperCase()}${randomNum}`;
};
