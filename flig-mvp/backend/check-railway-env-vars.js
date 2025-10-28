import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function checkRailwayEnvVars() {
    console.log('🔍 Verificando variáveis de ambiente do Railway...\n');

    try {
        // 1. Login
        const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
            email_empresa: 'testeestab@email.com',
            senha_empresa: 'Abcd1234'
        });
        const token = loginResponse.data.data.token;

        // 2. Criar preferência e verificar URLs
        console.log('Criando preferência para verificar URLs...');
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
        console.log('\n🔍 Verificando URLs de retorno...');
        
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
                const location = redirectError.response.headers.location;
                console.log('Location:', location);
                
                // Verificar se a URL de redirecionamento contém problemas
                if (location.includes('localhost')) {
                    console.log('\n❌ PROBLEMA CRÍTICO: URL de redirecionamento contém localhost!');
                    console.log('Isso significa que FRONTEND_URL não está configurada corretamente no Railway');
                } else if (location.includes('ngrok')) {
                    console.log('\n❌ PROBLEMA CRÍTICO: URL de redirecionamento contém ngrok!');
                    console.log('Isso significa que BACKEND_URL não está configurada corretamente no Railway');
                } else if (location.includes('flig.vercel.app')) {
                    console.log('\n❌ PROBLEMA: URL de redirecionamento contém domínio incorreto!');
                    console.log('Deve ser flig-frontend.vercel.app, não flig.vercel.app');
                } else {
                    console.log('\n✅ URL de redirecionamento parece correta');
                }
            } else {
                console.log('❌ Erro ao acessar URL:', redirectError.message);
            }
        }

        // 4. Diagnóstico e solução
        console.log('\n📋 DIAGNÓSTICO:');
        console.log('O problema está nas variáveis de ambiente do Railway.');
        console.log('As URLs de retorno estão incorretas, causando falha no redirecionamento.');
        
        console.log('\n🔧 SOLUÇÃO:');
        console.log('1. Acesse o Railway Dashboard: https://railway.app');
        console.log('2. Vá para o projeto "flig-production"');
        console.log('3. Clique em "Variables"');
        console.log('4. Configure as seguintes variáveis:');
        console.log('   FRONTEND_URL=https://flig-frontend.vercel.app');
        console.log('   BACKEND_URL=https://flig-production.up.railway.app');
        console.log('5. Reinicie o serviço após configurar');

        console.log('\n🎯 RESULTADO ESPERADO:');
        console.log('Após configurar as variáveis:');
        console.log('- URLs de retorno apontarão para Vercel correto');
        console.log('- Redirecionamento funcionará após pagamento');
        console.log('- Webhook funcionará corretamente');
        console.log('- Pagamento será processado com sucesso');

    } catch (error) {
        console.error('❌ Erro durante verificação:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkRailwayEnvVars();
