// db.js
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",         // ou o usuário que você configurou no Workbench
  password: "",         // se você tiver senha, coloque aqui
  database: "fligdb",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  } else {
    console.log("✅ Conectado ao banco de dados MySQL (fligdb)");
  }
});

module.exports = connection;
