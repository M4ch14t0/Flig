import express from 'express';
const router = express.Router();
import planController from '../controllers/planController.js';
import paymentController from '../controllers/paymentController.js';
import { checkPlanActive, optionalPlanCheck } from '../middleware/planCheck.js';
import { authenticateToken } from '../middleware/auth.js';

// Rotas públicas (não precisam de plano ativo)
router.get('/plans', planController.getPlans);
router.get('/plans/:id', planController.getPlanById);

// Webhook do Mercado Pago (não precisa de autenticação)
router.post('/webhook', paymentController.processWebhook);

// Rotas que precisam de autenticação
router.use(authenticateToken);

// Rotas de planos
router.get('/status', planController.getPlanStatus);
router.get('/subscriptions', planController.getSubscriptionHistory);
router.post('/subscriptions', planController.createSubscription);
router.delete('/subscriptions/:subscriptionId', planController.cancelSubscription);

// Rotas de pagamento
router.post('/payment/preference', paymentController.createAdvancePreference);
router.get('/payment/status/:paymentId', paymentController.getPaymentStatus);

export default router;
