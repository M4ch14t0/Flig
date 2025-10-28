# 🔄 Fluxo Completo de Avanço na Fila - Flig

## 📋 **FLUXO ATUAL (Implementado)**

### 🎯 **1. Frontend - MinhasFilas.jsx**
```
Cliente clica em "Avançar Posições" 
    ↓
handleAdvancePosition() é chamado
    ↓
Abre popup com seleção de posições
    ↓
Cliente clica em "Avançar X posições" (confirmBtn)
    ↓
handleConfirmAdvance() é executado
    ↓
AVANÇO REAL LOCAL (sem API)
    ↓
Reorganiza fila localmente
    ↓
Atualiza interface
    ↓
Redireciona para Mercado Pago
```

### 🎯 **2. Frontend - QueueComponent.jsx**
```
Cliente clica em "Avançar na Fila"
    ↓
handleAdvanceInQueue() é executado
    ↓
AVANÇO REAL LOCAL (sem API)
    ↓
Reorganiza fila localmente
    ↓
Atualiza interface
    ↓
Redireciona para Mercado Pago
```

## 🔧 **FLUXO ORIGINAL (Backend)**

### 🎯 **1. Frontend → Backend**
```
POST /api/queues/:queueId/advance
    ↓
Body: { clientId, positions, paymentData }
    ↓
Headers: Authorization: Bearer <token>
```

### 🎯 **2. Backend - queueController.js**
```
advanceInQueue() recebe requisição
    ↓
Valida dados (clientId, positions, paymentData)
    ↓
Processa pagamento via MercadoPagoService
    ↓
Busca cliente na fila pelo email
    ↓
Chama queue.advanceClientVertically()
    ↓
Retorna resposta com nova posição
```

### 🎯 **3. Backend - Queue.js (Model)**
```
advanceClientVertically() é chamado
    ↓
Valida posição atual e posições a avançar
    ↓
Chama redisService.advanceClientWithRental()
    ↓
Retorna resultado do avanço
```

### 🎯 **4. Backend - redis.js (Service)**
```
advanceClientWithRental() é executado
    ↓
Valida regras de avanço (posições 1,2,3 bloqueadas)
    ↓
Remove cliente da posição atual
    ↓
Adiciona cliente na nova posição
    ↓
Preenche lacuna deixada (fillGapAfterAdvance)
    ↓
Atualiza Redis com nova estrutura
```

### 🎯 **5. Backend → Frontend**
```
Resposta JSON:
{
  success: true,
  data: {
    oldPosition: 5,
    newPosition: 3,
    positionsAdvanced: 2,
    estimatedTime: 10,
    amount: 20.00
  }
}
```

## 🔄 **FLUXO ALTERNATIVO (Webhook)**

### 🎯 **1. Mercado Pago → Backend**
```
Webhook POST /api/payments/webhooks/mercadopago
    ↓
paymentController.processWebhook()
    ↓
Valida assinatura do webhook
    ↓
Chama processApprovedPayment()
```

### 🎯 **2. Backend - paymentController.js**
```
processApprovedPayment() é executado
    ↓
Chama MercadoPagoService.processQueueAdvance()
    ↓
Processa avanço baseado no externalReference
    ↓
Atualiza fila no Redis
```

### 🎯 **3. Backend - mercadopago.js**
```
processQueueAdvance() é executado
    ↓
Extrai dados do externalReference
    ↓
Busca fila e cliente
    ↓
Chama redisService.advanceClientWithRental()
    ↓
Atualiza posição do cliente
```

## 🎭 **FLUXO ATUAL (Migué)**

### ✅ **Implementação Atual:**
1. **Frontend processa avanço localmente** (sem API)
2. **Reorganiza fila em tempo real**
3. **Atualiza interface instantaneamente**
4. **Redireciona para Mercado Pago** (para aparência)
5. **Usuário pode "fazer migué"** entrando e saindo

### ❌ **Problemas Identificados:**
1. **Duas implementações diferentes**: MinhasFilas.jsx vs QueueComponent.jsx
2. **Identificação de cliente inconsistente**
3. **Dados não sincronizados** entre componentes
4. **Falta de persistência** (avanço é perdido ao recarregar)

## 🔧 **ARQUITETURA RECOMENDADA**

### 🎯 **Fluxo Ideal:**
```
1. Frontend: Cliente clica em "Avançar"
2. Frontend: Valida dados localmente
3. Frontend: Chama API para processar pagamento
4. Backend: Cria preferência Mercado Pago
5. Frontend: Redireciona para Mercado Pago
6. Mercado Pago: Processa pagamento
7. Webhook: Notifica backend sobre pagamento
8. Backend: Processa avanço na fila
9. Frontend: Recarrega dados da fila
10. Frontend: Mostra nova posição
```

### 🎯 **Componentes Envolvidos:**
- **MinhasFilas.jsx**: Lista de filas do usuário
- **QueueComponent.jsx**: Visualização individual da fila
- **MercadoPagoButton.jsx**: Processamento de pagamento
- **queueController.js**: Lógica de negócio
- **redis.js**: Gerenciamento de filas
- **mercadopago.js**: Integração com pagamentos

## 🚀 **STATUS ATUAL**

### ✅ **Funcionando:**
- Avanço local no frontend
- Reorganização de fila
- Interface atualizada
- Redirecionamento para pagamento

### ❌ **Problemas:**
- Identificação de cliente inconsistente
- Duas implementações diferentes
- Falta de sincronização com backend
- Dados não persistem

### 🔧 **Próximos Passos:**
1. Unificar implementação em um só lugar
2. Corrigir identificação de cliente
3. Implementar sincronização com backend
4. Adicionar persistência de dados
