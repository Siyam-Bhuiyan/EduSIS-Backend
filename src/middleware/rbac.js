// src/middleware/rbac.js
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

// self or admin
export function selfOrAdmin(paramKey = "id") {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const isSelf = Number(req.params[paramKey]) === Number(req.user.id);
    if (isSelf || req.user.role === "admin") return next();
    return res.status(403).json({ message: "Forbidden" });
  };
}
