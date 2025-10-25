/**
 * Controlador SIMPLES para recuperação de senha - VERSÃO DEBUG
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import crypto from 'crypto';
import connection from '../config/db.js';

/**
 * Solicita recuperação de senha - VERSÃO SIMPLES
 */
async function forgotPasswordSimple(req, res) {
  console.log('🔍 [SIMPLE] Iniciando forgotPassword...');
  
  // Resposta imediata
  console.log('🔍 [SIMPLE] Enviando resposta imediata...');
  res.json({
    success: true,
    message: 'Solicitação de recuperação processada. Verifique seu email em alguns instantes.'
  });
  console.log('🔍 [SIMPLE] Resposta enviada!');
}

export {
  forgotPasswordSimple
};

export default {
  forgotPasswordSimple
};
