const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');

// SIMULAÇÃO DE PAGAMENTO - Sem Mercado Pago

// Criar preferência de pagamento (SIMULADA)
const createPaymentPreference = async (req, res) => {
  try {
    console.log('🔍 Simulando criação de preferência de pagamento...');
    const { subscription_id, plano_id } = req.body;
    const estabelecimentoId = req.user?.id || req.user?.userId;
    
    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento não encontrado'
      });
    }

    // SIMULAÇÃO: Retorna uma preferência fake
    const fakePreferenceId = `simulated_pref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    console.log('✅ Preferência simulada criada:', fakePreferenceId);
    
    res.json({
      success: true,
      preferenceId: fakePreferenceId,
      message: 'Preferência simulada criada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar preferência simulada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Processar webhook (SIMULADO)
const processWebhook = async (req, res) => {
  try {
    console.log('🔍 Simulando processamento de webhook...');
    
    // SIMULAÇÃO: Sempre aprova o pagamento
    const fakePaymentId = `simulated_payment_${Date.now()}`;
    
    console.log('✅ Webhook simulado processado:', fakePaymentId);
    
    res.status(200).json({
      success: true,
      message: 'Webhook simulado processado'
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook simulado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar status do pagamento (SIMULADO)
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    console.log('🔍 Verificando status do pagamento simulado:', paymentId);
    
    // SIMULAÇÃO: Sempre retorna aprovado
    res.json({
      success: true,
      status: 'approved',
      message: 'Pagamento simulado aprovado'
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status do pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createPaymentPreference,
  processWebhook,
  checkPaymentStatus
};