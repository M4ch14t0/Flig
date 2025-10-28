import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://flig-production.up.railway.app';

async function debugCorsError() {
    console.log('🔍 Debugando erro de CORS no Railway...\n');

    try {
        // 1. Testar endpoint de health primeiro
        console.log('1. Testando endpoint de health...');
        try {
            const healthResponse = await axios.get(`${RAILWAY_BACKEND_URL}/api/health`);
            console.log('✅ Health endpoint funcionando:', healthResponse.status);
        } catch (healthError) {
            console.log('❌ Health endpoint com problema:', healthError.message);
        }

        // 2. Testar login com headers CORS
        console.log('\n2. Testando login com headers CORS...');
        try {
            const loginResponse = await axios.post(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
                email_empresa: 'testeestab@email.com',
                senha_empresa: 'Abcd1234'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://flig-frontend.vercel.app',
                    'Referer': 'https://flig-frontend.vercel.app'
                }
            });
            console.log('✅ Login funcionando:', loginResponse.status);
        } catch (loginError) {
            console.log('❌ Erro no login:', loginError.message);
            console.log('Status:', loginError.response?.status);
            console.log('Headers:', loginError.response?.headers);
            console.log('Data:', loginError.response?.data);
        }

        // 3. Testar OPTIONS (preflight)
        console.log('\n3. Testando preflight OPTIONS...');
        try {
            const optionsResponse = await axios.options(`${RAILWAY_BACKEND_URL}/api/auth/login/establishment`, {
                headers: {
                    'Origin': 'https://flig-frontend.vercel.app',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });
            console.log('✅ OPTIONS funcionando:', optionsResponse.status);
            console.log('CORS Headers:', {
                'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
                'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
                'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
            });
        } catch (optionsError) {
            console.log('❌ Erro no OPTIONS:', optionsError.message);
            console.log('Status:', optionsError.response?.status);
        }

        // 4. Verificar se o problema é específico do endpoint de login
        console.log('\n4. Testando outros endpoints...');
        try {
            const otherResponse = await axios.get(`${RAILWAY_BACKEND_URL}/api/estabelecimentos`, {
                headers: {
                    'Origin': 'https://flig-frontend.vercel.app'
                }
            });
            console.log('✅ Outros endpoints funcionando:', otherResponse.status);
        } catch (otherError) {
            console.log('❌ Erro em outros endpoints:', otherError.message);
            console.log('Status:', otherError.response?.status);
        }

        // 5. Diagnóstico
        console.log('\n5. Diagnóstico:');
        console.log('O erro 500 indica um problema interno no backend.');
        console.log('Possíveis causas:');
        console.log('- Erro na validação dos dados de login');
        console.log('- Problema com a conexão com o banco de dados');
        console.log('- Erro na configuração do CORS');
        console.log('- Problema com as variáveis de ambiente');

        console.log('\n6. Soluções:');
        console.log('1. Verificar logs do Railway para ver o erro específico');
        console.log('2. Verificar se as variáveis de ambiente estão corretas');
        console.log('3. Verificar se o banco de dados está funcionando');
        console.log('4. Verificar se a configuração de CORS está correta');

    } catch (error) {
        console.error('❌ Erro durante debug:', error.message);
    }
}

debugCorsError();
