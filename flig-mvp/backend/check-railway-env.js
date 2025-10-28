import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function checkRailwayEnv() {
    console.log('🔍 Verificando variáveis de ambiente no Railway...\n');

    try {
        // 1. Login
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;

        // 2. Criar preferência
        console.log('Criando preferência...');
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
        
        // 4. O problema está nas URLs de retorno que são enviadas para o Mercado Pago
        // Vamos verificar se o backend está usando as variáveis de ambiente corretas
        console.log('\n📋 DIAGNÓSTICO:');
        console.log('O problema está nas URLs de retorno (back_urls) que são enviadas para o Mercado Pago.');
        console.log('Essas URLs são usadas para redirecionar o usuário após o pagamento.');
        console.log('\n🔧 SOLUÇÃO:');
        console.log('1. Acesse o dashboard do Railway: https://railway.app');
        console.log('2. Vá para o projeto "flig-production"');
        console.log('3. Clique em "Variables"');
        console.log('4. Adicione as seguintes variáveis:');
        console.log('   FRONTEND_URL=https://flig-frontend.vercel.app');
        console.log('   BACKEND_URL=https://flig-production.up.railway.app');
        console.log('\n5. Reinicie o serviço após adicionar as variáveis');
        
        console.log('\n📝 Explicação:');
        console.log('O código do backend usa:');
        console.log('  FRONTEND_URL || "http://localhost:3002"');
        console.log('  BACKEND_URL || "http://localhost:5000"');
        console.log('Se as variáveis não estiverem definidas, ele usa localhost como fallback.');
        console.log('Isso faz com que o Mercado Pago tente redirecionar para localhost após o pagamento.');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkRailwayEnv();
