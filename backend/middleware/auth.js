/**
 * Authentication Middleware
 * Validates the JWT and extracts the authenticated user's org_id
 */

const env = require('../config/env');
const logger = require('../utils/logger');
const { DEMO_ORG_ID } = require('../config/constants');
const supabase = require('../utils/supabase');

/**
 * Required authentication middleware
 * Validates the JWT and extracts userId and orgId
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized request - missing token', {
        path: req.path,
        ip: req.ip,
      });
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication token not provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Validar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token', {
        error: error?.message,
        path: req.path,
        ip: req.ip,
      });
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Token invalid or expired' 
      });
    }

    // Fetch the user's org_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      logger.error('User profile not found', {
        userId: user.id,
        error: profileError?.message,
      });
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'User profile not found' 
      });
    }

    // Attach user data to the request
    req.user = {
      id: user.id,
      email: user.email,
      orgId: userProfile.org_id,
      role: userProfile.role,
    };

    logger.debug('User authenticated', {
      userId: user.id,
      orgId: userProfile.org_id,
      role: userProfile.role,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.errorWithContext('Authentication error', error, {
      path: req.path,
      ip: req.ip,
    });
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to validate authentication' 
    });
  }
}

/**
 * Optional authentication middleware
 * If a token is present, validate and extract user data
 * If no token, uses DEMO_ORG_ID (development only)
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No authentication: use demo org (development only)
    if (env.NODE_ENV === 'development') {
      req.user = {
        id: null,
        email: 'demo@n360.local',
        orgId: DEMO_ORG_ID,
        role: 'viewer',
      };
      
      logger.debug('Using demo org (no auth)', {
        orgId: DEMO_ORG_ID,
        path: req.path,
      });
      
      return next();
    }
    
    // Production: authentication required
    return requireAuth(req, res, next);
  }

  // Token provided: validate it
  return requireAuth(req, res, next);
}

/**
 * Middleware to check role-based permissions
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Forbidden - insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
};




