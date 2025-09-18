const Establishment = require('./models/Establishment');

async function testModel() {
  try {
    console.log('Testing Establishment.findById(8)...');
    
    const establishment = await Establishment.findById(8);
    console.log('Result:', establishment);
    
    if (establishment) {
      console.log('✅ Establishment found:', establishment.nome_empresa);
    } else {
      console.log('❌ Establishment not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testModel();

