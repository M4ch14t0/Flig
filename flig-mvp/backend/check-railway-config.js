#!/usr/bin/env node

/**
 * Script para Verificar Configurações do Railway
 * 
 * Este script verifica as variáveis de ambiente e configurações
 * do Railway para identificar problemas de pagamento
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';

async function checkRailwayConfig() {
  try {
    console.log('🔍 VERIFICANDO CONFIGURAÇÕES DO RAILWAY');
    console.log('=====================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    
    // 1. Verificar se o backend está funcionando
    console.log('\n1️⃣ Verificando saúde do backend...');
    try {
      const healthResponse = await axios.get(`${RAILWAY_API_URL}/health`);
      console.log('✅ Backend está funcionando:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend não está respondendo:', error.message);
      return;
    }
    
    // 2. Verificar configurações de pagamento
    console.log('\n2️⃣ Verificando configurações de pagamento...');
    try {
      const configResponse = await axios.get(`${RAILWAY_API_URL}/api/payments/config`);
      console.log('✅ Configurações de pagamento:', configResponse.data);
    } catch (error) {
      console.log('⚠️ Endpoint de configuração não encontrado');
    }
    
    // 3. Testar criação de preferência
    console.log('\n3️⃣ Testando criação de preferência...');
    try {
      const preferenceResponse = await axios.post(`${RAILWAY_API_URL}/api/payments/advance-preference`, {
        queueId: 'test-queue-id',
        positions: 1
      });
      console.log('✅ Preferência criada:', preferenceResponse.data);
    } catch (error) {
      console.log('❌ Erro ao criar preferência:', error.response?.data || error.message);
    }
    
    // 4. Verificar webhook
    console.log('\n4️⃣ Testando webhook...');
    try {
      const webhookResponse = await axios.post(`${RAILWAY_API_URL}/api/payments/webhooks/mercadopago`, {
        type: 'payment',
        data: { id: '123456789' },
        action: 'payment.created'
      });
      console.log('✅ Webhook funcionando:', webhookResponse.data);
    } catch (error) {
      console.log('❌ Erro no webhook:', error.response?.data || error.message);
    }
    
    // 5. Verificar URLs de retorno
    console.log('\n5️⃣ Testando URLs de retorno...');
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
    
    console.log('\n📊 DIAGNÓSTICO COMPLETO');
    console.log('========================');
    console.log('✅ Backend: Funcionando');
    console.log('⚠️ Configurações: Verificar variáveis de ambiente');
    console.log('⚠️ URLs: Verificar FRONTEND_URL e BACKEND_URL');
    console.log('⚠️ Webhook: Verificar MERCADOPAGO_WEBHOOK_SECRET');
    
    console.log('\n🔧 POSSÍVEIS PROBLEMAS');
    console.log('======================');
    console.log('1. FRONTEND_URL não configurada no Railway');
    console.log('2. BACKEND_URL não configurada no Railway');
    console.log('3. MERCADOPAGO_WEBHOOK_SECRET não configurada');
    console.log('4. URLs de retorno incorretas');
    console.log('5. CORS não configurado para o frontend');
    
    console.log('\n🛠️ SOLUÇÕES RECOMENDADAS');
    console.log('========================');
    console.log('1. Configurar no Railway:');
    console.log('   FRONTEND_URL=https://flig.vercel.app');
    console.log('   BACKEND_URL=https://flig-production.up.railway.app');
    console.log('   MERCADOPAGO_WEBHOOK_SECRET=seu-secret-aqui');
    console.log('2. Verificar CORS_ORIGIN no Railway');
    console.log('3. Testar webhook no painel do Mercado Pago');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar script
checkRailwayConfig();
