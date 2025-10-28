import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function testRailwayMercadoPago() {
    console.log('🔍 Testando Mercado Pago especificamente no Railway...\n');

    try {
        // 1. Login
        console.log('1. Fazendo login...');
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;
        console.log('✅ Login realizado');

        // 2. Criar preferência
        console.log('\n2. Criando preferência...');
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

        // 3. Verificar se as URLs de retorno estão corretas
        console.log('\n3. Verificando URLs de retorno...');
        
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
                
                // Verificar se a URL de redirecionamento contém localhost ou URLs incorretas
                const location = redirectError.response.headers.location;
                if (location.includes('localhost')) {
                    console.log('❌ PROBLEMA: URL de redirecionamento contém localhost!');
                } else if (location.includes('ngrok')) {
                    console.log('❌ PROBLEMA: URL de redirecionamento contém ngrok!');
                } else if (location.includes('flig.vercel.app')) {
                    console.log('❌ PROBLEMA: URL de redirecionamento contém domínio incorreto!');
                } else {
                    console.log('✅ URL de redirecionamento parece correta');
                }
            } else {
                console.log('❌ Erro ao acessar URL:', redirectError.message);
            }
        }

        // 4. Testar webhook
        console.log('\n4. Testando webhook...');
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
            console.log('✅ Webhook respondendo:', webhookResponse.status);
            console.log('Resposta:', webhookResponse.data);
        } catch (webhookError) {
            console.log('❌ Erro no webhook:', webhookError.message);
            if (webhookError.response) {
                console.log('Status:', webhookError.response.status);
                console.log('Data:', webhookError.response.data);
            }
        }

        // 5. Diagnóstico final
        console.log('\n5. Diagnóstico final:');
        console.log('Se o problema persiste, verifique:');
        console.log('1. Variáveis de ambiente no Railway:');
        console.log('   - FRONTEND_URL=https://flig-frontend.vercel.app');
        console.log('   - BACKEND_URL=https://flig-production.up.railway.app');
        console.log('2. Se as URLs de retorno estão corretas');
        console.log('3. Se o webhook está configurado corretamente');
        console.log('4. Se há problemas de CORS');

    } catch (error) {
        console.error('❌ Erro durante teste:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testRailwayMercadoPago();
