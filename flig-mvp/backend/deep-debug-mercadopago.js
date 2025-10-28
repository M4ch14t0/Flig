import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function deepDebugMercadoPago() {
    console.log('🔍 Debug profundo do Mercado Pago no Railway...\n');

    try {
        // 1. Verificar configuração do Mercado Pago
        console.log('1. Verificando configuração do Mercado Pago...');
        
        // Testar se o token está funcionando
        const testToken = 'APP_USR-7b82f4ea-52b3-4ce2-b132-c0898d967004';
        try {
            const tokenTest = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
                headers: {
                    'Authorization': `Bearer ${testToken}`
                }
            });
            console.log('✅ Token do Mercado Pago válido');
        } catch (tokenError) {
            console.log('❌ Problema com token do Mercado Pago:', tokenError.message);
        }

        // 2. Login e criação de preferência
        console.log('\n2. Testando fluxo completo...');
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;

        // 3. Criar preferência com logs detalhados
        console.log('\n3. Criando preferência com logs detalhados...');
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
            positions: 5
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Preferência criada');
        const preferenceData = preferenceResponse.data.data;
        console.log('Preferência ID:', preferenceData.preferenceId);
        console.log('URL de pagamento:', preferenceData.initPoint);
        console.log('Valor:', preferenceData.amount);
        console.log('Posições:', preferenceData.positions);

        // 4. Verificar se as URLs de retorno estão corretas
        console.log('\n4. Verificando URLs de retorno...');
        
        // Simular o que o Mercado Pago faria
        try {
            const mpResponse = await axios.get(preferenceData.initPoint, {
                maxRedirects: 0,
                validateStatus: (status) => status < 400,
                timeout: 10000
            });
            console.log('✅ URL de pagamento acessível');
        } catch (redirectError) {
            if (redirectError.response?.status === 302) {
                console.log('✅ URL redireciona corretamente');
                console.log('Location:', redirectError.response.headers.location);
            } else {
                console.log('❌ Erro ao acessar URL:', redirectError.message);
                console.log('Status:', redirectError.response?.status);
                console.log('Headers:', redirectError.response?.headers);
            }
        }

        // 5. Testar webhook com dados reais
        console.log('\n5. Testando webhook com dados reais...');
        try {
            const webhookData = {
                type: 'payment',
                data: {
                    id: '123456789',
                    status: 'approved',
                    external_reference: `advance-1-43a5a297-e7db-4a25-8c4b-7d7e8d2af104-5-${Date.now()}`
                }
            };
            
            const webhookResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/webhooks/mercadopago`, webhookData);
            console.log('✅ Webhook funcionando:', webhookResponse.status);
            console.log('Resposta:', webhookResponse.data);
        } catch (webhookError) {
            console.log('❌ Erro no webhook:', webhookError.message);
            if (webhookError.response) {
                console.log('Status:', webhookError.response.status);
                console.log('Data:', webhookError.response.data);
            }
        }

        // 6. Verificar configuração de CORS
        console.log('\n6. Verificando CORS...');
        try {
            const corsResponse = await axios.options(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
                headers: {
                    'Origin': 'https://flig-frontend.vercel.app',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type,Authorization'
                }
            });
            console.log('✅ CORS funcionando:', corsResponse.status);
            console.log('CORS Headers:', corsResponse.headers);
        } catch (corsError) {
            console.log('❌ Problema com CORS:', corsError.message);
        }

        // 7. Verificar se há problemas específicos do Railway
        console.log('\n7. Verificando problemas específicos do Railway...');
        
        // Testar timeout
        console.log('Testando timeout...');
        const startTime = Date.now();
        try {
            await axios.get(`${RAILWAY_BACKEND_URL}/api/health`, { timeout: 5000 });
            const endTime = Date.now();
            console.log(`✅ Resposta em ${endTime - startTime}ms`);
        } catch (timeoutError) {
            console.log('❌ Timeout:', timeoutError.message);
        }

        // 8. Verificar logs do Railway
        console.log('\n8. Para verificar logs do Railway:');
        console.log('1. Acesse: https://railway.app');
        console.log('2. Vá para o projeto "flig-production"');
        console.log('3. Clique em "Deployments"');
        console.log('4. Clique no último deployment');
        console.log('5. Clique em "View Logs"');
        console.log('6. Procure por erros relacionados ao Mercado Pago');

        // 9. Verificar variáveis de ambiente
        console.log('\n9. Verificando variáveis de ambiente...');
        console.log('Certifique-se de que estão configuradas no Railway:');
        console.log('- MERCADOPAGO_ACCESS_TOKEN');
        console.log('- MERCADOPAGO_WEBHOOK_SECRET');
        console.log('- FRONTEND_URL=https://flig-frontend.vercel.app');
        console.log('- BACKEND_URL=https://flig-production.up.railway.app');
        console.log('- CORS_ORIGIN=https://flig-frontend.vercel.app');

    } catch (error) {
        console.error('❌ Erro durante debug:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        
        // Análise específica do erro
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔍 Análise: Erro de conexão - backend offline');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n🔍 Análise: Timeout - problema de rede');
        } else if (error.response?.status === 500) {
            console.log('\n🔍 Análise: Erro interno - verificar logs do Railway');
        } else if (error.response?.status === 401) {
            console.log('\n🔍 Análise: Erro de autenticação');
        } else if (error.response?.status === 403) {
            console.log('\n🔍 Análise: Erro de permissão - verificar CORS');
        }
    }
}

deepDebugMercadoPago();
