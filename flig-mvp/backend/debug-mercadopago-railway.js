import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function debugMercadoPagoRailway() {
    console.log('🔍 Debugando Mercado Pago no Railway...\n');

    try {
        // 1. Verificar saúde do backend
        console.log('1. Verificando saúde do backend...');
        const healthResponse = await axios.get(`${RAILWAY_BACKEND_URL}/api/health`);
        console.log('✅ Backend respondendo:', healthResponse.status);

        // 2. Login de estabelecimento
        console.log('\n2. Fazendo login...');
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;
        console.log('✅ Login realizado');

        // 3. Testar criação de preferência
        console.log('\n3. Testando criação de preferência...');
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
            positions: 5
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Preferência criada');
        console.log('Preferência ID:', preferenceResponse.data.data.preferenceId);
        console.log('URL de pagamento:', preferenceResponse.data.data.initPoint);

        // 4. Verificar se as URLs contêm localhost
        const initPoint = preferenceResponse.data.data.initPoint;
        if (initPoint.includes('localhost')) {
            console.log('\n❌ PROBLEMA: URL contém localhost!');
            console.log('Isso indica que as variáveis de ambiente não estão configuradas.');
        } else {
            console.log('\n✅ URL não contém localhost');
        }

        // 5. Testar acesso à URL de pagamento
        console.log('\n4. Testando acesso à URL de pagamento...');
        try {
            const mpResponse = await axios.get(initPoint, {
                maxRedirects: 0,
                validateStatus: (status) => status < 400
            });
            console.log('✅ URL de pagamento acessível');
        } catch (redirectError) {
            if (redirectError.response?.status === 302 || redirectError.response?.status === 301) {
                console.log('✅ URL redireciona corretamente');
            } else {
                console.log('❌ Erro ao acessar URL:', redirectError.message);
            }
        }

        // 6. Verificar configuração do Mercado Pago
        console.log('\n5. Verificando configuração do Mercado Pago...');
        console.log('Para verificar se o problema é de configuração:');
        console.log('1. Verifique se MERCADOPAGO_ACCESS_TOKEN está configurado no Railway');
        console.log('2. Verifique se MERCADOPAGO_WEBHOOK_SECRET está configurado no Railway');
        console.log('3. Verifique se FRONTEND_URL e BACKEND_URL estão configurados no Railway');

        // 7. Testar webhook
        console.log('\n6. Testando webhook...');
        try {
            const webhookResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/webhooks/mercadopago`, {
                type: 'payment',
                data: { id: '123456789' }
            });
            console.log('✅ Webhook respondendo:', webhookResponse.status);
        } catch (webhookError) {
            console.log('❌ Erro no webhook:', webhookError.message);
        }

        // 8. Verificar se o problema é específico do Railway
        console.log('\n7. Diagnóstico específico do Railway:');
        console.log('Problemas comuns no Railway:');
        console.log('- Variáveis de ambiente não configuradas');
        console.log('- Timeout de rede');
        console.log('- Configuração de CORS');
        console.log('- Limitações de memória/CPU');
        console.log('- Problemas com SSL/TLS');

    } catch (error) {
        console.error('❌ Erro durante debug:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        
        // Análise específica do erro
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔍 Análise: Erro de conexão - backend pode estar offline');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n🔍 Análise: Timeout - problema de rede ou backend lento');
        } else if (error.response?.status === 500) {
            console.log('\n🔍 Análise: Erro interno do servidor - verificar logs do Railway');
        } else if (error.response?.status === 401) {
            console.log('\n🔍 Análise: Erro de autenticação - verificar token');
        }
    }
}

debugMercadoPagoRailway();
