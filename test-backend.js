#!/usr/bin/env node

/**
 * Script de Teste Local do Backend Flig
 * 
 * Este script testa se o backend está funcionando localmente
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração CORS básica
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar CORS
app.options('/api/queues', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Rota de teste para criação de fila (sem autenticação)
app.post('/api/queues', (req, res) => {
  console.log('📝 Requisição recebida:', req.body);
  res.json({
    success: true,
    message: 'Rota de teste funcionando',
    data: req.body
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend de teste rodando em http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Teste: http://localhost:${PORT}/test`);
});
