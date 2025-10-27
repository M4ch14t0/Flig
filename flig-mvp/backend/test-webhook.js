/**
 * SCRIPT: Testar webhook do MercadoPago
 * 
 * Este script testa se o webhook está funcionando corretamente
 * e se está processando os pagamentos aprovados.
 */

import mercadopagoService from './services/mercadopago.js';
import redisService from './services/redis.js';

// Simular dados de webhook do MercadoPago
const mockWebhookData = {
  type: 'payment',
  action: 'payment.created',
  data: {
    id: '1234567890'
  }
};

const mockHeaders = {
  'x-signature': 'test-signature',
  'x-request-id': 'test-request-id'
};

const mockQueryParams = {};

async function testWebhook() {
  try {
    console.log('🔍 TESTE: Webhook do MercadoPago');
    console.log('================================');
    
    // Simular processamento do webhook
    console.log('\n📡 Simulando webhook do MercadoPago...');
    console.log('Dados do webhook:', mockWebhookData);
    
    const result = await mercadopagoService.processWebhook(mockWebhookData, mockHeaders, mockQueryParams);
    
    console.log('\n📊 RESULTADO DO WEBHOOK:');
    console.log('========================');
    console.log('Sucesso:', result.success);
    console.log('Payment ID:', result.paymentId);
    console.log('Status:', result.status);
    console.log('External Reference:', result.externalReference);
    console.log('Action:', result.action);
    
    if (result.success) {
      console.log('\n✅ Webhook processado com sucesso!');
    } else {
      console.log('\n❌ Webhook não foi processado');
      console.log('Erro:', result.error || result.message);
    }
    
    console.log('\n🔍 VERIFICAÇÕES ADICIONAIS');
    console.log('==========================');
    
    // Verificar se o serviço está inicializado
    console.log('✅ MercadoPago Service inicializado:', mercadopagoService.client ? 'Sim' : 'Não');
    
    // Verificar configurações
    console.log('🔧 Configurações:');
    console.log('- MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'Não configurado');
    console.log('- MERCADOPAGO_PUBLIC_KEY:', process.env.MERCADOPAGO_PUBLIC_KEY ? 'Configurado' : 'Não configurado');
    console.log('- MERCADOPAGO_SANDBOX:', process.env.MERCADOPAGO_SANDBOX || 'true');
    console.log('- BACKEND_URL:', process.env.BACKEND_URL || 'http://localhost:5000');
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Verifique se o webhook está configurado no MercadoPago');
    console.log('2. Confirme se a URL do webhook está acessível publicamente');
    console.log('3. Teste com um pagamento real em sandbox');
    console.log('4. Verifique os logs do servidor durante o pagamento');
    
  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error);
  } finally {
    // Fechar conexão Redis
    const client = await redisService.getRedisClient();
    if (client) {
      await client.quit();
      console.log('\n🔌 Conexão Redis encerrada');
    }
  }
}

// Executar teste
testWebhook().catch(console.error);
