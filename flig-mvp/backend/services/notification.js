/**
 * Serviço de Notificações em Tempo Real para Sistema Flig
 * 
 * Gerencia notificações push, email e SMS para usuários do sistema.
 * Inclui notificações de posição na fila, pagamentos e atualizações.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import connection from '../config/db.js';

/**
 * Tipos de notificação disponíveis
 */
const NOTIFICATION_TYPES = {
  QUEUE_POSITION_UPDATE: 'queue_position_update',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  QUEUE_READY: 'queue_ready',
  QUEUE_CANCELLED: 'queue_cancelled',
  ESTABLISHMENT_UPDATE: 'establishment_update'
};

/**
 * Canais de notificação disponíveis
 */
const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app'
};

/**
 * Envia notificação para usuário
 * @param {Object} notificationData - Dados da notificação
 * @param {string} notificationData.userId - ID do usuário
 * @param {string} notificationData.userType - Tipo do usuário (cliente/estabelecimento)
 * @param {string} notificationData.type - Tipo da notificação
 * @param {string} notificationData.title - Título da notificação
 * @param {string} notificationData.message - Mensagem da notificação
 * @param {Object} notificationData.data - Dados adicionais
 * @param {Array} notificationData.channels - Canais de envio
 */
async function sendNotification(notificationData) {
  try {
    const {
      userId,
      userType,
      type,
      title,
      message,
      data = {},
      channels = [NOTIFICATION_CHANNELS.IN_APP]
    } = notificationData;

    console.log(`📱 Enviando notificação: ${type} para ${userType} ${userId}`);

    // Salva notificação no banco
    const notificationId = await saveNotification({
      user_id: userId,
      user_type: userType,
      type,
      title,
      message,
      data: JSON.stringify(data),
      channels: JSON.stringify(channels),
      status: 'sent'
    });

    // Envia por cada canal especificado
    for (const channel of channels) {
      try {
        await sendByChannel(notificationId, channel, notificationData);
      } catch (error) {
        console.error(`❌ Erro ao enviar por ${channel}:`, error);
        // Continua com outros canais mesmo se um falhar
      }
    }

    console.log(`✅ Notificação enviada: ${notificationId}`);

    return {
      success: true,
      notificationId,
      message: 'Notificação enviada com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    throw error;
  }
}

/**
 * Salva notificação no banco de dados
 * @param {Object} notificationData - Dados da notificação
 * @returns {Promise<string>} - ID da notificação
 */
async function saveNotification(notificationData) {
  const sql = `
    INSERT INTO notificacoes 
    (user_id, user_type, type, title, message, data, channels, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const result = await new Promise((resolve, reject) => {
    connection.query(sql, [
      notificationData.user_id,
      notificationData.user_type,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.data,
      notificationData.channels,
      notificationData.status
    ], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  return result.insertId.toString();
}

/**
 * Envia notificação por canal específico
 * @param {string} notificationId - ID da notificação
 * @param {string} channel - Canal de envio
 * @param {Object} notificationData - Dados da notificação
 */
async function sendByChannel(notificationId, channel, notificationData) {
  switch (channel) {
    case NOTIFICATION_CHANNELS.IN_APP:
      await sendInAppNotification(notificationId, notificationData);
      break;
    case NOTIFICATION_CHANNELS.EMAIL:
      await sendEmailNotification(notificationId, notificationData);
      break;
    case NOTIFICATION_CHANNELS.SMS:
      await sendSMSNotification(notificationId, notificationData);
      break;
    case NOTIFICATION_CHANNELS.PUSH:
      await sendPushNotification(notificationId, notificationData);
      break;
    default:
      console.warn(`⚠️ Canal de notificação não suportado: ${channel}`);
  }
}

/**
 * Envia notificação in-app (WebSocket)
 * @param {string} notificationId - ID da notificação
 * @param {Object} notificationData - Dados da notificação
 */
async function sendInAppNotification(notificationId, notificationData) {
  // Em uma implementação real, aqui seria enviado via WebSocket
  console.log(`📱 Notificação in-app enviada: ${notificationId}`);
  
  // Simula envio via WebSocket
  // Em produção, usar Socket.IO ou similar
  if (global.io) {
    global.io.to(`user_${notificationData.userId}`).emit('notification', {
      id: notificationId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Envia notificação por email
 * @param {string} notificationId - ID da notificação
 * @param {Object} notificationData - Dados da notificação
 */
async function sendEmailNotification(notificationId, notificationData) {
  // Em uma implementação real, aqui seria integrado com SendGrid, AWS SES, etc.
  console.log(`📧 Email enviado: ${notificationId}`);
  
  // Simula envio de email
  // Em produção, usar biblioteca como nodemailer
  const emailData = {
    to: await getUserEmail(notificationData.userId, notificationData.userType),
    subject: notificationData.title,
    html: generateEmailTemplate(notificationData)
  };
  
  console.log(`📧 Email simulado para: ${emailData.to}`);
}

/**
 * Envia notificação por SMS
 * @param {string} notificationId - ID da notificação
 * @param {Object} notificationData - Dados da notificação
 */
async function sendSMSNotification(notificationId, notificationData) {
  // Em uma implementação real, aqui seria integrado com Twilio, AWS SNS, etc.
  console.log(`📱 SMS enviado: ${notificationId}`);
  
  // Simula envio de SMS
  const phoneNumber = await getUserPhone(notificationData.userId, notificationData.userType);
  console.log(`📱 SMS simulado para: ${phoneNumber}`);
}

/**
 * Envia notificação push
 * @param {string} notificationId - ID da notificação
 * @param {Object} notificationData - Dados da notificação
 */
async function sendPushNotification(notificationId, notificationData) {
  // Em uma implementação real, aqui seria integrado com Firebase, OneSignal, etc.
  console.log(`🔔 Push notification enviada: ${notificationId}`);
  
  // Simula envio de push notification
  const deviceTokens = await getUserDeviceTokens(notificationData.userId);
  console.log(`🔔 Push simulado para ${deviceTokens.length} dispositivos`);
}

/**
 * Obtém email do usuário
 * @param {string} userId - ID do usuário
 * @param {string} userType - Tipo do usuário
 * @returns {Promise<string>} - Email do usuário
 */
async function getUserEmail(userId, userType) {
  const table = userType === 'cliente' ? 'usuarios' : 'estabelecimentos';
  const emailField = userType === 'cliente' ? 'email_usuario' : 'email_empresa';
  
  const sql = `SELECT ${emailField} FROM ${table} WHERE id = ?`;
  
  const results = await new Promise((resolve, reject) => {
    connection.query(sql, [userId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return results.length > 0 ? results[0][emailField] : null;
}

/**
 * Obtém telefone do usuário
 * @param {string} userId - ID do usuário
 * @param {string} userType - Tipo do usuário
 * @returns {Promise<string>} - Telefone do usuário
 */
async function getUserPhone(userId, userType) {
  const table = userType === 'cliente' ? 'usuarios' : 'estabelecimentos';
  const phoneField = userType === 'cliente' ? 'telefone_usuario' : 'telefone_empresa';
  
  const sql = `SELECT ${phoneField} FROM ${table} WHERE id = ?`;
  
  const results = await new Promise((resolve, reject) => {
    connection.query(sql, [userId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return results.length > 0 ? results[0][phoneField] : null;
}

/**
 * Obtém tokens de dispositivos do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de tokens
 */
async function getUserDeviceTokens(userId) {
  const sql = 'SELECT device_token FROM user_devices WHERE user_id = ? AND active = 1';
  
  const results = await new Promise((resolve, reject) => {
    connection.query(sql, [userId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return results.map(row => row.device_token);
}

/**
 * Gera template de email
 * @param {Object} notificationData - Dados da notificação
 * @returns {string} - HTML do email
 */
function generateEmailTemplate(notificationData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${notificationData.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Flig</h1>
        </div>
        <div class="content">
          <h2>${notificationData.title}</h2>
          <p>${notificationData.message}</p>
        </div>
        <div class="footer">
          <p>Esta é uma notificação automática do sistema Flig.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Notifica atualização de posição na fila
 * @param {string} clientId - ID do cliente
 * @param {string} queueId - ID da fila
 * @param {number} newPosition - Nova posição
 * @param {number} estimatedTime - Tempo estimado
 */
async function notifyQueuePositionUpdate(clientId, queueId, newPosition, estimatedTime) {
  await sendNotification({
    userId: clientId,
    userType: 'cliente',
    type: NOTIFICATION_TYPES.QUEUE_POSITION_UPDATE,
    title: 'Posição Atualizada na Fila',
    message: `Você está na posição ${newPosition}. Tempo estimado: ${estimatedTime} minutos.`,
    data: {
      queueId,
      position: newPosition,
      estimatedTime
    },
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.PUSH]
  });
}

/**
 * Notifica sucesso no pagamento
 * @param {string} clientId - ID do cliente
 * @param {string} queueId - ID da fila
 * @param {number} positions - Posições avançadas
 * @param {number} amount - Valor pago
 */
async function notifyPaymentSuccess(clientId, queueId, positions, amount) {
  await sendNotification({
    userId: clientId,
    userType: 'cliente',
    type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
    title: 'Pagamento Aprovado',
    message: `Você avançou ${positions} posição(ões) na fila. Valor: R$ ${amount.toFixed(2)}`,
    data: {
      queueId,
      positions,
      amount
    },
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL]
  });
}

/**
 * Notifica falha no pagamento
 * @param {string} clientId - ID do cliente
 * @param {string} queueId - ID da fila
 * @param {string} error - Mensagem de erro
 */
async function notifyPaymentFailed(clientId, queueId, error) {
  await sendNotification({
    userId: clientId,
    userType: 'cliente',
    type: NOTIFICATION_TYPES.PAYMENT_FAILED,
    title: 'Pagamento Recusado',
    message: `Não foi possível processar seu pagamento: ${error}`,
    data: {
      queueId,
      error
    },
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL]
  });
}

/**
 * Notifica que é a vez do cliente na fila
 * @param {string} clientId - ID do cliente
 * @param {string} queueId - ID da fila
 * @param {string} establishmentName - Nome do estabelecimento
 */
async function notifyQueueReady(clientId, queueId, establishmentName) {
  await sendNotification({
    userId: clientId,
    userType: 'cliente',
    type: NOTIFICATION_TYPES.QUEUE_READY,
    title: 'É a sua vez!',
    message: `Você chegou na frente da fila em ${establishmentName}. Dirija-se ao atendimento.`,
    data: {
      queueId,
      establishmentName
    },
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.PUSH, NOTIFICATION_CHANNELS.SMS]
  });
}

/**
 * Obtém notificações do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções de paginação
 * @returns {Promise<Array>} - Lista de notificações
 */
async function getUserNotifications(userId, options = {}) {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  let sql = `
    SELECT * FROM notificacoes 
    WHERE user_id = ?
  `;
  let params = [userId];

  if (unreadOnly) {
    sql += ' AND read_at IS NULL';
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return results.map(row => ({
    ...row,
    data: JSON.parse(row.data || '{}'),
    channels: JSON.parse(row.channels || '[]')
  }));
}

/**
 * Marca notificação como lida
 * @param {string} notificationId - ID da notificação
 * @param {string} userId - ID do usuário
 */
async function markNotificationAsRead(notificationId, userId) {
  const sql = `
    UPDATE notificacoes 
    SET read_at = NOW() 
    WHERE id = ? AND user_id = ?
  `;

  await new Promise((resolve, reject) => {
    connection.query(sql, [notificationId, userId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * Marca todas as notificações do usuário como lidas
 * @param {string} userId - ID do usuário
 */
async function markAllNotificationsAsRead(userId) {
  const sql = `
    UPDATE notificacoes 
    SET read_at = NOW() 
    WHERE user_id = ? AND read_at IS NULL
  `;

  await new Promise((resolve, reject) => {
    connection.query(sql, [userId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

module.exports = {
  sendNotification,
  notifyQueuePositionUpdate,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyQueueReady,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS
};

