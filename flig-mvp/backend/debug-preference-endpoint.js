import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function debugPreferenceEndpoint() {
    console.log('🔍 Debugando endpoint de preferência...\n');

    try {
        // 1. Login
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;

        // 2. Criar preferência com debug
        console.log('Criando preferência...');
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
            positions: 5
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('\n📋 Resposta completa da API:');
        console.log(JSON.stringify(preferenceResponse.data, null, 2));

        // 3. Verificar se há informações sobre as URLs de retorno
        const data = preferenceResponse.data.data;
        if (data.initPoint) {
            console.log('\n🔗 URL de pagamento:', data.initPoint);
            
            // Extrair preference ID da URL
            const url = new URL(data.initPoint);
            const prefId = url.searchParams.get('pref_id');
            console.log('Preference ID extraído:', prefId);
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

debugPreferenceEndpoint();
