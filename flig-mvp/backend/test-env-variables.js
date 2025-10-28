import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function testEnvVariables() {
    console.log('🔍 Testando variáveis de ambiente no Railway...\n');

    try {
        // 1. Login
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;

        // 2. Criar preferência
        console.log('Criando preferência para verificar URLs...');
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
            positions: 5
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Preferência criada');
        
        // 3. Verificar se as URLs contêm localhost
        const initPoint = preferenceResponse.data.data.initPoint;
        console.log('\n🔗 URL de pagamento:', initPoint);
        
        // 4. Tentar acessar a URL de pagamento para ver o que o Mercado Pago mostra
        console.log('\n🌐 Testando URL de pagamento...');
        try {
            const mpResponse = await axios.get(initPoint, {
                maxRedirects: 0,
                validateStatus: (status) => status < 400
            });
            console.log('Status da URL:', mpResponse.status);
            console.log('Headers:', mpResponse.headers);
        } catch (redirectError) {
            if (redirectError.response?.status === 302 || redirectError.response?.status === 301) {
                console.log('✅ URL redireciona corretamente (status:', redirectError.response.status, ')');
                console.log('Location:', redirectError.response.headers.location);
            } else {
                console.log('❌ Erro ao acessar URL:', redirectError.message);
            }
        }

        // 5. Verificar se o problema está nas variáveis de ambiente
        console.log('\n📋 Diagnóstico:');
        console.log('Se as URLs de retorno contêm localhost, significa que:');
        console.log('1. FRONTEND_URL não está definida no Railway');
        console.log('2. BACKEND_URL não está definida no Railway');
        console.log('\nPara corrigir:');
        console.log('1. Acesse o dashboard do Railway');
        console.log('2. Vá para Variables');
        console.log('3. Adicione:');
        console.log('   FRONTEND_URL=https://flig-frontend.vercel.app');
        console.log('   BACKEND_URL=https://flig-production.up.railway.app');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testEnvVariables();
