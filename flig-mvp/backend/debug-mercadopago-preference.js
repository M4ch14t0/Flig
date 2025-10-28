import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function debugMercadoPagoPreference() {
    console.log('🔍 Debugando preferência do Mercado Pago...\n');

    try {
        // 1. Login
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;

        // 2. Criar preferência
        const preferenceResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/payments/advance-preference`, {
            queueId: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
            positions: 5
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Preferência criada');
        console.log('Preferência ID:', preferenceResponse.data.data.preferenceId);
        
        // 3. Buscar detalhes da preferência no Mercado Pago
        console.log('\n🔍 Buscando detalhes da preferência no Mercado Pago...');
        
        // Usar a API do Mercado Pago para buscar a preferência
        const mpResponse = await axios.get(`https://api.mercadopago.com/checkout/preferences/${preferenceResponse.data.data.preferenceId}`, {
            headers: {
                'Authorization': `Bearer APP_USR-7b82f4ea-52b3-4ce2-b132-c0898d967004`
            }
        });

        console.log('\n📋 Detalhes da preferência no Mercado Pago:');
        console.log('Back URLs:');
        console.log('  Success:', mpResponse.data.back_urls?.success);
        console.log('  Failure:', mpResponse.data.back_urls?.failure);
        console.log('  Pending:', mpResponse.data.back_urls?.pending);
        console.log('Notification URL:', mpResponse.data.notification_url);
        
        // Verificar se contém localhost
        const backUrls = mpResponse.data.back_urls;
        const notificationUrl = mpResponse.data.notification_url;
        
        let hasLocalhost = false;
        if (backUrls?.success?.includes('localhost')) {
            console.log('\n❌ PROBLEMA: Success URL contém localhost!');
            hasLocalhost = true;
        }
        if (backUrls?.failure?.includes('localhost')) {
            console.log('\n❌ PROBLEMA: Failure URL contém localhost!');
            hasLocalhost = true;
        }
        if (backUrls?.pending?.includes('localhost')) {
            console.log('\n❌ PROBLEMA: Pending URL contém localhost!');
            hasLocalhost = true;
        }
        if (notificationUrl?.includes('localhost')) {
            console.log('\n❌ PROBLEMA: Notification URL contém localhost!');
            hasLocalhost = true;
        }
        
        if (!hasLocalhost) {
            console.log('\n✅ Todas as URLs estão corretas (sem localhost)');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

debugMercadoPagoPreference();
