const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    console.log('🔧 Testando configuração de email...');

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📧 Enviando email de teste...');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@flig.com.br',
      to: process.env.EMAIL_USER,
      subject: 'Teste de Email - Flig',
      html: `
        <h2>Teste de Email</h2>
        <p>Este é um email de teste do sistema Flig.</p>
        <p>Se você recebeu este email, a configuração está funcionando!</p>
        <p>Data: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.log('\n🔧 Verifique:');
    console.log('1. EMAIL_USER está definido');
    console.log('2. EMAIL_PASS está definido (senha de app)');
    console.log('3. Autenticação de 2 fatores está ativa');
    console.log('4. Senha de app foi gerada corretamente');
  }
}

testEmail();
