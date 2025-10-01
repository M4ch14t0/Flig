const express = require("express");
const cors = require("cors");
const connection = require("./config/db");
const redisService = require("./services/redis");
const Queue = require("./models/Queue");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const TOKEN = process.env.CNPJA_TOKEN;

if (!TOKEN) {
  console.warn('⚠️  CNPJA_TOKEN not configured. Some features may not work properly.');
}

// Configuração CORS mais permissiva para desenvolvimento
const defaultCorsOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Permitir configuração via variável de ambiente (suporta múltiplas origens separadas por vírgula)
const envCorsOrigin = process.env.CORS_ORIGIN;
const configuredOrigins = envCorsOrigin
  ? envCorsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultCorsOrigins, ...configuredOrigins])];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex.: ferramentas de teste, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');
const userRoutes = require('./routes/userRoutes');
const establishmentRoutes = require('./routes/establishmentRoutes');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/establishments', establishmentRoutes);

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

// Rota para buscar filas de um estabelecimento
app.get("/api/estabelecimentos/:id/filas", async (req, res) => {
  const estabelecimentoId = req.params.id;
  
  try {
    // Buscar filas do estabelecimento
    const filas = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM filas WHERE estabelecimento_id = ? AND status = 'ativa' ORDER BY created_at DESC",
        [estabelecimentoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    // Para cada fila, buscar o número de clientes no Redis
    const redisService = require('./services/redis');
    const filasComStats = await Promise.all(
      filas.map(async (fila) => {
        try {
          const totalClients = await redisService.getQueueSize(fila.id);
          return {
            ...fila,
            stats: {
              totalClients: totalClients || 0
            }
          };
        } catch (error) {
          console.error(`Erro ao buscar stats da fila ${fila.id}:`, error);
          return {
            ...fila,
            stats: {
              totalClients: 0
            }
          };
        }
      })
    );

    res.json(filasComStats);
  } catch (err) {
    console.error("Erro ao buscar filas:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// COMENTADO TEMPORARIAMENTE - Pode estar conflitando com establishmentRoutes
// app.get("/api/estabelecimentos/:id", (req, res) => {
//   const estabelecimentoId = req.params.id;
//   
//   connection.query(
//     "SELECT * FROM estabelecimentos WHERE id = ?",
//     [estabelecimentoId],
//     (err, results) => {
//       if (err) {
//         console.error("Erro ao buscar estabelecimento:", err);
//         return res.status(500).json({ error: "Erro no servidor" });
//       }
//       
//       if (results.length === 0) {
//         return res.status(404).json({ error: "Estabelecimento não encontrado" });
//       }
//       
//       res.json(results[0]);
//     }
//   );
// });

// Rota para buscar filas ativas
app.get("/api/filas", (req, res) => {
  connection.query(
    `SELECT f.*, e.nome_empresa, e.categoria 
     FROM filas f 
     JOIN estabelecimentos e ON f.estabelecimento_id = e.id 
     WHERE f.status = 'ativa' 
     ORDER BY f.created_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Erro ao buscar filas:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }
      res.json(results);
    }
  );
});

// Rota para buscar fila por ID
app.get("/api/filas/:id", (req, res) => {
  const filaId = req.params.id;
  
  connection.query(
    `SELECT f.*, e.nome_empresa, e.categoria, e.endereco_empresa, e.telefone_empresa
     FROM filas f 
     JOIN estabelecimentos e ON f.estabelecimento_id = e.id 
     WHERE f.id = ?`,
    [filaId],
    (err, results) => {
      if (err) {
        console.error("Erro ao buscar fila:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: "Fila não encontrada" });
      }
      
      res.json(results[0]);
    }
  );
});

// Rota para buscar clientes de uma fila
app.get("/api/filas/:id/clientes", (req, res) => {
  const filaId = req.params.id;
  
  // Buscar clientes ativos na fila (Redis)
  Queue.getQueueClients(filaId)
    .then(clients => {
      res.json(clients);
    })
    .catch(error => {
      console.error("Erro ao buscar clientes da fila:", error);
      res.status(500).json({ error: "Erro ao buscar clientes da fila" });
    });
});

// Rota para buscar posição de um cliente na fila
app.get("/api/filas/:id/posicao/:clientId", (req, res) => {
  const { id: filaId, clientId } = req.params;
  
  Queue.getClientPosition(filaId, clientId)
    .then(position => {
      if (position === null) {
        return res.status(404).json({ error: "Cliente não encontrado na fila" });
      }
      res.json({ position });
    })
    .catch(error => {
      console.error("Erro ao buscar posição do cliente:", error);
      res.status(500).json({ error: "Erro ao buscar posição do cliente" });
    });
});

// Rota para buscar estatísticas de uma fila
app.get("/api/filas/:id/estatisticas", (req, res) => {
  const filaId = req.params.id;
  
  Queue.getQueueStats(filaId)
    .then(stats => {
      res.json(stats);
    })
    .catch(error => {
      console.error("Erro ao buscar estatísticas da fila:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas da fila" });
    });
});

// Rota para buscar estatísticas de um estabelecimento
app.get("/api/estabelecimentos/:id/estatisticas", async (req, res) => {
  const estabelecimentoId = req.params.id;
  
  try {
    // Buscar estatísticas básicas do banco
    const stats = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT 
           COUNT(DISTINCT f.id) as total_filas,
           COUNT(DISTINCT CASE WHEN f.status = 'ativa' THEN f.id END) as filas_ativas,
           COUNT(DISTINCT CASE WHEN f.status = 'encerrada' THEN f.id END) as filas_encerradas,
           SUM(f.total_clientes_atendidos) as total_clientes_atendidos,
           SUM(f.receita_total) as receita_total,
           AVG(f.tempo_estimado) as tempo_medio_estimado
         FROM filas f 
         WHERE f.estabelecimento_id = ?`,
        [estabelecimentoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0] || {
            total_filas: 0,
            filas_ativas: 0,
            filas_encerradas: 0,
            total_clientes_atendidos: 0,
            receita_total: 0,
            tempo_medio_estimado: 0
          });
        }
      );
    });

    // Buscar clientes atuais nas filas ativas do Redis
    const redisService = require('./services/redis');
    let clientesAtuais = 0;
    
    try {
      // Buscar filas ativas
      const filasAtivas = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT id FROM filas WHERE estabelecimento_id = ? AND status = 'ativa'`,
          [estabelecimentoId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      // Contar clientes em cada fila ativa
      for (const fila of filasAtivas) {
        const queueSize = await redisService.getQueueSize(fila.id);
        clientesAtuais += queueSize;
      }
    } catch (redisErr) {
      console.warn('Erro ao buscar clientes do Redis:', redisErr);
    }

    // Adicionar clientes atuais às estatísticas
    stats.clientes_atuais = clientesAtuais;
    
    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


// Rota para buscar relatórios de um estabelecimento
app.get("/api/estabelecimentos/:id/relatorios", (req, res) => {
  const estabelecimentoId = req.params.id;
  const { periodo = '7' } = req.query; // padrão: últimos 7 dias
  
  connection.query(
    `SELECT 
       DATE(data_relatorio) as data,
       SUM(total_clientes) as total_clientes,
       SUM(clientes_atendidos) as clientes_atendidos,
       AVG(tempo_medio_espera) as tempo_medio_espera,
       SUM(receita_total) as receita_total,
       SUM(total_avancos) as total_avancos
     FROM relatorios_diarios 
     WHERE estabelecimento_id = ? 
       AND data_relatorio >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(data_relatorio)
     ORDER BY data_relatorio DESC`,
    [estabelecimentoId, periodo],
    (err, results) => {
      if (err) {
        console.error("Erro ao buscar relatórios:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }
      res.json(results);
    }
  );
});

// Rota para buscar logs do sistema
app.get("/api/logs", (req, res) => {
  const { nivel, modulo, limite = 100 } = req.query;
  
  let sql = "SELECT * FROM logs_sistema WHERE 1=1";
  const params = [];
  
  if (nivel) {
    sql += " AND nivel = ?";
    params.push(nivel);
  }
  
  if (modulo) {
    sql += " AND modulo = ?";
    params.push(modulo);
  }
  
  sql += " ORDER BY created_at DESC LIMIT ?";
  params.push(parseInt(limite));
  
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erro ao buscar logs:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    res.json(results);
  });
});

// Rota para buscar configurações do sistema
app.get("/api/configuracoes", (req, res) => {
  connection.query("SELECT * FROM configuracoes_sistema ORDER BY chave", (err, results) => {
    if (err) {
      console.error("Erro ao buscar configurações:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    
    const configs = {};
    results.forEach(config => {
      configs[config.chave] = {
        valor: config.valor,
        descricao: config.descricao,
        tipo: config.tipo
      };
    });
    
    res.json(configs);
  });
});

// Rota para atualizar configuração do sistema
app.put("/api/configuracoes/:chave", (req, res) => {
  const { chave } = req.params;
  const { valor } = req.body;
  
  connection.query(
    "UPDATE configuracoes_sistema SET valor = ?, updated_at = NOW() WHERE chave = ?",
    [valor, chave],
    (err, result) => {
      if (err) {
        console.error("Erro ao atualizar configuração:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Configuração não encontrada" });
      }
      
      res.json({ message: "Configuração atualizada com sucesso" });
    }
  );
});

// Importar middleware de tratamento de erros
const { globalErrorHandler, notFoundHandler } = require('./utils/errorHandler');

// Rota 404 - deve vir antes do middleware de erro
app.use('*', notFoundHandler);

// Middleware global de tratamento de erros - deve ser o último
app.use(globalErrorHandler);

module.exports = app;

