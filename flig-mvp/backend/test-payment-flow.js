#!/usr/bin/env node

/**
 * Script para Testar Fluxo Completo de Pagamento
 * 
 * Este script testa todo o fluxo de pagamento após
 * configurar as variáveis de ambiente no Railway
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';

async function testPaymentFlow() {
  try {
    console.log('🧪 TESTANDO FLUXO COMPLETO DE PAGAMENTO');
    console.log('======================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    
    // 1. Fazer login como estabelecimento
    console.log('\n1️⃣ Fazendo login como estabelecimento...');
    
    const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/establishment`, {
      email_empresa: 'testeestab@email.com',
      senha_empresa: 'Abcd1234'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // 2. Criar preferência de pagamento
    console.log('\n2️⃣ Criando preferência de pagamento...');
    
    const preferenceResponse = await axios.post(`${RAILWAY_API_URL}/api/payments/advance-preference`, {
      queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
      positions: 1
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Preferência criada com sucesso!');
    const preferenceData = preferenceResponse.data.data;
    
    // 3. Verificar URLs de retorno
    console.log('\n3️⃣ Verificando URLs de retorno...');
    
    if (preferenceData.initPoint) {
      console.log('🔗 Init Point:', preferenceData.initPoint);
      console.log('🔗 Sandbox Init Point:', preferenceData.sandboxInitPoint);
      
      // Verificar se as URLs contêm o domínio correto
      const hasCorrectDomain = preferenceData.initPoint.includes('flig.vercel.app');
      const hasLocalhost = preferenceData.initPoint.includes('localhost');
      
      if (hasCorrectDomain) {
        console.log('✅ URLs de retorno configuradas corretamente!');
        console.log('   → Usando domínio de produção: flig.vercel.app');
      } else if (hasLocalhost) {
        console.log('❌ URLs de retorno ainda usando localhost!');
        console.log('   → Configure FRONTEND_URL no Railway');
      } else {
        console.log('⚠️ URLs de retorno não identificadas');
      }
    }
    
    // 4. Testar webhook
    console.log('\n4️⃣ Testando webhook...');
    
    const webhookData = {
      type: 'payment',
      data: { id: '123456789' },
      action: 'payment.created'
    };
    
    try {
      const webhookResponse = await axios.post(`${RAILWAY_API_URL}/api/payments/webhooks/mercadopago`, webhookData, {
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'ts=1234567890,v1=test-signature',
          'x-request-id': 'test-request-id'
        }
      });
      
      console.log('✅ Webhook processado:', webhookResponse.data);
    } catch (error) {
      console.log('⚠️ Webhook com problema:', error.response?.data?.message || error.message);
    }
    
    // 5. Testar URL de retorno
    console.log('\n5️⃣ Testando URL de retorno...');
    
    try {
      const returnResponse = await axios.get(`${RAILWAY_API_URL}/api/payments/return`, {
        params: {
          payment_id: '123456789',
          status: 'approved',
          external_reference: 'test-ref'
        }
      });
      
      console.log('✅ URL de retorno funcionando:', returnResponse.data);
    } catch (error) {
      console.log('❌ Erro na URL de retorno:', error.response?.data || error.message);
    }
    
    // 6. Resumo final
    console.log('\n📊 RESUMO DO TESTE');
    console.log('==================');
    
    const issues = [];
    
    if (preferenceData.initPoint && preferenceData.initPoint.includes('localhost')) {
      issues.push('❌ URLs de retorno usando localhost');
    }
    
    if (issues.length === 0) {
      console.log('✅ Todas as configurações estão corretas!');
      console.log('🎉 O pagamento deve funcionar normalmente');
    } else {
      console.log('⚠️ Problemas encontrados:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    
    if (issues.length > 0) {
      console.log('1. Configure as variáveis no Railway:');
      console.log('   FRONTEND_URL=https://flig.vercel.app');
      console.log('   BACKEND_URL=https://flig-production.up.railway.app');
      console.log('2. Reinicie o serviço no Railway');
      console.log('3. Execute este script novamente');
    } else {
      console.log('1. Teste o pagamento no frontend');
      console.log('2. Verifique se o redirecionamento funciona');
      console.log('3. Monitore os logs do Railway');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar script
testPaymentFlow();
