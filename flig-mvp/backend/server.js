const express = require("express");
const cors = require("cors");
const connection = require("./config/db");
const app = express();
const PORT = 5000;

const TOKEN = "48e69a53-66d7-4661-a641-a708a81bba25-2b5c80fd-96f3-44fb-82b5-f698f61c9550";

app.use(cors());
app.use(express.json());

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

// 🔍 Consulta CNPJ via CNPJá API
app.get("/api/cnpj/:cnpj", async (req, res) => {
  const cnpj = req.params.cnpj;
  console.log("📥 Requisição recebida para CNPJ:", cnpj);

  try {
    const response = await fetch(`https://api.cnpja.com.br/companies/${cnpj}`, {
      headers: {
        Authorization: `${TOKEN}`,
        Accept: "application/json",
      },
    });

    console.log("Status da resposta CNPJá:", response.status);
    const data = await response.json();
    console.log("📣 Dados retornados pela CNPJá:", data);

    if (!response.ok || !data.name) {
      return res.json({ valid: false, message: "CNPJ não encontrado ou inválido" });
    }

    return res.json({ valid: true, company_name: data.name });

  } catch (error) {
    console.error("❌ Erro interno ao consultar CNPJá:", error);
    return res.status(500).json({ valid: false, message: "Erro interno no servidor" });
  }
});

// ✅ Validação de CPF local
app.post("/api/cpf", (req, res) => {
  let { cpf, birthDate } = req.body;
  console.log("📥 CPF recebido:", cpf);

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

// 🚀 Inicialização
app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});

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

// Rota para cadastrar um novo estabelecimento
// Rota para cadastrar estabelecimento
// 📌 Cadastrar empresa
app.post("/api/empresa", (req, res) => {
  const { nome_empresa, cnpj, cep_empresa, endereco_empresa} = req.body;

  const sql2 = `
    INSERT INTO estabelecimentos (nome_empresa, cnpj, cep_empresa, endereco_empresa) 
    VALUES (?, ?, ?, ?)
  `;

  connection.query(sql2, [nome_empresa, cnpj, cep_empresa, endereco_empresa], (err, result) => {
    if (err) {
      console.error("❌ Erro ao inserir empresa:", err);
      return res.status(500).json({ success: false, message: "Erro ao salvar empresa" });
    }
    console.log("✅ Empresa cadastrada com sucesso:", result.insertId);
    return res.json({ success: true, message: "Empresa cadastrada com sucesso", id: result.insertId });
  });
});



