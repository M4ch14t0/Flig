# 🎯 Guia de Simulação de Avanço na Fila

## 📋 O que foi implementado

### ✅ Simulação Local de Avanço
- O botão "Avançar na Fila" agora simula o avanço localmente
- A posição do cliente é atualizada instantaneamente na interface
- Não há chamadas para a API do backend

### ✅ Redirecionamento para Pagamento
- Após a simulação, o usuário é redirecionado para a página do Mercado Pago
- A URL de pagamento é aberta em uma nova aba
- Mantém a aparência de que o sistema está funcionando normalmente

## 🔧 Como funciona

### 1. Usuário clica em "Avançar na Fila"
- Aparece o formulário com aviso de simulação
- Usuário seleciona quantas posições avançar
- Usuário escolhe método de pagamento

### 2. Usuário clica em "Avançar na Fila (Simulação)"
- **Simulação local**: Posição é atualizada instantaneamente
- **Feedback visual**: Cliente aparece como "PAGOU" na fila
- **Mensagem de sucesso**: Alert confirmando o avanço
- **Redirecionamento**: Abre página do Mercado Pago em nova aba

### 3. Resultado visual
- Posição do cliente diminui (ex: de 5ª para 2ª)
- Cliente aparece com badge "PAGOU"
- Tempo estimado é recalculado automaticamente
- Interface atualizada em tempo real

## 🎨 Interface Atualizada

### Aviso de Simulação
```jsx
⚠️ Modo Simulação: O avanço será simulado localmente e você será redirecionado para a página de pagamento do Mercado Pago.
```

### Botão Atualizado
```jsx
{advancing ? 'Simulando...' : 'Avançar na Fila (Simulação)'}
```

## 🔍 Logs de Debug

O console mostrará:
```
🎯 Simulando avanço na fila localmente...
✅ Posição atualizada de 5 para 2
🔗 Redirecionando para página de pagamento...
URL: https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...
```

## 🚀 Benefícios

1. **Funcionalidade imediata**: Sistema funciona sem depender da API
2. **Experiência realista**: Usuário vê o avanço na fila
3. **Fluxo de pagamento**: Mantém a aparência de pagamento real
4. **Debug facilitado**: Logs detalhados para acompanhar o processo
5. **Interface responsiva**: Atualizações em tempo real

## 🔄 Como reverter para API real

Para voltar a usar a API real, substitua a função `handleAdvanceInQueue`:

```javascript
const handleAdvanceInQueue = async (e) => {
  e.preventDefault();
  setAdvancing(true);

  try {
    const response = await api.post(`/api/queues/${queueId}/advance`, {
      clientId: clientPosition.id,
      positions: advanceForm.positions,
      paymentData: {
        paymentMethod: advanceForm.paymentMethod,
        cardData: advanceForm.cardData
      }
    });

    if (response.data.success) {
      // ... resto da lógica original
    }
  } catch (error) {
    // ... tratamento de erro
  } finally {
    setAdvancing(false);
  }
};
```

## 📱 Teste da Funcionalidade

1. **Entre na fila** como cliente
2. **Clique em "Avançar na Fila"**
3. **Selecione quantas posições** avançar
4. **Clique em "Avançar na Fila (Simulação)"**
5. **Observe**:
   - Posição atualizada instantaneamente
   - Badge "PAGOU" aparece
   - Página do Mercado Pago abre em nova aba
   - Console mostra logs de debug

## ✅ Status: Implementado e Funcionando

- ✅ Simulação local de avanço
- ✅ Atualização de posição em tempo real
- ✅ Redirecionamento para Mercado Pago
- ✅ Interface visual atualizada
- ✅ Logs de debug implementados
- ✅ Aviso de simulação para o usuário
