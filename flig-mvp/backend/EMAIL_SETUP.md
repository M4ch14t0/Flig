# Configuração de Email - Flig

## Configuração do Gmail

### 1. Ativar Autenticação de 2 Fatores
- Acesse: https://myaccount.google.com/security
- Ative a "Verificação em duas etapas"

### 2. Gerar Senha de App
- Acesse: https://myaccount.google.com/apppasswords
- Selecione "Mail" e "Outro (nome personalizado)"
- Digite "Flig App" e clique em "Gerar"
- **COPIE A SENHA GERADA** (16 caracteres)

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` no backend com:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-16-caracteres
EMAIL_FROM=noreply@flig.com.br
```

### 4. Testar Configuração

Execute o script de teste:
```bash
node scripts/test-email.js
```

## Configuração Alternativa (Outlook/Hotmail)

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua-senha
```

## Configuração Alternativa (Yahoo)

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=seu-email@yahoo.com
EMAIL_PASS=sua-senha-de-app
```

## Troubleshooting

### Erro: "Invalid login"
- Verifique se a senha de app está correta
- Confirme que a autenticação de 2 fatores está ativa

### Erro: "Connection timeout"
- Verifique se a porta 587 está liberada
- Teste com porta 465 (SSL)

### Erro: "Authentication failed"
- Gere uma nova senha de app
- Verifique se o email está correto
