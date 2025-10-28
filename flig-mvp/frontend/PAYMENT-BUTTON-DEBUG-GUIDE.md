# 🔍 Guia de Debug - Botão de Pagamento

## 🚨 PROBLEMA IDENTIFICADO

O backend está funcionando perfeitamente (preferência criada com sucesso), mas o erro ocorre **após** clicar no botão de pagar, durante o processamento no Mercado Pago.

## 🔧 SOLUÇÕES PARA TESTAR

### 1. Teste com Arquivo de Debug
**Arquivo**: `debug-payment-button.html`

1. Abra o arquivo no navegador
2. Execute os testes sequencialmente:
   - Criar Preferência
   - Testar Botão
3. Monitore os logs detalhados
4. Identifique onde exatamente o erro ocorre

### 2. Teste com Componente Debug
**Arquivo**: `MercadoPagoButtonDebug.jsx`

1. Substitua temporariamente o componente original:
   ```jsx
   // Em vez de:
   import MercadoPagoButton from './MercadoPagoButton';
   
   // Use:
   import MercadoPagoButtonDebug from './MercadoPagoButtonDebug';
   ```

2. O componente debug mostrará logs detalhados em tempo real
3. Identifique o ponto exato onde o erro ocorre

### 3. Possíveis Causas do Erro

#### A. Problema com SDK do Mercado Pago
- **Sintoma**: Erro ao inicializar o Wallet
- **Solução**: Verificar se o SDK está carregando corretamente

#### B. Problema com Preferência ID
- **Sintoma**: Wallet não renderiza ou mostra erro
- **Solução**: Verificar se o preferenceId está correto

#### C. Problema com URLs de Retorno
- **Sintoma**: Erro após clicar em pagar
- **Solução**: Verificar se as URLs de retorno estão corretas no Railway

#### D. Problema com CORS
- **Sintoma**: Erro de CORS no console
- **Solução**: Verificar configuração de CORS

#### E. Problema com Webhook
- **Sintoma**: Pagamento aprovado mas não processado
- **Solução**: Verificar configuração do webhook

## 🧪 TESTES ESPECÍFICOS

### Teste 1: Verificar SDK
```javascript
// No console do navegador
console.log('MercadoPago:', typeof MercadoPago);
console.log('Wallet:', typeof MercadoPago?.Wallet);
```

### Teste 2: Verificar Preferência
```javascript
// Verificar se a preferência está correta
console.log('Preference ID:', preferenceId);
console.log('URL:', `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`);
```

### Teste 3: Verificar URLs de Retorno
1. Acesse a URL de pagamento diretamente
2. Verifique se redireciona corretamente
3. Verifique se as URLs de retorno estão corretas

### Teste 4: Verificar Webhook
1. Faça um pagamento de teste
2. Verifique se o webhook é chamado
3. Verifique se o webhook processa corretamente

## 📋 CHECKLIST DE DEBUG

- [ ] SDK do Mercado Pago carregado
- [ ] Preferência criada com sucesso
- [ ] Preference ID válido
- [ ] Wallet renderiza corretamente
- [ ] URLs de retorno corretas
- [ ] CORS configurado
- [ ] Webhook funcionando
- [ ] Logs detalhados ativados

## 🎯 RESULTADO ESPERADO

Após identificar e corrigir o problema:
- ✅ Botão de pagamento renderiza
- ✅ Clique no botão funciona
- ✅ Redirecionamento para Mercado Pago
- ✅ Pagamento processado com sucesso
- ✅ Redirecionamento de volta para aplicação
- ✅ Webhook processado

## 📞 PRÓXIMOS PASSOS

1. **Execute o teste com `debug-payment-button.html`**
2. **Identifique o erro específico nos logs**
3. **Aplique a correção correspondente**
4. **Teste novamente**

## 🔍 LOGS IMPORTANTES

Monitore estes logs específicos:
- `✅ Pagamento aprovado:` - Sucesso
- `❌ Erro no pagamento:` - Falha
- `CSP` - Problemas de Content Security Policy
- `CORS` - Problemas de CORS
- `Network Error` - Problemas de rede
- `Webhook` - Problemas de webhook
