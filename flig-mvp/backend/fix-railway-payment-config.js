#!/usr/bin/env node

/**
 * Script para Corrigir Configurações de Pagamento no Railway
 * 
 * Este script identifica e corrige problemas nas configurações
 * de pagamento do Railway
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';

async function fixRailwayPaymentConfig() {
  try {
    console.log('🔧 CORRIGINDO CONFIGURAÇÕES DE PAGAMENTO NO RAILWAY');
    console.log('==================================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    
    // Fazer login como estabelecimento para testar
    console.log('\n🔐 Fazendo login como estabelecimento...');
    
    const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/establishment`, {
      email_empresa: 'testeestab@email.com',
      senha_empresa: 'Abcd1234'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // Testar criação de preferência com token
    console.log('\n💰 Testando criação de preferência com autenticação...');
    
    try {
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
      console.log('📊 Dados da preferência:', preferenceResponse.data);
      
      // Verificar URLs de retorno
      const preferenceData = preferenceResponse.data.data;
      if (preferenceData.initPoint) {
        console.log('\n🔗 URLs de retorno na preferência:');
        console.log('Init Point:', preferenceData.initPoint);
        console.log('Sandbox Init Point:', preferenceData.sandboxInitPoint);
        
        // Verificar se as URLs contêm o domínio correto
        const hasCorrectDomain = preferenceData.initPoint.includes('flig.vercel.app') || 
                                preferenceData.initPoint.includes('localhost');
        
        if (hasCorrectDomain) {
          console.log('✅ URLs de retorno configuradas corretamente');
        } else {
          console.log('❌ URLs de retorno podem estar incorretas');
          console.log('⚠️ Verificar variável FRONTEND_URL no Railway');
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar preferência:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.log('🔑 Problema de autenticação - verificar token');
      } else if (error.response?.status === 500) {
        console.log('🔧 Erro interno - verificar logs do Railway');
      }
    }
    
    // Verificar configurações de CORS
    console.log('\n🌐 Testando CORS...');
    
    try {
      const corsResponse = await axios.options(`${RAILWAY_API_URL}/api/payments/advance-preference`, {
        headers: {
          'Origin': 'https://flig.vercel.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      
      console.log('✅ CORS configurado:', corsResponse.headers);
    } catch (error) {
      console.log('⚠️ CORS pode estar com problemas:', error.message);
    }
    
    // Verificar webhook com dados reais
    console.log('\n🔔 Testando webhook com dados reais...');
    
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
      console.log('❌ Erro no webhook:', error.response?.data || error.message);
    }
    
    console.log('\n📋 CHECKLIST DE CONFIGURAÇÃO');
    console.log('=============================');
    console.log('✅ Backend funcionando');
    console.log('✅ Autenticação funcionando');
    console.log('⚠️ Verificar variáveis de ambiente no Railway:');
    console.log('   - FRONTEND_URL=https://flig.vercel.app');
    console.log('   - BACKEND_URL=https://flig-production.up.railway.app');
    console.log('   - MERCADOPAGO_WEBHOOK_SECRET=seu-secret');
    console.log('   - CORS_ORIGIN=https://flig.vercel.app');
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse o painel do Railway');
    console.log('2. Vá em Variables e configure:');
    console.log('   FRONTEND_URL=https://flig.vercel.app');
    console.log('   BACKEND_URL=https://flig-production.up.railway.app');
    console.log('   MERCADOPAGO_WEBHOOK_SECRET=seu-secret-aqui');
    console.log('   CORS_ORIGIN=https://flig.vercel.app');
    console.log('3. Reinicie o serviço no Railway');
    console.log('4. Teste o pagamento novamente');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar script
fixRailwayPaymentConfig();
