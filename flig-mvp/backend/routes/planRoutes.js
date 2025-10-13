const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const paymentController = require('../controllers/paymentController');
const { checkPlanActive, optionalPlanCheck } = require('../middleware/planCheck');
const { authenticateToken } = require('../middleware/auth');

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
router.post('/payment/preference', paymentController.createPaymentPreference);
router.get('/payment/status/:paymentId', paymentController.checkPaymentStatus);

module.exports = router;
