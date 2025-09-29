const Establishment = require('./models/Establishment');

async function testControllerSimulation() {
  try {
    console.log('Simulating controller getEstablishmentStats...');
    
    const userId = 8;
    console.log('🔍 getEstablishmentStats - userId:', userId);

    // Verifica se o estabelecimento existe
    const establishment = await Establishment.findById(userId);
    if (!establishment) {
      console.log('❌ Estabelecimento não encontrado para userId:', userId);
      return;
    }

    console.log('✅ Estabelecimento encontrado:', establishment.nome_empresa);
    const stats = await Establishment.getStats(userId);
    console.log('📊 Stats obtidas:', stats);

    console.log('✅ Controller simulation successful');
    
  } catch (error) {
    console.error('❌ Error in controller simulation:', error);
  }
}

testControllerSimulation();










