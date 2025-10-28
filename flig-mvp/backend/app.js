import express from "express";
import cors from "cors";
import connection from "./config/db.js";
import redisService from "./services/redis.js";
import Queue from "./models/Queue.js";
import { generalLimiter, authLimiter, queueLimiter, cnpjLimiter, paymentLimiter, notificationLimiter } from "./middleware/rateLimiting.js";
import { sanitizeInputs } from "./middleware/validation.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar trust proxy para Railway (mais específico)
app.set('trust proxy', 1);

// Configurar CSP para Mercado Pago
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://http2.mlstatic.com https://www.mercadopago.com.br https://sandbox.mercadopago.com.br https://js-agent.newrelic.com https://*.newrelic.com; " +
    "style-src 'self' 'unsafe-inline' https://http2.mlstatic.com https://www.mercadopago.com.br https://sandbox.mercadopago.com.br; " +
    "img-src 'self' data: blob: https: http:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' https://api.mercadopago.com https://api.mercadolibre.com https://http2.mlstatic.com https://www.mercadopago.com.br https://sandbox.mercadopago.com.br https://*.newrelic.com; " +
    "frame-src 'self' https://www.mercadopago.com.br https://sandbox.mercadopago.com.br; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://www.mercadopago.com.br https://sandbox.mercadopago.com.br;"
  );
  next();
});

const TOKEN = process.env.CNPJA_TOKEN;

if (!TOKEN) {
  console.warn('⚠️  CNPJA_TOKEN not configured. Some features may not work properly.');
}

// Configuração CORS mais permissiva para desenvolvimento e produção
const defaultCorsOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://flig-mvp.vercel.app',
  'https://flig-frontend.vercel.app',
  'https://flig.vercel.app',
  'https://flig-8x932j289-m4ch14t0s-projects.vercel.app'
];

// Permitir configuração via variável de ambiente (suporta múltiplas origens separadas por vírgula)
const envCorsOrigin = process.env.CORS_ORIGIN;
const configuredOrigins = envCorsOrigin
  ? envCorsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultCorsOrigins, ...configuredOrigins])];

