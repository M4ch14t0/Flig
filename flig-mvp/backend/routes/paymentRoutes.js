import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

// Rotas para pagamentos com Mercado Pago

/**
 * @route POST /api/payments/advance-preference
 * @desc Criar preferência de pagamento para avanço na fila
 * @access Private (Cliente)
 */
router.post('/advance-preference', 
  authenticateToken,
  paymentController.createAdvancePreference
);

/**
 * @route POST /api/payments/subscription-preference
 * @desc Criar preferência de pagamento para assinatura
 * @access Private (Cliente)
 */
router.post('/subscription-preference',
  authenticateToken,
  paymentController.createSubscriptionPreference
);

/**
 * @route GET /api/payments/status/:paymentId
 * @desc Verificar status de um pagamento
 * @access Private
 */
router.get('/status/:paymentId',
  authenticateToken,
  paymentController.getPaymentStatus
);

/**
 * @route POST /api/webhooks/mercadopago
 * @desc Webhook do Mercado Pago para notificações de pagamento
 * @access Public (sem autenticação - webhook)
 */
router.post('/webhooks/mercadopago',
  paymentController.processWebhook
);

/**
 * @route GET /api/payments/return
 * @desc Processar URLs de retorno do Mercado Pago
 * @access Public (sem autenticação - retorno do Mercado Pago)
 */
router.get('/return',
  paymentController.handleReturnUrl
);

export default router;
