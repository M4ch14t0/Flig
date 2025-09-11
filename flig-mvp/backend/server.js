const express = require("express");
const cors = require("cors");
const connection = require("./config/db");
const redisService = require("./services/redis");
const Queue = require("./models/Queue");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const TOKEN = process.env.CNPJA_TOKEN || "48e69a53-66d7-4661-a641-a708a81bba25-2b5c80fd-96f3-44fb-82b5-f698f61c9550";

app.use(cors());
app.use(express.json());

// Importar rotas do sistema de filas
const queueRoutes = require('./routes/queueRoutes');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Usar rotas do sistema de filas
app.use('/api/queues', queueRoutes);

// Rota para buscar estabelecimentos
app.get("/api/estabelecimentos", (req, res) => {
  connection.query("SELECT * FROM estabelecimentos WHERE status = 'ativo' ORDER BY nome_empresa", (err, results) => {
    if (err) {
      console.error("Erro ao buscar estabelecimentos:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    res.json(results);
  });
});

// Rota para buscar usuários
app.get("/api/usuarios", (req, res) => {
  connection.query("SELECT id, nome_usuario, cpf, telefone_usuario, email_usuario, cep_usuario, endereco_usuario, numero_usuario FROM usuarios ORDER BY nome_usuario", (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuários:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    res.json(results);
  });
});

// Rota para adicionar usuários na fila de teste (para demonstração)
app.post("/api/teste/adicionar-usuarios-fila", async (req, res) => {
  try {
    const { queueId } = req.body;
    
    if (!queueId) {
      return res.status(400).json({ error: "ID da fila é obrigatório" });
    }

    // Busca usuários do banco
    const usuarios = await new Promise((resolve, reject) => {
      connection.query("SELECT id, nome_usuario, telefone_usuario, email_usuario FROM usuarios LIMIT 5", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const queueModel = new Queue(queueId, 'Fila de Teste', 1, 'Fila de demonstração', 'ativa', 8, 2.00, 5);

    const resultados = [];
    
    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      const clientData = {
        nome: usuario.nome_usuario,
        telefone: usuario.telefone_usuario,
        email: usuario.email_usuario
      };

      try {
        const resultado = await queueModel.addClient(clientData);
        resultados.push({
          usuario: usuario.nome_usuario,
          sucesso: true,
          posicao: resultado.position
        });
      } catch (error) {
        resultados.push({
          usuario: usuario.nome_usuario,
          sucesso: false,
          erro: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Adicionados ${resultados.filter(r => r.sucesso).length} usuários na fila`,
      resultados
    });

  } catch (error) {
    console.error("Erro ao adicionar usuários na fila:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * Valida CPF usando a fórmula oficial.
 * @param {string} cpf - CPF com apenas números.
 * @returns {boolean}
 */
function validarCPF(cpf) {
  if (!cpf) return false;

  // Remove tudo que não for número
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

// Consulta CNPJ via CNPJá API
/*app.get("/api/cnpj/:cnpj", async (req, res) => {
  const cnpj = req.params.cnpj;
  console.log("Requisição recebida para CNPJ:", cnpj);

  try {
    const response = await fetch(`https://api.cnpja.com.br/companies/${cnpj}`, {
      headers: {
        Authorization: `${TOKEN}`,
        Accept: "application/json",
      },
    });

    console.log("Status da resposta CNPJá:", response.status);
    const data = await response.json();
    console.log("Dados retornados pela CNPJá:", data);

    if (!response.ok || !data.name) {
      return res.json({ valid: false, message: "CNPJ não encontrado ou inválido" });
    }

    return res.json({ valid: true, company_name: data.name });

  } catch (error) {
    console.error("Erro interno ao consultar CNPJá:", error);
    return res.status(500).json({ valid: false, message: "Erro interno no servidor" });
  }
}); */

// Validação de CPF local
app.post("/api/cpf", (req, res) => {
  let { cpf, birthDate } = req.body;
  console.log("CPF recebido:", cpf);

  if (!cpf || !birthDate) {
    return res.status(400).json({ valid: false, message: "CPF e data de nascimento são obrigatórios." });
  }

  cpf = cpf.replace(/[^\d]/g, ""); // ← SANITIZA aqui

  const cpfValido = validarCPF(cpf);

  if (!cpfValido) {
    return res.json({ valid: false, message: "CPF inválido" });
  }

  return res.json({ valid: true, name: "" }); // nome será usado se integrar API depois
});

// Rota para buscar usuários
app.get("/api/usuarios", (req, res) => {
  connection.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuários:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    res.json(results);
  });
});

// Rota para cadastrar um novo usuário
app.post("/api/cadastrar-usuario", (req, res) => {
  const {
    nome_usuario,
    cpf,
    telefone_usuario,
    email_usuario,
    senha_usuario,
    cep_usuario,
    endereco_usuario,
    numero_usuario,
  } = req.body;

  // Validação dos campos obrigatórios
  if (!nome_usuario || !cpf || !email_usuario || !senha_usuario) {
    return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos" });
  }

  const sql = `
    INSERT INTO usuarios 
    (nome_usuario, cpf, telefone_usuario, email_usuario, senha_usuario, cep_usuario, endereco_usuario, numero_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [
      nome_usuario,
      cpf,
      telefone_usuario,
      email_usuario,
      senha_usuario,
      cep_usuario,
      endereco_usuario,
      numero_usuario,
    ],
    (err, result) => {
      if (err) {
        console.error("Erro ao cadastrar usuário:", err);
        return res.status(500).json({ erro: "Erro ao cadastrar usuário" });
      }
      res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    }
  );
});

// Cadastrar empresa
app.post("/api/empresa", (req, res) => {
  const { nome_empresa, cnpj, cep_empresa, endereco_empresa} = req.body;

  const sql2 = `
    INSERT INTO estabelecimentos (nome_empresa, cnpj, cep_empresa, endereco_empresa) 
    VALUES (?, ?, ?, ?)
  `;

  connection.query(sql2, [nome_empresa, cnpj, cep_empresa, endereco_empresa], (err, result) => {
    if (err) {
      console.error("Erro ao inserir empresa:", err);
      return res.status(500).json({ success: false, message: "Erro ao salvar empresa" });
    }
    console.log("Empresa cadastrada com sucesso:", result.insertId);
    return res.json({ success: true, message: "Empresa cadastrada com sucesso", id: result.insertId });
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`
  });
});

// Inicialização do servidor
app.listen(PORT, async () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`🏥 Health check disponível em http://localhost:${PORT}/health`);
  console.log(`📋 Rotas de filas disponíveis em http://localhost:${PORT}/api/queues`);
  
  // Inicializar conexão com Redis
  try {
    await redisService.connectRedis();
    console.log(`✅ Sistema de filas inicializado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao inicializar Redis:`, error.message);
    console.log(`⚠️  Sistema funcionará sem filas até Redis estar disponível`);
  }
});
