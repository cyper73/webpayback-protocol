import { RequestHandler } from "express";

// Admin credentials for allowance management and pool manager
const ADMIN_CREDENTIALS = {
  username: "Sirio",
  password: "Flender73"
};

// Admin authentication middleware
export const authenticateAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required for admin modules" 
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // Add admin flag to request
    (req as any).isAdmin = true;
    return next();
  }

  return res.status(401).json({ 
    success: false, 
    message: "Invalid admin credentials" 
  });
};

// Check if request has admin authentication
export const isAdminAuthenticated = (req: any): boolean => {
  return req.isAdmin === true;
};

// Admin login endpoint handler
export const adminLogin: RequestHandler = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // Generate basic auth token
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    
    res.json({
      success: true,
      message: "Admin authentication successful",
      token: `Basic ${token}`,
      modules: ["allowance-management", "auto-pool-manager"]
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
};