app.use(cors({
  origin: function (origin, callback) {
    console.log('🔍 CORS Request from origin:', origin);
    console.log('🔍 Allowed origins:', allowedOrigins);
    
    // Permitir requisições sem origin (ex.: ferramentas de teste, curl)
    if (!origin) {
      console.log('✅ CORS: Allowing request without origin');
      return callback(null, true);
    }
    
    // Verificar se está na lista de origens permitidas
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed:', origin);
      return callback(null, true);
    }
    
    // Permitir domínios do Mercado Pago
    const mercadoPagoDomains = [
      'https://www.mercadopago.com.br',
      'https://sandbox.mercadopago.com.br',
      'https://http2.mlstatic.com',
      'https://sdk.mercadopago.com'
    ];
    
    if (mercadoPagoDomains.some(domain => origin.startsWith(domain))) {
      console.log('✅ CORS: Mercado Pago domain allowed:', origin);
      return callback(null, true);
    }
    
    // Permitir qualquer domínio do Vercel
    if (origin.includes('.vercel.app')) {
      console.log('✅ CORS: Vercel domain allowed:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS: Origin not allowed:', origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'X-Signature', 'X-Request-ID', 'X-Forwarded-For', 'X-Forwarded-Host', 'X-Forwarded-Proto'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());

// Middleware de sanitização global
app.use(sanitizeInputs);

// Middleware de debug para todas as requisições
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl} - Headers:`, req.headers);
  console.log(`🔍 Body:`, req.body);
  next();
});

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import userRoutes from './routes/userRoutes.js';
import establishmentRoutes from './routes/establishmentRoutes.js';
import planRoutes from './routes/planRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Aplicar rate limiting geral
app.use(generalLimiter);

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Flig Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      queues: '/api/queues',
      users: '/api/users',
      establishments: '/api/establishments',
      plans: '/api/plans',
      payments: '/api/payments'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (compatibility with Railway)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint (temporário)
app.get('/debug', (req, res) => {
  res.json({
    PROTOTYPE_MODE: process.env.PROTOTYPE_MODE,
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    REDIS_HOST: process.env.REDIS_HOST
  });
});

// ROTA DE TESTE DIRETA
app.post('/test-debug', (req, res) => {
  console.log('🔍 [TEST] Rota de teste chamada');
  res.json({
    success: true,
    message: 'Rota de teste funcionando!'
  });
});

// ROTA DE RECUPERAÇÃO DE SENHA SIMPLIFICADA
app.post('/api/auth/forgot-password-fixed', async (req, res) => {
  console.log('🔍 [FIXED] Recuperação de senha chamada');
  
  try {
    // Verificar se há token de autenticação
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação necessário'
      });
    }

    // Decodificar token para obter dados do usuário
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui_123456789';
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userId, userType, email } = decoded;
    
    console.log('🔍 [FIXED] Usuário autenticado:', { userId, userType, email });

    // Gerar token de recuperação
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar token no banco de dados
    const connection = await import('./config/db.js');
    
    if (userType === 'cliente') {
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE id = ?',
          [resetToken, expireTime, userId],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
    } else {
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE estabelecimentos SET reset_token = ?, reset_expires = ? WHERE id = ?',
          [resetToken, expireTime, userId],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
    }

    console.log('🔍 [FIXED] Token salvo no banco:', resetToken.substring(0, 10) + '...');

    // Resposta imediata
    res.json({
      success: true,
      message: 'Solicitação de recuperação processada. Verifique seu email em alguns instantes.'
    });
    
    // Processa envio de email em background
    setImmediate(async () => {
      try {
        console.log('📧 [FIXED] Enviando email em background...');
        
        // Tentar enviar email
        const emailService = await import('./services/emailService.js');
        const userName = userType === 'cliente' ? 'Cliente' : 'Estabelecimento';
        
        const emailSent = await emailService.sendPasswordResetEmail(email, resetToken, userName);
        
        if (emailSent) {
          console.log('✅ [FIXED] Email enviado com sucesso para:', email);
        } else {
          console.log('⚠️ [FIXED] Email não enviado. Token disponível:', resetToken);
          console.log('🔗 [FIXED] Link de recuperação:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
        }
      } catch (error) {
        console.error('❌ [FIXED] Erro ao enviar email:', error);
        console.log('🔗 [FIXED] Token de recuperação:', resetToken);
        console.log('🌐 [FIXED] Link:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
      }
    });

  } catch (error) {
    console.error('❌ [FIXED] Erro na recuperação de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Usar rotas com rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/queues', queueLimiter, queueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes);

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
    const redisService = await import('./services/redis.js');
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

// Rota para buscar estabelecimento por ID
app.get("/api/estabelecimentos/:id", (req, res) => {
  const estabelecimentoId = req.params.id;
  
  connection.query(
    "SELECT * FROM estabelecimentos WHERE id = ?",
    [estabelecimentoId],
    (err, results) => {
      if (err) {
        console.error("Erro ao buscar estabelecimento:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: "Estabelecimento não encontrado" });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    }
  );
});

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
app.get("/api/filas/:id/estatisticas", queueLimiter, (req, res) => {
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
app.get("/api/estabelecimentos/:id/estatisticas", queueLimiter, async (req, res) => {
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

    // Buscar tempo médio real de espera baseado no histórico
    const tempoMedioReal = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT 
           AVG(TIMESTAMPDIFF(MINUTE, hcf.data_entrada, hcf.data_saida)) as tempo_medio_real
         FROM historico_clientes_filas hcf
         JOIN filas f ON hcf.queue_id = f.id
         WHERE f.estabelecimento_id = ? 
           AND hcf.status = 'atendido'
           AND hcf.data_saida IS NOT NULL`,
        [estabelecimentoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]?.tempo_medio_real || 0);
        }
      );
    });

    // Calcular taxa de abandono baseada no histórico
    const taxaAbandono = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT 
           COUNT(CASE WHEN hcf.status = 'abandonou' THEN 1 END) as total_abandonos,
           COUNT(CASE WHEN hcf.status IN ('atendido', 'abandonou') THEN 1 END) as total_saidas
         FROM historico_clientes_filas hcf
         JOIN filas f ON hcf.queue_id = f.id
         WHERE f.estabelecimento_id = ?`,
        [estabelecimentoId],
        (err, results) => {
          if (err) reject(err);
          else {
            const data = results[0];
            const totalSaidas = data.total_saidas || 0;
            const totalAbandonos = data.total_abandonos || 0;
            const taxa = totalSaidas > 0 ? (totalAbandonos / totalSaidas) * 100 : 0;
            resolve(Math.round(taxa * 10) / 10); // Arredondar para 1 casa decimal
          }
        }
      );
    });

    // Buscar clientes atuais nas filas ativas do Redis
    const redisService = await import('./services/redis.js');
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

    // Adicionar clientes atuais, tempo médio real e taxa de abandono às estatísticas
    stats.clientes_atuais = clientesAtuais;
    stats.tempo_medio_real = Math.round(tempoMedioReal) || 0;
    stats.taxa_abandono = taxaAbandono;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


// Rota para buscar relatórios de um estabelecimento
app.get("/api/estabelecimentos/:id/relatorios", queueLimiter, (req, res) => {
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

// Rota para buscar dados históricos de atendimentos por hora
app.get("/api/estabelecimentos/:id/atendimentos-por-hora", queueLimiter, async (req, res) => {
  const estabelecimentoId = req.params.id;
  const { dias = '7' } = req.query; // padrão: últimos 7 dias
  
  try {
    // Buscar dados do histórico de clientes nas filas
    const sql = `
      SELECT 
        HOUR(hcf.data_entrada) as hora,
        COUNT(*) as total_atendimentos
      FROM historico_clientes_filas hcf
      JOIN filas f ON hcf.queue_id = f.id
      WHERE f.estabelecimento_id = ? 
        AND hcf.data_entrada >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND hcf.status = 'atendido'
      GROUP BY HOUR(hcf.data_entrada)
      ORDER BY hora
    `;
    
    const results = await new Promise((resolve, reject) => {
      connection.query(sql, [estabelecimentoId, dias], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Formatar dados para o gráfico
    const horas = ['08:00', '12:00', '16:00', '20:00', '00:00'];
    const dadosFormatados = horas.map(hora => {
      const horaNum = parseInt(hora.split(':')[0]);
      const dadosHora = results.find(r => r.hora === horaNum);
      return {
        hora,
        pessoas: dadosHora ? dadosHora.total_atendimentos : 0
      };
    });

    res.json({
      success: true,
      data: dadosFormatados
    });

  } catch (error) {
    console.error("Erro ao buscar atendimentos por hora:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro no servidor" 
    });
  }
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
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler.js';

// Rota 404 - deve vir antes do middleware de erro
app.use('*', notFoundHandler);

// Middleware global de tratamento de erros - deve ser o último
app.use(globalErrorHandler);

export default app;

