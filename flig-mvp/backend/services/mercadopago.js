// SDK do Mercado Pago
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import redisService from './redis.js';
import dotenv from 'dotenv';
dotenv.config();

class MercadoPagoService {
  constructor() {
    this.client = null;
    this.preference = null;
    this.payment = null;
    this.initialize();
  }

  initialize() {
    try {
      // Configurar cliente do Mercado Pago
      this.client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        options: {
          sandbox: process.env.MERCADOPAGO_SANDBOX === 'true'
        }
      });

      // Inicializar serviços
      this.preference = new Preference(this.client);
      this.payment = new Payment(this.client);

      console.log('✅ Mercado Pago SDK inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Mercado Pago SDK:', error);
      throw error;
    }
  }

  /**
   * Criar preferência de pagamento para avanço na fila
   * Seguindo a documentação oficial do Mercado Pago
   */
  async createAdvancePreference(advanceData) {
    try {
      const { clientId, queueId, positions, amount, clientInfo } = advanceData;
      
      // Configurar preferência seguindo a implementação do seu amigo
      const preference = {
        items: [
          {
            id: `advance-${clientId}`,
            title: `Avançar ${positions} posição(ões) na fila`,
            description: `Avançar ${positions} posição(ões) na fila`,
            quantity: 1,
            unit_price: amount
          }
        ],
        payer: {
          name: clientInfo.nome,
          email: clientInfo.email,
          phone: {
            number: clientInfo.telefone
          }
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/cliente/minhas-filas`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/cliente/minhas-filas`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/cliente/minhas-filas`
        },
        external_reference: `advance-${clientId}-${queueId}-${positions}-${Date.now()}`,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhooks/mercadopago`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expira em 24h
        // Forçar modo sandbox para testes
        sandbox_mode: true
      };

      // Criar preferência usando o método da documentação
      const result = await this.preference.create({
        body: preference
      });
      
      console.log('✅ Preferência de pagamento criada:', result.id);
      console.log('🔗 Init Point:', result.init_point);
      console.log('🔗 Sandbox Init Point:', result.sandbox_init_point);
      
      return {
        success: true,
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
      };
    } catch (error) {
      console.error('❌ Erro ao criar preferência de pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar status de um pagamento
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await this.payment.get({ id: paymentId });
      
      return {
        success: true,
        status: payment.status,
        statusDetail: payment.status_detail,
        transactionAmount: payment.transaction_amount,
        externalReference: payment.external_reference,
        payment: payment
      };
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar webhook do Mercado Pago
   * Implementa validação de assinatura conforme documentação oficial
   */
  async processWebhook(webhookData, headers, queryParams) {
    try {
      // Validar assinatura do webhook (desabilitado em ambiente de teste)
      if (process.env.NODE_ENV === 'production') {
        const isValidSignature = await this.validateWebhookSignature(headers, queryParams);
        if (!isValidSignature) {
          console.error('❌ Assinatura do webhook inválida');
          return {
            success: false,
            error: 'Assinatura inválida'
          };
        }
      } else {
        console.log('⚠️ Validação de assinatura desabilitada em ambiente de teste');
      }

      const { type, data, action } = webhookData;
      
      console.log(`🔔 Webhook recebido - Tipo: ${type}, Ação: ${action}, ID: ${data?.id}`);
      
      if (type === 'payment') {
        const paymentId = data.id;
        const paymentStatus = await this.getPaymentStatus(paymentId);
        
        if (paymentStatus.success) {
          console.log('💰 Pagamento processado:', paymentStatus);
          
          // Processar avanço na fila se o pagamento foi aprovado
          if (paymentStatus.status === 'approved' && paymentStatus.externalReference) {
            try {
              await this.processQueueAdvance(paymentStatus.externalReference);
              console.log('✅ Usuário avançado na fila automaticamente');
            } catch (error) {
              console.error('❌ Erro ao processar avanço na fila:', error);
            }
          }
          
          return {
            success: true,
            paymentId,
            status: paymentStatus.status,
            externalReference: paymentStatus.externalReference,
            action: action
          };
        }
      }
      
      return {
        success: false,
        message: 'Webhook não processado'
      };
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validar assinatura do webhook do Mercado Pago
   * Seguindo a documentação oficial para validação de segurança
   */
  async validateWebhookSignature(headers, queryParams) {
    try {
      const xSignature = headers['x-signature'];
      const xRequestId = headers['x-request-id'];
      
      if (!xSignature || !xRequestId) {
        console.error('❌ Headers de assinatura não encontrados');
        return false;
      }

      // Extrair timestamp e hash do header x-signature
      const signatureParts = xSignature.split(',');
      let ts = null;
      let hash = null;

      signatureParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'ts') {
          ts = value;
        } else if (key === 'v1') {
          hash = value;
        }
      });

      if (!ts || !hash) {
        console.error('❌ Timestamp ou hash não encontrados na assinatura');
        return false;
      }

      // Obter data.id dos query params
      const dataId = queryParams['data.id'] || '';
      
      // Gerar template de assinatura conforme documentação
      const signatureTemplate = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      
      // Gerar HMAC SHA256
      const crypto = await import('crypto');
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      
      if (!secret) {
        console.error('❌ MERCADOPAGO_WEBHOOK_SECRET não configurado');
        return false;
      }

      const generatedHash = crypto.default
        .createHmac('sha256', secret)
        .update(signatureTemplate)
        .digest('hex');

      // Comparar hashes
      const isValid = generatedHash === hash;
      
      if (isValid) {
        console.log('✅ Assinatura do webhook validada com sucesso');
      } else {
        console.error('❌ Assinatura do webhook inválida');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Erro ao validar assinatura do webhook:', error);
      return false;
    }
  }

  /**
   * Criar preferência para pagamento de assinatura
   * Seguindo a documentação oficial do Mercado Pago
   */
  async createSubscriptionPreference(subscriptionData) {
    try {
      const { planId, planName, amount, clientInfo } = subscriptionData;
      
      // Configurar preferência seguindo a documentação oficial
      const preference = {
        items: [
          {
            title: `Assinatura ${planName}`,
            quantity: 1,
            unit_price: amount
          }
        ],
        payer: {
          name: clientInfo.nome,
          email: clientInfo.email,
          phone: {
            number: clientInfo.telefone
          }
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cliente/minhas-filas`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cliente/minhas-filas`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cliente/minhas-filas`
        },
        external_reference: `subscription-${planId}-${Date.now()}`,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhooks/mercadopago`
      };

      // Criar preferência usando o método da documentação
      const result = await this.preference.create({
        body: preference
      });
      
      console.log('✅ Preferência de assinatura criada:', result.id);
      console.log('🔗 Init Point:', result.init_point);
      console.log('🔗 Sandbox Init Point:', result.sandbox_init_point);
      
      return {
        success: true,
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
      };
    } catch (error) {
      console.error('❌ Erro ao criar preferência de assinatura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar avanço na fila após pagamento aprovado
   */
  async processQueueAdvance(externalReference) {
    try {
      console.log(`🔍 Processando externalReference: ${externalReference}`);

      // Regex flexível para qualquer tipo de ID (UUID, string, número)
      const match = externalReference.match(/^advance-(.+?)-(.+?)-(\d+)-(\d+)$/);
      
      console.log(`🔍 Match result:`, match);
      
      if (!match) {
        throw new Error('External reference inválido');
      }
      
      const userId = match[1];
      const queueId = match[2];
      const positions = Number(match[3]);
      const timestamp = match[4];
      
      console.log(`🔄 Processando avanço: Fila ${queueId}, Usuário ${userId}, ${positions} posições, timestamp ${timestamp}`);

      // Importar o modelo Queue
      const Queue = (await import('../models/Queue.js')).default;
      
      // Buscar a fila
      const queue = await Queue.findById(queueId);
      if (!queue) {
        throw new Error('Fila não encontrada');
      }

      // Buscar o usuário no banco de dados para obter o email
      const connection = (await import('../config/db.js')).default;
      const userResult = await new Promise((resolve, reject) =>
        connection.query('SELECT email_usuario FROM usuarios WHERE id = ?', [userId], (err, results) => 
          err ? reject(err) : resolve(results)
        )
      );
      
      if (!userResult.length) {
        throw new Error('Usuário não encontrado');
      }
      
      const userEmail = userResult[0].email_usuario;
      console.log(`🔍 Email do usuário: ${userEmail}`);
      
      // Buscar o cliente na fila pelo email
      const clients = await redisService.getQueueClients(queueId);
      const clientInQueue = clients.find(client => {
        return client.email && client.email === userEmail;
      });
      
      if (!clientInQueue) {
        throw new Error('Cliente não encontrado na fila');
      }
      
      console.log(`🔍 Cliente encontrado na fila: ID ${clientInQueue.id}, Nome: ${clientInQueue.nome}`);
      
      // Avançar o usuário na fila usando a nova lógica de subdivisões
      const advanceResult = await queue.advanceClientVertically(clientInQueue.id, positions);
      
      console.log(`✅ Usuário ${userId} avançou ${positions} posições na fila ${queueId}`);
      console.log(`📍 Nova posição: ${advanceResult.newPosition}`);
      
      return {
        success: true,
        newPosition: advanceResult.newPosition,
        queueId,
        userId,
        positions
      };
    } catch (error) {
      console.error('❌ Erro ao processar avanço na fila:', error);
      throw error;
    }
  }
}

export default new MercadoPagoService();