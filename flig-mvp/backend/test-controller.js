const Establishment = require('./models/Establishment');

async function testController() {
  try {
    console.log('Testing Establishment.findById(8)...');
    const establishment = await Establishment.findById(8);
    console.log('Establishment found:', establishment ? 'YES' : 'NO');
    
    if (establishment) {
      console.log('Testing Establishment.getStats(8)...');
      const stats = await Establishment.getStats(8);
      console.log('Stats:', stats);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testController();






