const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

// Listar todos os planos disponíveis
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll();
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar plano específico
const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar status do plano do estabelecimento
const getPlanStatus = async (req, res) => {
  try {
    const estabelecimentoId = req.user?.id || req.user?.userId;
    
    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento não encontrado'
      });
    }
    
    const subscription = await Subscription.findActiveByEstabelecimento(estabelecimentoId);
    
    if (!subscription) {
      return res.json({
        success: true,
        data: {
          hasActivePlan: false,
          message: 'Nenhum plano ativo encontrado'
        }
      });
    }

    const plan = await Plan.findById(subscription.plano_id);
    
    res.json({
      success: true,
      data: {
        hasActivePlan: true,
        subscription: subscription,
        plan: plan,
        isNearExpiration: subscription.isNearExpiration(),
        isExpired: subscription.isExpired()
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar assinatura (iniciar processo de pagamento)
const createSubscription = async (req, res) => {
  try {
    const { plano_id } = req.body;
    const estabelecimentoId = req.user?.id || req.user?.userId;
    
    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento não encontrado'
      });
    }
    
    // Verificar se plano existe
    const plan = await Plan.findById(plano_id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    // Verificar se já tem plano ativo
    const existingSubscription = await Subscription.findActiveByEstabelecimento(estabelecimentoId);
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui um plano ativo'
      });
    }

    // Criar assinatura (status pending)
    const subscriptionId = await Subscription.create({
      estabelecimento_id: estabelecimentoId,
      plano_id: plano_id,
      valor: plan.preco,
      payment_id: null, // Será preenchido pelo Mercado Pago
      subscription_id: null
    });

    res.json({
      success: true,
      data: {
        subscription_id: subscriptionId,
        plan: plan,
        next_step: 'payment' // Próximo passo é processar pagamento
      }
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar histórico de assinaturas
const getSubscriptionHistory = async (req, res) => {
  try {
    const estabelecimentoId = req.user.id;
    const subscriptions = await Subscription.findByEstabelecimento(estabelecimentoId);
    
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de assinaturas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar assinatura
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const estabelecimentoId = req.user.id;
    
    // Verificar se a assinatura pertence ao estabelecimento
    const subscription = await Subscription.findActiveByEstabelecimento(estabelecimentoId);
    if (!subscription || subscription.id != subscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'Assinatura não encontrada'
      });
    }

    await Subscription.cancel(subscriptionId);
    
    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getPlans,
  getPlanById,
  getPlanStatus,
  createSubscription,
  getSubscriptionHistory,
  cancelSubscription
};
