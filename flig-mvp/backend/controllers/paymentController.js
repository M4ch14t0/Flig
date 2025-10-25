import mercadopagoService from '../services/mercadopago.js';
import paymentService from '../services/payment.js';
import Queue from '../models/Queue.js';

/**
 * Criar preferência de pagamento para avanço na fila
 */
async function createAdvancePreference(req, res) {
  try {
    const { queueId, positions } = req.body;
    const { userId, email, nome, telefone } = req.user;

    // Validar dados
    if (!queueId || !positions) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila e número de posições são obrigatórios'
      });
    }

    // Buscar fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Verificar se a fila está ativa
    if (queue.status !== 'ativa') {
      return res.status(400).json({
        success: false,
        message: 'Fila não está ativa'
      });
    }

    // Calcular valor do avanço
    const amount = paymentService.calculateAdvancePrice(positions, queue.valor_avancos);

    // Criar preferência de pagamento
    const preferenceData = {
      clientId: userId,
      queueId,
      positions,
      amount,
      clientInfo: {
        nome,
        email,
        telefone
      }
    };

    const result = await mercadopagoService.createAdvancePreference(preferenceData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Preferência de pagamento criada com sucesso',
        data: {
          preferenceId: result.preferenceId,
          initPoint: result.initPoint,
          sandboxInitPoint: result.sandboxInitPoint,
          amount,
          positions
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar preferência de pagamento',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao criar preferência de avanço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Criar preferência de pagamento para assinatura
 */
async function createSubscriptionPreference(req, res) {
  try {
    const { planId } = req.body;
    const { userId, email, nome, telefone } = req.user;

    // Validar dados
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'ID do plano é obrigatório'
      });
    }

    // Buscar plano (você pode implementar um modelo de Plan)
    // Por enquanto, vou usar dados mockados
    const planData = {
      id: planId,
      name: 'Plano Premium',
      amount: 29.90
    };

    // Criar preferência de pagamento
    const preferenceData = {
      planId,
      planName: planData.name,
      amount: planData.amount,
      clientInfo: {
        nome,
        email,
        telefone
      }
    };

    const result = await mercadopagoService.createSubscriptionPreference(preferenceData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Preferência de assinatura criada com sucesso',
        data: {
          preferenceId: result.preferenceId,
          initPoint: result.initPoint,
          sandboxInitPoint: result.sandboxInitPoint,
          amount: planData.amount,
          planName: planData.name
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar preferência de assinatura',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao criar preferência de assinatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Verificar status de um pagamento
 */
async function getPaymentStatus(req, res) {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'ID do pagamento é obrigatório'
      });
    }

    const result = await mercadopagoService.getPaymentStatus(paymentId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          status: result.status,
          statusDetail: result.statusDetail,
          transactionAmount: result.transactionAmount,
          externalReference: result.externalReference
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao verificar status do pagamento',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status do pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Processar webhook do Mercado Pago
 * Implementa validação de assinatura e processamento conforme documentação oficial
 */
async function processWebhook(req, res) {
  try {
    const webhookData = req.body;
    const headers = req.headers;
    const queryParams = req.query;

    console.log('🔔 Webhook recebido do Mercado Pago:', {
      body: webhookData,
      headers: {
        'x-signature': headers['x-signature'],
        'x-request-id': headers['x-request-id']
      },
      queryParams
    });

    // Processar webhook com validação de assinatura
    const result = await mercadopagoService.processWebhook(webhookData, headers, queryParams);

    if (result.success) {
      // Processar o pagamento aprovado automaticamente
      await processApprovedPayment(result);
      
      // Resposta obrigatória conforme documentação (HTTP 200 ou 201)
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso',
        data: {
          paymentId: result.paymentId,
          status: result.status,
          action: result.action
        }
      });
    } else {
      // Resposta de erro, mas ainda HTTP 200 para evitar reenvios
      res.status(200).json({
        success: false,
        message: 'Webhook não processado',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Resposta de erro, mas HTTP 200 para evitar reenvios do Mercado Pago
    res.status(200).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}

/**
 * Processar pagamento aprovado automaticamente
 */
async function processApprovedPayment(paymentResult) {
  try {
    const { externalReference, status } = paymentResult;
    
    if (status === 'approved' && externalReference) {
      // Extrair informações do external_reference
      const [type, clientId, queueId] = externalReference.split('-');
      
      if (type === 'advance' && clientId && queueId) {
        console.log(`🚀 Processando avanço automático para cliente ${clientId} na fila ${queueId}`);
        
        // Buscar fila
        const queue = await Queue.findById(queueId);
        if (!queue) {
          console.error('❌ Fila não encontrada:', queueId);
          return;
        }

        // Buscar cliente na fila
        const redisService = await import('../services/redis.js');
        const clients = await redisService.default.getQueueClients(queueId);
        const clientInQueue = clients.find(client => client.id === clientId);
        
        if (!clientInQueue) {
          console.error('❌ Cliente não encontrado na fila:', clientId);
          return;
        }

        // Avançar cliente automaticamente
        const advanceResult = await queue.advanceClientVertically(clientId, 1); // Avançar 1 posição
        
        if (advanceResult.success) {
          console.log(`✅ Cliente ${clientId} avançado automaticamente para posição ${advanceResult.newPosition}`);
        } else {
          console.error('❌ Erro ao avançar cliente:', advanceResult.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
  }
}

/**
 * Processar URLs de retorno do Mercado Pago
 * Extrai parâmetros úteis das back_urls
 */
async function handleReturnUrl(req, res) {
  try {
    const { 
      payment_id, 
      status, 
      external_reference, 
      merchant_order_id,
      preference_id,
      payment_type,
      collection_status
    } = req.query;

    console.log('🔗 URL de retorno recebida:', {
      payment_id,
      status,
      external_reference,
      merchant_order_id,
      preference_id,
      payment_type,
      collection_status
    });

    // Processar baseado no status
    if (status === 'approved') {
      console.log('✅ Pagamento aprovado via URL de retorno');
      // Aqui você pode processar o pagamento aprovado
      await processApprovedPayment({
        externalReference: external_reference,
        status: 'approved',
        paymentId: payment_id
      });
    } else if (status === 'pending') {
      console.log('⏳ Pagamento pendente via URL de retorno');
      // Pagamento offline ou pendente
    } else if (status === 'rejected') {
      console.log('❌ Pagamento rejeitado via URL de retorno');
      // Pagamento rejeitado
    }

    res.json({
      success: true,
      message: 'URL de retorno processada',
      data: {
        payment_id,
        status,
        external_reference,
        merchant_order_id,
        preference_id,
        payment_type,
        collection_status
      }
    });
  } catch (error) {
    console.error('❌ Erro ao processar URL de retorno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

export {
  createAdvancePreference,
  createSubscriptionPreference,
  getPaymentStatus,
  processWebhook,
  handleReturnUrl
};

export default {
  createAdvancePreference,
  createSubscriptionPreference,
  getPaymentStatus,
  processWebhook,
  handleReturnUrl
};