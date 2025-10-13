const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');

// Middleware para verificar se o estabelecimento tem plano ativo
const checkPlanActive = async (req, res, next) => {
  try {
    const estabelecimentoId = req.user?.id;
    
    if (!estabelecimentoId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar assinatura ativa
    const subscription = await Subscription.findActiveByEstabelecimento(estabelecimentoId);
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Plano não ativo ou vencido',
        requiresPlan: true,
        redirectTo: '/estabelecimento/planos'
      });
    }

    // Verificar se está próxima do vencimento
    if (subscription.isNearExpiration()) {
      req.planWarning = {
        message: 'Seu plano vence em breve',
        expirationDate: subscription.data_vencimento
      };
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Erro ao verificar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar funcionalidade específica do plano
const checkPlanFeature = (feature) => {
  return async (req, res, next) => {
    try {
      if (!req.subscription) {
        return res.status(403).json({
          success: false,
          message: 'Plano não ativo'
        });
      }

      // Buscar detalhes do plano
      const plan = await Plan.findById(req.subscription.plano_id);
      
      if (!plan || !plan.hasFeature(feature)) {
        return res.status(403).json({
          success: false,
          message: `Funcionalidade '${feature}' não disponível no seu plano`,
          requiresUpgrade: true
        });
      }

      req.plan = plan;
      next();
    } catch (error) {
      console.error('Erro ao verificar funcionalidade do plano:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware para verificar limites do plano
const checkPlanLimits = async (req, res, next) => {
  try {
    if (!req.subscription || !req.plan) {
      return res.status(403).json({
        success: false,
        message: 'Plano não ativo'
      });
    }

    const estabelecimentoId = req.user.id;

    // Verificar limite de filas
    if (req.route.path.includes('/queues') && req.method === 'POST') {
      const { pool } = require('../config/database');
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as total FROM filas WHERE estabelecimento_id = ?',
        [estabelecimentoId]
      );
      
      if (!req.plan.canCreateQueue(rows[0].total)) {
        return res.status(403).json({
          success: false,
          message: `Limite de filas atingido (${req.plan.max_filas}). Faça upgrade do seu plano.`,
          requiresUpgrade: true
        });
      }
    }

    // Verificar limite de clientes por fila
    if (req.route.path.includes('/join-queue')) {
      const { queueId } = req.params;
      const { pool } = require('../config/database');
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as total FROM historico_clientes_filas WHERE queue_id = ? AND status = "aguardando"',
        [queueId]
      );
      
      if (!req.plan.canAddClientToQueue(rows[0].total)) {
        return res.status(403).json({
          success: false,
          message: `Limite de clientes por fila atingido (${req.plan.max_clientes_por_fila}). Faça upgrade do seu plano.`,
          requiresUpgrade: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limites do plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional para planos (não bloqueia, apenas adiciona info)
const optionalPlanCheck = async (req, res, next) => {
  try {
    const estabelecimentoId = req.user?.id;
    
    if (estabelecimentoId) {
      const subscription = await Subscription.findActiveByEstabelecimento(estabelecimentoId);
      req.subscription = subscription;
      
      if (subscription) {
        const plan = await Plan.findById(subscription.plano_id);
        req.plan = plan;
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro ao verificar plano (opcional):', error);
    // Não falha, apenas continua sem info do plano
    next();
  }
};

module.exports = {
  checkPlanActive,
  checkPlanFeature,
  checkPlanLimits,
  optionalPlanCheck
};
