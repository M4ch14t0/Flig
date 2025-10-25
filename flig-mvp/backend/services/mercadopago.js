// SDK do Mercado Pago
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
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
      
      // Configurar preferência seguindo a documentação oficial
      const preference = {
        items: [
          {
            title: `Avançar ${positions} posição(ões) na fila`,
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
        external_reference: `advance-${clientId}-${queueId}-${Date.now()}`,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/mercadopago`
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
      // Validar assinatura do webhook
      const isValidSignature = this.validateWebhookSignature(headers, queryParams);
      if (!isValidSignature) {
        console.error('❌ Assinatura do webhook inválida');
        return {
          success: false,
          error: 'Assinatura inválida'
        };
      }

      const { type, data, action } = webhookData;
      
      console.log(`🔔 Webhook recebido - Tipo: ${type}, Ação: ${action}, ID: ${data?.id}`);
      
      if (type === 'payment') {
        const paymentId = data.id;
        const paymentStatus = await this.getPaymentStatus(paymentId);
        
        if (paymentStatus.success) {
          console.log('💰 Pagamento processado:', paymentStatus);
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
  validateWebhookSignature(headers, queryParams) {
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
      const crypto = require('crypto');
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      
      if (!secret) {
        console.error('❌ MERCADOPAGO_WEBHOOK_SECRET não configurado');
        return false;
      }

      const generatedHash = crypto
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
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/mercadopago`
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
}

export default new MercadoPagoService();