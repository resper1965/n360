/**
 * Authentication Middleware
 * Valida JWT e extrai org_id do usuário autenticado
 */

const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');
const logger = require('../utils/logger');
const { DEMO_ORG_ID } = require('../config/constants');

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

/**
 * Middleware de autenticação obrigatória
 * Valida token JWT e extrai userId e orgId
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
        message: 'Token de autenticação não fornecido' 
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
        message: 'Token inválido ou expirado' 
      });
    }

    // Buscar org_id do usuário
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
        message: 'Perfil de usuário não encontrado' 
      });
    }

    // Anexar dados do usuário ao request
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
      message: 'Erro ao validar autenticação' 
    });
  }
}

/**
 * Middleware de autenticação opcional
 * Se houver token, valida e extrai dados
 * Se não houver token, usa DEMO_ORG_ID (apenas desenvolvimento)
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Sem autenticação: usar org demo (apenas em desenvolvimento)
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
    
    // Produção: auth obrigatório
    return requireAuth(req, res, next);
  }

  // Tem token: validar
  return requireAuth(req, res, next);
}

/**
 * Middleware para verificar permissões por role
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Autenticação necessária' 
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
        message: `Acesso negado. Permissões necessárias: ${allowedRoles.join(', ')}` 
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



