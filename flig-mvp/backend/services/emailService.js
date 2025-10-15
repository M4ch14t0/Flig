/**
 * Serviço de Email para Sistema Flig
 * 
 * Este módulo fornece funcionalidades para envio de emails
 * como recuperação de senha, notificações, etc.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

// Carregar variáveis de ambiente
require('dotenv').config();

const nodemailer = require('nodemailer');

// Configuração do transporter (usando variáveis de ambiente consistentes)
const createTransporter = () => {
  // Usar variáveis de ambiente padronizadas
  const email = process.env.EMAIL_USER || process.env.MAIL_USER;
  const password = process.env.EMAIL_PASS || process.env.MAIL_PASS;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const secure = process.env.EMAIL_SECURE === 'true' || false;
  
  if (!email || !password) {
    console.warn('⚠️ Configuração de email não encontrada. Usando configuração de fallback.');
    return null;
  }
  
  // Detectar provedor baseado no email (usando configuração fornecida)
  let service = 'gmail'; // padrão
  let detectedHost = host;
  let detectedPort = port;
  let detectedSecure = secure;

  if (email.includes('@outlook.com') || email.includes('@hotmail.com') || email.includes('@live.com')) {
    service = 'hotmail';
    detectedHost = 'smtp-mail.outlook.com';
    detectedPort = 587;
    detectedSecure = false;
  } else if (email.includes('@gmail.com')) {
    service = 'gmail';
    detectedHost = 'smtp.gmail.com';
    detectedPort = 587;
    detectedSecure = false;
  } else if (email.includes('@yahoo.com')) {
    service = 'yahoo';
    detectedHost = 'smtp.mail.yahoo.com';
    detectedPort = 587;
    detectedSecure = false;
  }

  // Configuração com timeout reduzido
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || service,
    host: process.env.SMTP_HOST || detectedHost,
    port: parseInt(process.env.SMTP_PORT) || detectedPort,
    secure: process.env.SMTP_SECURE === 'true' || detectedSecure,
    auth: {
      user: email,
      pass: password
    },
    // Configurações de timeout
    connectionTimeout: 3000, // 3 segundos
    greetingTimeout: 3000,  // 3 segundos
    socketTimeout: 3000,    // 3 segundos
    // Configurações adicionais para Outlook
    tls: {
      ciphers: 'SSLv3'
    }
  });
};

/**
 * Envia email de recuperação de senha
 * @param {string} email - Email do destinatário
 * @param {string} token - Token de recuperação
 * @param {string} userName - Nome do usuário
 * @returns {Promise<boolean>} Sucesso do envio
 */
async function sendPasswordResetEmail(email, token, userName) {
  try {
    console.log(`📧 Tentando enviar email de recuperação para: ${email}`);
    
    // Verifica se há configuração de email
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log(`⚠️ Configuração de email não encontrada. Token gerado: ${token}`);
      console.log(`🔗 Link de recuperação: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`);
      return false; // Retorna false mas não falha
    }
    
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flig.com',
      to: email,
      subject: '🔐 Recuperação de Senha - Flig',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha - Flig</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #ffffff;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #1F1F1F;
            }
            .container {
              background-color: #1F1F1F;
              border-radius: 15px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
              border: 1px solid #333333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 42px;
              font-weight: 900;
              color: #152E60;
              margin-bottom: 15px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
              letter-spacing: 2px;
            }
            .logo-container {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
              gap: 15px;
            }
            .logo-icon {
              font-size: 48px;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
            .title {
              color: #ffffff;
              font-size: 28px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .content {
              margin-bottom: 40px;
            }
            .content p {
              color: #cccccc;
              font-size: 16px;
              margin-bottom: 15px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #152E60 0%, #1a3a7a 100%);
              color: white;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 700;
              text-align: center;
              margin: 25px 0;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(21, 46, 96, 0.4);
              transition: all 0.3s ease;
              border: 2px solid #1a3a7a;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(21, 46, 96, 0.6);
            }
            .warning {
              background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
              border: 2px solid #ff6b6b;
              color: #ff6b6b;
              padding: 20px;
              border-radius: 10px;
              margin: 25px 0;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
            }
            .warning strong {
              color: #ff6b6b;
              font-size: 18px;
            }
            .warning ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .warning li {
              margin-bottom: 8px;
              color: #ffffff;
            }
            .footer {
              text-align: center;
              color: #aaaaaa;
              font-size: 14px;
              margin-top: 40px;
              padding-top: 25px;
              border-top: 1px solid #333333;
            }
            .link-fallback {
              word-break: break-all;
              background: #0a0a0a;
              padding: 15px;
              border-radius: 8px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #aaaaaa;
              border: 1px solid #333333;
              margin: 20px 0;
            }
            .highlight {
              color: #ffffff;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="logo-icon">🚀</div>
                <div class="logo">FLIG</div>
              </div>
              <h1 class="title">Recuperação de Senha</h1>
            </div>
            
            <div class="content">
              <p>Olá <span class="highlight">${userName}</span>,</p>
              
              <p>Recebemos uma solicitação para redefinir a senha da sua conta Flig.</p>
              
              <p>Para criar uma nova senha, clique no botão abaixo:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">🔐 Redefinir Senha</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este link expira em <strong>15 minutos</strong></li>
                  <li>Se você não solicitou esta recuperação, ignore este email</li>
                  <li>Não compartilhe este link com ninguém</li>
                </ul>
              </div>
              
              <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <div class="link-fallback">
                ${resetUrl}
              </div>
            </div>
            
            <div class="footer">
              <p>Este é um email automático, não responda.</p>
              <p>&copy 2025 Flig - Sistema de Filas Inteligente</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email de recuperação enviado:');
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de recuperação:', error);
    return false;
  }
}

/**
 * Envia email de confirmação de redefinição de senha
 * @param {string} email - Email do destinatário
 * @param {string} userName - Nome do usuário
 * @returns {Promise<boolean>} Sucesso do envio
 */
async function sendPasswordResetConfirmation(email, userName) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flig.com',
      to: email,
      subject: '✅ Senha Redefinida com Sucesso - Flig',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Senha Redefinida - Flig</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 10px;
            }
            .title {
              color: #28a745;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 FLIG</div>
              <div class="success-icon">✅</div>
              <h1 class="title">Senha Redefinida com Sucesso!</h1>
            </div>
            
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              
              <p>Sua senha foi redefinida com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.</p>
              
              <p>Agora você pode fazer login com sua nova senha.</p>
              
              <p>Se você não fez esta alteração, entre em contato conosco imediatamente.</p>
            </div>
            
            <div class="footer">
              <p>Este email foi enviado automaticamente pelo sistema Flig.</p>
              <p>© 2025 Flig Soluções de Agilidade. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email de confirmação enviado:');
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação:', error);
    return false;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
};
