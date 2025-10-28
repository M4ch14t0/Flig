import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Verificando configuração do Mercado Pago...\n');

// Verificar variáveis de ambiente
console.log('1. Variáveis de ambiente:');
console.log('MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Definida' : '❌ Não definida');
console.log('MERCADOPAGO_SANDBOX:', process.env.MERCADOPAGO_SANDBOX || 'Não definida');
console.log('MERCADOPAGO_WEBHOOK_SECRET:', process.env.MERCADOPAGO_WEBHOOK_SECRET ? '✅ Definida' : '❌ Não definida');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Não definida');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'Não definida');

// Verificar se o token está no formato correto
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('\n2. Análise do token:');
    console.log('Comprimento:', token.length);
    console.log('Inicia com APP_USR:', token.startsWith('APP_USR'));
    console.log('Primeiros 20 caracteres:', token.substring(0, 20) + '...');
    
    if (!token.startsWith('APP_USR')) {
        console.log('❌ PROBLEMA: Token não está no formato correto!');
        console.log('Deve começar com "APP_USR"');
    }
} else {
    console.log('\n❌ PROBLEMA: MERCADOPAGO_ACCESS_TOKEN não está definida!');
}

// Testar conexão com a API do Mercado Pago
console.log('\n3. Testando conexão com API do Mercado Pago...');
try {
    const { MercadoPagoConfig, Preference } = await import('mercadopago');
    
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-7b82f4ea-52b3-4ce2-b132-c0898d967004',
        options: {
            sandbox: process.env.MERCADOPAGO_SANDBOX === 'true'
        }
    });
    
    const preference = new Preference(client);
    console.log('✅ SDK do Mercado Pago carregado com sucesso');
    
    // Testar criação de uma preferência simples
    console.log('\n4. Testando criação de preferência...');
    const testPreference = {
        items: [
            {
                id: 'test',
                title: 'Teste',
                quantity: 1,
                unit_price: 1.00
            }
        ],
        back_urls: {
            success: 'https://example.com/success',
            failure: 'https://example.com/failure',
            pending: 'https://example.com/pending'
        },
        auto_return: 'approved'
    };
    
    const result = await preference.create({ body: testPreference });
    console.log('✅ Preferência de teste criada com sucesso');
    console.log('ID:', result.id);
    
} catch (error) {
    console.error('❌ Erro ao testar Mercado Pago:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    }
}

console.log('\n5. Diagnóstico:');
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.log('❌ MERCADOPAGO_ACCESS_TOKEN não está configurada no Railway');
    console.log('Solução: Configure a variável no Railway Dashboard');
} else if (!process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR')) {
    console.log('❌ Token está no formato incorreto');
    console.log('Solução: Use um token válido do Mercado Pago');
} else {
    console.log('✅ Configuração parece estar correta');
    console.log('Se ainda há problemas, verifique os logs do Railway');
}
