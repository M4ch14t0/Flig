/**
 * Script para criar usuários de teste no sistema Flig
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// CPFs válidos para teste
const validCPFs = [
  '11144477735',
  '12345678909', 
  '98765432100',
  '45678912345',
  '78912345678'
];

// CNPJs válidos para teste
const validCNPJs = [
  '12345678000195',
  '98765432000123',
  '45678912000134',
  '78912345000156',
  '32165498000178'
];

const testUsers = [
  {
    nome_usuario: "João Silva Santos",
    cpf: validCPFs[0],
    telefone_usuario: "(11) 99999-1234",
    email_usuario: "joao.silva@email.com",
    senha_usuario: "123456",
    cep_usuario: "01234-567",
    endereco_usuario: "Rua das Flores, 123",
    numero_usuario: "123"
  },
  {
    nome_usuario: "Maria Oliveira Costa",
    cpf: validCPFs[1],
    telefone_usuario: "(11) 98888-5678",
    email_usuario: "maria.oliveira@email.com",
    senha_usuario: "123456",
    cep_usuario: "04567-890",
    endereco_usuario: "Av. Paulista, 1000",
    numero_usuario: "1000"
  },
  {
    nome_usuario: "Pedro Santos Lima",
    cpf: validCPFs[2],
    telefone_usuario: "(11) 97777-9012",
    email_usuario: "pedro.santos@email.com",
    senha_usuario: "123456",
    cep_usuario: "07890-123",
    endereco_usuario: "Rua Augusta, 500",
    numero_usuario: "500"
  },
  {
    nome_usuario: "Ana Paula Ferreira",
    cpf: validCPFs[3],
    telefone_usuario: "(11) 96666-3456",
    email_usuario: "ana.ferreira@email.com",
    senha_usuario: "123456",
    cep_usuario: "02345-678",
    endereco_usuario: "Rua Oscar Freire, 200",
    numero_usuario: "200"
  },
  {
    nome_usuario: "Carlos Eduardo Souza",
    cpf: validCPFs[4],
    telefone_usuario: "(11) 95555-7890",
    email_usuario: "carlos.souza@email.com",
    senha_usuario: "123456",
    cep_usuario: "05678-901",
    endereco_usuario: "Av. Faria Lima, 1500",
    numero_usuario: "1500"
  }
];

const testEstablishments = [
  {
    nome_empresa: "Restaurante Sabor & Arte",
    cnpj: validCNPJs[0],
    email_empresa: "contato@saborarte.com.br",
    senha_empresa: "123456",
    categoria: "Restaurante",
    telefone_empresa: "(11) 3333-4444",
    endereco_empresa: "Rua das Palmeiras, 456",
    descricao: "Restaurante especializado em culinária brasileira",
    horario_funcionamento: "11:00 - 22:00"
  },
  {
    nome_empresa: "Café Central",
    cnpj: validCNPJs[1],
    email_empresa: "contato@cafecentral.com.br",
    senha_empresa: "123456",
    categoria: "Cafeteria",
    telefone_empresa: "(11) 3333-5555",
    endereco_empresa: "Av. Paulista, 2000",
    descricao: "Cafeteria com os melhores grãos do Brasil",
    horario_funcionamento: "06:00 - 20:00"
  },
  {
    nome_empresa: "Barbearia Moderna",
    cnpj: validCNPJs[2],
    email_empresa: "contato@barbeariamoderna.com.br",
    senha_empresa: "123456",
    categoria: "Barbearia",
    telefone_empresa: "(11) 3333-6666",
    endereco_empresa: "Rua Augusta, 800",
    descricao: "Barbearia com cortes modernos e tradicionais",
    horario_funcionamento: "09:00 - 19:00"
  },
  {
    nome_empresa: "Farmácia Saúde Total",
    cnpj: validCNPJs[3],
    email_empresa: "contato@saudetotal.com.br",
    senha_empresa: "123456",
    categoria: "Farmácia",
    telefone_empresa: "(11) 3333-7777",
    endereco_empresa: "Rua Oscar Freire, 300",
    descricao: "Farmácia 24h com delivery",
    horario_funcionamento: "24 horas"
  },
  {
    nome_empresa: "Academia FitLife",
    cnpj: validCNPJs[4],
    email_empresa: "contato@fitlife.com.br",
    senha_empresa: "123456",
    categoria: "Academia",
    telefone_empresa: "(11) 3333-8888",
    endereco_empresa: "Av. Faria Lima, 2000",
    descricao: "Academia com equipamentos modernos",
    horario_funcionamento: "05:00 - 23:00"
  }
];

async function createTestUsers() {
  console.log('🚀 Criando usuários de teste...\n');
  
  // Criar usuários
  for (let i = 0; i < testUsers.length; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/register/user`, testUsers[i]);
      console.log(`✅ Usuário ${i + 1}: ${testUsers[i].nome_usuario}`);
      console.log(`   Email: ${testUsers[i].email_usuario}`);
      console.log(`   Senha: ${testUsers[i].senha_usuario}`);
      console.log(`   Token: ${response.data.data.token.substring(0, 20)}...\n`);
    } catch (error) {
      console.log(`❌ Erro ao criar usuário ${i + 1}: ${error.response?.data?.message || error.message}\n`);
    }
  }
  
  // Criar estabelecimentos
  console.log('🏢 Criando estabelecimentos de teste...\n');
  
  for (let i = 0; i < testEstablishments.length; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/register/establishment`, testEstablishments[i]);
      console.log(`✅ Estabelecimento ${i + 1}: ${testEstablishments[i].nome_empresa}`);
      console.log(`   Email: ${testEstablishments[i].email_empresa}`);
      console.log(`   Senha: ${testEstablishments[i].senha_empresa}`);
      console.log(`   Categoria: ${testEstablishments[i].categoria}`);
      console.log(`   Token: ${response.data.data.token.substring(0, 20)}...\n`);
    } catch (error) {
      console.log(`❌ Erro ao criar estabelecimento ${i + 1}: ${error.response?.data?.message || error.message}\n`);
    }
  }
  
  console.log('🎉 Usuários de teste criados com sucesso!');
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUsers().catch(console.error);
}

module.exports = { createTestUsers, testUsers, testEstablishments };
