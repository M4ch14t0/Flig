/**
 * Controlador para recuperação de senha
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import crypto from 'crypto';
import connection from '../config/db.js';
import { hashPassword } from '../utils/crypto.js';
import emailService from '../services/emailService.js';

/**
 * Solicita recuperação de senha
 * 
 * POST /api/auth/forgot-password
 * Body: { email } (opcional - se não fornecido, usa o email do usuário logado)
 */
async function forgotPassword(req, res) {
  try {
    console.log('🔍 [DEBUG] Iniciando forgotPassword...');
    const { email } = req.body;
    const { userId, userType } = req.user; // Usuário logado
    console.log('🔍 [DEBUG] Dados recebidos:', { email, userId, userType });

    let user = null;
    let userEmail = null;
    let userName = null;

    // Se email foi fornecido, busca por esse email
    if (email) {
      console.log('🔍 [DEBUG] Email fornecido, buscando usuário...');
      // Primeiro, tenta encontrar como cliente
      console.log('🔍 [DEBUG] Buscando como cliente...');
      const clientes = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT id, nome_usuario, email_usuario FROM usuarios WHERE email_usuario = ?',
          [email],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });
      console.log('🔍 [DEBUG] Resultado busca cliente:', clientes.length);

      if (clientes.length > 0) {
        console.log('🔍 [DEBUG] Cliente encontrado:', clientes[0]);
        user = clientes[0];
        userEmail = user.email_usuario;
        userName = user.nome_usuario;
      } else {
        console.log('🔍 [DEBUG] Cliente não encontrado, buscando como estabelecimento...');
        // Se não encontrou como cliente, tenta como estabelecimento
        const estabelecimentos = await new Promise((resolve, reject) => {
          connection.query(
            'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE email_empresa = ?',
            [email],
            (err, results) => err ? reject(err) : resolve(results)
          );
        });
        console.log('🔍 [DEBUG] Resultado busca estabelecimento:', estabelecimentos.length);

        if (estabelecimentos.length > 0) {
          console.log('🔍 [DEBUG] Estabelecimento encontrado:', estabelecimentos[0]);
          user = estabelecimentos[0];
          userEmail = user.email_empresa;
          userName = user.nome_empresa;
        }
      }

      if (!user) {
        console.log('🔍 [DEBUG] Usuário não encontrado');
        return res.status(404).json({
          success: false,
          message: 'Email não encontrado em nosso sistema'
        });
      }
    } else {
      console.log('🔍 [DEBUG] Email não fornecido, usando usuário logado...');
      // Se não forneceu email, usa o email do usuário logado
      if (userType === 'cliente') {
        console.log('🔍 [DEBUG] Buscando dados do cliente logado...');
        const clientes = await new Promise((resolve, reject) => {
          connection.query(
            'SELECT id, nome_usuario, email_usuario FROM usuarios WHERE id = ?',
            [userId],
            (err, results) => err ? reject(err) : resolve(results)
          );
        });
        console.log('🔍 [DEBUG] Resultado busca cliente logado:', clientes.length);

        if (clientes.length > 0) {
          console.log('🔍 [DEBUG] Cliente logado encontrado:', clientes[0]);
          user = clientes[0];
          userEmail = user.email_usuario;
          userName = user.nome_usuario;
        }
      } else {
        console.log('🔍 [DEBUG] Buscando dados do estabelecimento logado...');
        const estabelecimentos = await new Promise((resolve, reject) => {
          connection.query(
            'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE id = ?',
            [userId],
            (err, results) => err ? reject(err) : resolve(results)
          );
        });
        console.log('🔍 [DEBUG] Resultado busca estabelecimento logado:', estabelecimentos.length);

        if (estabelecimentos.length > 0) {
          console.log('🔍 [DEBUG] Estabelecimento logado encontrado:', estabelecimentos[0]);
          user = estabelecimentos[0];
          userEmail = user.email_empresa;
          userName = user.nome_empresa;
        }
      }

      if (!user) {
        console.log('🔍 [DEBUG] Usuário logado não encontrado');
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
    }

    console.log('🔍 [DEBUG] Usuário final:', { user, userEmail, userName });

    // 2. Gera um token aleatório
    console.log('🔍 [DEBUG] Gerando token...');
    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 15 * 60 * 1000); // expira em 15 min
    console.log('🔍 [DEBUG] Token gerado:', token.substring(0, 10) + '...');

    // 3. Salva o token e expiração no banco
    console.log('🔍 [DEBUG] Salvando token no banco...');
    if (user.email_usuario) {
      console.log('🔍 [DEBUG] Salvando token para cliente...');
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE id = ?',
          [token, expire, user.id],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
      console.log('🔍 [DEBUG] Token salvo para cliente');
    } else {
      console.log('🔍 [DEBUG] Salvando token para estabelecimento...');
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE estabelecimentos SET reset_token = ?, reset_expires = ? WHERE id = ?',
          [token, expire, user.id],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
      console.log('🔍 [DEBUG] Token salvo para estabelecimento');
    }

    // 4. Responde imediatamente e envia email em background
    console.log('🔍 [DEBUG] Enviando resposta...');
    res.json({
      success: true,
      message: 'Solicitação de recuperação processada. Verifique seu email em alguns instantes.'
    });
    console.log('🔍 [DEBUG] Resposta enviada!');

    // Envia email em background (não bloqueia a resposta)
    console.log('🔍 [DEBUG] Iniciando envio de email em background...');
    setImmediate(async () => {
      try {
        console.log(`📧 [DEBUG] Enviando email em background para: ${userEmail}`);
        const emailSent = await emailService.sendPasswordResetEmail(
          userEmail, 
          token, 
          userName
        );

        if (emailSent) {
          console.log(`✅ [DEBUG] Email de recuperação enviado para: ${userEmail}`);
        } else {
          console.log(`⚠️ [DEBUG] Email não enviado para: ${userEmail}`);
          console.log(`🔗 [DEBUG] Token de recuperação: ${token}`);
          console.log(`🌐 [DEBUG] Link: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`);
        }
      } catch (emailError) {
        console.log(`❌ [DEBUG] Erro ao enviar email em background: ${emailError.message}`);
        console.log(`🔗 [DEBUG] Token de recuperação: ${token}`);
        console.log(`🌐 [DEBUG] Link: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`);
      }
    });

  } catch (error) {
    console.error('❌ Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Valida token de redefinição
 * 
 * GET /api/auth/validate-reset-token/:token
 */
async function validateResetToken(req, res) {
  try {
    const { token } = req.params;

    // Busca usuário com token válido
    let user = null;

    // Tenta encontrar como cliente
    const clientes = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id FROM usuarios WHERE reset_token = ? AND reset_expires > NOW()',
        [token],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (clientes.length > 0) {
      user = clientes[0];
    } else {
      // Tenta como estabelecimento
      const estabelecimentos = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT id FROM estabelecimentos WHERE reset_token = ? AND reset_expires > NOW()',
          [token],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      if (estabelecimentos.length > 0) {
        user = estabelecimentos[0];
      }
    }

    if (!user) {
      return res.json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido'
    });

  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Redefine a senha usando token
 * 
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Busca usuário com token válido
    let user = null;
    let userType = null;

    // Tenta encontrar como cliente
    const clientes = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, email_usuario, nome_usuario FROM usuarios WHERE reset_token = ? AND reset_expires > NOW()',
        [token],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (clientes.length > 0) {
      user = clientes[0];
      userType = 'cliente';
    } else {
      // Tenta como estabelecimento
      const estabelecimentos = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT id, email_empresa, nome_empresa FROM estabelecimentos WHERE reset_token = ? AND reset_expires > NOW()',
          [token],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      if (estabelecimentos.length > 0) {
        user = estabelecimentos[0];
        userType = 'estabelecimento';
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Hash da nova senha
    const hashedPassword = hashPassword(password);

    // Atualiza senha e limpa token
    if (userType === 'cliente') {
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE usuarios SET senha_usuario = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
          [hashedPassword, user.id],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
    } else {
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE estabelecimentos SET senha_empresa = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
          [hashedPassword, user.id],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
    }

    console.log(`✅ Senha redefinida com sucesso para usuário ID: ${user.id} (${userType})`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

export {
  forgotPassword,
  validateResetToken,
  resetPassword
};

export default {
  forgotPassword,
  validateResetToken,
  resetPassword
};