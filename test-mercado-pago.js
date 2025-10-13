const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-7477222719242827-100907-b5c7d9ea85eefbe4ef46c5f983df8d3b-2915256254',
  options: { timeout: 5000 }
});

async function testMercadoPago() {
  try {
    console.log('Testando Mercado Pago...');
    
    const preference = new Preference(client);
    
    const preferenceData = {
      items: [
        {
          title: 'Plano Teste',
          description: 'Teste de integração',
          quantity: 1,
          unit_price: 10.00,
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: 'teste@teste.com',
        name: 'Teste'
      }
    };

    const result = await preference.create({ body: preferenceData });
    console.log('✅ Sucesso:', result);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testMercadoPago();
