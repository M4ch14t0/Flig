# Modo de Desenvolvimento - Flig MVP

## Visão Geral

O projeto Flig MVP foi configurado para funcionar em dois modos:

1. **Modo de Desenvolvimento (Mock)** - Para desenvolvimento do frontend sem backend
2. **Modo de Produção (Backend Real)** - Para uso com o backend implementado

## Como Alternar Entre os Modos

### 1. Modo de Desenvolvimento (Atual)

Para usar o modo de desenvolvimento (mock), mantenha a configuração atual:

```javascript
// Em: src/contexts/AuthContext.jsx
const USE_MOCK_AUTH = true;
```

**Características:**
- ✅ Funciona sem backend
- ✅ Dados salvos no localStorage
- ✅ Validações básicas implementadas
- ✅ Simula delays de rede
- ✅ Ideal para desenvolvimento do frontend

### 2. Modo de Produção (Backend Real)

Para usar o modo de produção com backend real:

```javascript
// Em: src/contexts/AuthContext.jsx
const USE_MOCK_AUTH = false;
```

**E descomente os imports necessários:**
```javascript
// Descomente esta linha:
import { api } from '../services/api';
```

**Características:**
- ✅ Integração com backend real
- ✅ Validações do servidor
- ✅ Persistência no banco de dados
- ✅ Autenticação JWT real
- ✅ Funcionalidades completas

## Estrutura do Código

O código está organizado com comentários claros para facilitar a transição:

```javascript
// ========================================
// MODO DE DESENVOLVIMENTO (MOCK)
// ========================================
if (USE_MOCK_AUTH) {
  // Código mock aqui
}

// ========================================
// MODO DE PRODUÇÃO (BACKEND REAL)
// ========================================
else {
  /*
  // Código do backend real aqui (comentado)
  */
}
```

## Endpoints do Backend Esperados

Quando implementar o backend, os seguintes endpoints devem estar disponíveis:

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/logout` - Logout de usuário

### Estrutura de Resposta Esperada

```javascript
// Sucesso
{
  success: true,
  token: "jwt-token-here",
  user: {
    id: 1,
    email: "user@example.com",
    name: "User Name",
    type: "cliente" // ou "estabelecimento"
  }
}

// Erro
{
  success: false,
  error: "Mensagem de erro"
}
```

## Transição para Produção

### Passo a Passo:

1. **Implemente o backend** com os endpoints necessários
2. **Configure a API** em `src/services/api.js`
3. **Altere a variável** `USE_MOCK_AUTH` para `false`
4. **Descomente os imports** necessários
5. **Teste a integração** completa

### Arquivos que Precisam de Ajuste:

- `src/contexts/AuthContext.jsx` - Principal arquivo de autenticação
- `src/services/api.js` - Configuração da API (criar se não existir)
- Outros serviços que usam dados mock

## Vantagens desta Abordagem

1. **Desenvolvimento Independente** - Frontend e backend podem ser desenvolvidos separadamente
2. **Transição Suave** - Mudança simples de uma variável
3. **Código Limpo** - Estrutura organizada e bem comentada
4. **Manutenibilidade** - Fácil de manter e atualizar
5. **Testes** - Permite testar frontend sem depender do backend

## Notas Importantes

- **Dados Mock** são perdidos ao alternar para produção
- **Validações** podem diferir entre mock e backend real
- **Funcionalidades** específicas do backend não estarão disponíveis no modo mock
- **Teste sempre** após a transição para produção

## Troubleshooting

### Problemas Comuns:

1. **Erro "Backend não implementado ainda"**
   - Verifique se `USE_MOCK_AUTH` está `false`
   - Confirme se o backend está rodando
   - Verifique se os endpoints estão corretos

2. **Dados não persistem**
   - No modo mock: verifique localStorage
   - No modo produção: verifique banco de dados

3. **Autenticação falha**
   - Verifique formato dos dados enviados
   - Confirme estrutura de resposta do backend
   - Verifique logs do console

