import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function diagnosePaymentIssues() {
    console.log('🔍 Diagnosticando problemas de pagamento no Railway...\n');

    try {
        // 1. Verificar se o backend está respondendo
        console.log('1. Verificando saúde do backend...');
        const healthResponse = await axios.get(`${RAILWAY_BACKEND_URL}/api/health`, {
            timeout: 10000
        });
        console.log('✅ Backend está respondendo:', healthResponse.status);

        // 2. Testar login de estabelecimento
        console.log('\n2. Testando login de estabelecimento...');
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        console.log('✅ Login bem-sucedido');
        console.log('Resposta do login:', loginResponse.data);
        const token = loginResponse.data.data.token;

        // 3. Listar filas existentes
        console.log('\n3. Listando filas existentes...');
        const queuesResponse = await axios.get(`${RAILWAY_BACKEND_URL}/api/queues/establishment/4`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Filas encontradas:', queuesResponse.data);
        const queueId = queuesResponse.data.data[0]?.id || 1;

        // 4. Testar criação de preferência de pagamento
        console.log('\n4. Testando criação de preferência de pagamento...');
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: queueId,
            positions: 5
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Preferência criada com sucesso');
        console.log('Resposta completa:', JSON.stringify(preferenceResponse.data, null, 2));
        console.log('Preferência ID:', preferenceResponse.data.data.preferenceId);
        console.log('URL de retorno:', preferenceResponse.data.data.initPoint);

        // 5. Verificar URLs de retorno
        console.log('\n5. Verificando URLs de retorno...');
        const preference = preferenceResponse.data.data;
        if (preference.initPoint) {
            console.log('URL de pagamento:', preference.initPoint);
            
            // Verificar se as URLs contêm localhost
            if (preference.initPoint.includes('localhost')) {
                console.log('❌ PROBLEMA: URL contém localhost - variáveis de ambiente incorretas');
            } else {
                console.log('✅ URL não contém localhost');
            }
        }

        // 6. Testar webhook
        console.log('\n6. Testando webhook...');
        const webhookResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/webhooks/mercadopago`, {
            type: 'payment',
            data: {
                id: '123456789'
            }
        });
        console.log('✅ Webhook respondendo:', webhookResponse.status);

        // 7. Verificar CORS
        console.log('\n7. Verificando CORS...');
        const corsResponse = await axios.options(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            headers: {
                'Origin': 'https://flig-frontend.vercel.app',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        console.log('✅ CORS configurado:', corsResponse.status);

    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

// Executar diagnóstico
diagnosePaymentIssues();
