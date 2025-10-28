import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function checkPaymentUrls() {
    console.log('🔍 Verificando URLs de pagamento no Railway...\n');

    try {
        // 1. Login
        console.log('1. Fazendo login...');
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;
        console.log('✅ Login realizado');

        // 2. Criar preferência e verificar URLs
        console.log('\n2. Criando preferência...');
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
            positions: 5
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Preferência criada');
        console.log('\n📋 URLs geradas:');
        console.log('Preferência ID:', preferenceResponse.data.data.preferenceId);
        console.log('URL de Pagamento:', preferenceResponse.data.data.initPoint);
        console.log('URL Sandbox:', preferenceResponse.data.data.sandboxInitPoint);

        // 3. Verificar se as URLs contêm localhost
        const initPoint = preferenceResponse.data.data.initPoint;
        if (initPoint.includes('localhost')) {
            console.log('\n❌ PROBLEMA: URL contém localhost!');
            console.log('Isso indica que as variáveis de ambiente não estão configuradas no Railway');
        } else {
            console.log('\n✅ URLs não contêm localhost - configuração correta');
        }

        // 4. Verificar variáveis de ambiente (se possível)
        console.log('\n3. Verificando configuração...');
        console.log('Para verificar as variáveis de ambiente no Railway:');
        console.log('1. Acesse o dashboard do Railway');
        console.log('2. Vá para Variables');
        console.log('3. Verifique se estão definidas:');
        console.log('   - FRONTEND_URL=https://flig-frontend.vercel.app');
        console.log('   - BACKEND_URL=https://flig-production.up.railway.app');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkPaymentUrls();
