# 👥 USUÁRIOS DE TESTE PARA O SISTEMA FLIG

## 🔐 **USUÁRIOS (CLIENTES)**

### 1. João Silva Santos
- **Email:** joao.silva@email.com
- **Senha:** 123456
- **CPF:** 11144477735
- **Telefone:** (11) 99999-1234
- **Endereço:** Rua das Flores, 123

### 2. Maria Oliveira Costa
- **Email:** maria.oliveira@email.com
- **Senha:** 123456
- **CPF:** 12345678909
- **Telefone:** (11) 98888-5678
- **Endereço:** Av. Paulista, 1000

### 3. Pedro Santos Lima
- **Email:** pedro.santos@email.com
- **Senha:** 123456
- **CPF:** 98765432100
- **Telefone:** (11) 97777-9012
- **Endereço:** Rua Augusta, 500

### 4. Ana Paula Ferreira
- **Email:** ana.ferreira@email.com
- **Senha:** 123456
- **CPF:** 45678912345
- **Telefone:** (11) 96666-3456
- **Endereço:** Rua Oscar Freire, 200

### 5. Carlos Eduardo Souza
- **Email:** carlos.souza@email.com
- **Senha:** 123456
- **CPF:** 78912345678
- **Telefone:** (11) 95555-7890
- **Endereço:** Av. Faria Lima, 1500

---

## 🏢 **ESTABELECIMENTOS**

### 1. Restaurante Sabor & Arte
- **Email:** contato@saborarte.com.br
- **Senha:** 123456
- **CNPJ:** 12345678000195
- **Categoria:** Restaurante
- **Telefone:** (11) 3333-4444
- **Endereço:** Rua das Palmeiras, 456
- **Horário:** 11:00 - 22:00

### 2. Café Central
- **Email:** contato@cafecentral.com.br
- **Senha:** 123456
- **CNPJ:** 98765432000123
- **Categoria:** Cafeteria
- **Telefone:** (11) 3333-5555
- **Endereço:** Av. Paulista, 2000
- **Horário:** 06:00 - 20:00

### 3. Barbearia Moderna
- **Email:** contato@barbeariamoderna.com.br
- **Senha:** 123456
- **CNPJ:** 45678912000134
- **Categoria:** Barbearia
- **Telefone:** (11) 3333-6666
- **Endereço:** Rua Augusta, 800
- **Horário:** 09:00 - 19:00

### 4. Farmácia Saúde Total
- **Email:** contato@saudetotal.com.br
- **Senha:** 123456
- **CNPJ:** 78912345000156
- **Categoria:** Farmácia
- **Telefone:** (11) 3333-7777
- **Endereço:** Rua Oscar Freire, 300
- **Horário:** 24 horas

### 5. Academia FitLife
- **Email:** contato@fitlife.com.br
- **Senha:** 123456
- **CNPJ:** 32165498000178
- **Categoria:** Academia
- **Telefone:** (11) 3333-8888
- **Endereço:** Av. Faria Lima, 2000
- **Horário:** 05:00 - 23:00

---

## 🚀 **COMO TESTAR:**

### **Frontend:**
- Acesse: http://localhost:3000
- Use qualquer um dos emails e senhas acima

### **API Direta:**
```bash
# Login de usuário
curl -X POST http://localhost:5000/api/auth/login/user \
  -H "Content-Type: application/json" \
  -d '{"email_usuario": "joao.silva@email.com", "senha_usuario": "123456"}'

# Login de estabelecimento
curl -X POST http://localhost:5000/api/auth/login/establishment \
  -H "Content-Type: application/json" \
  -d '{"email_empresa": "contato@saborarte.com.br", "senha_empresa": "123456"}'
```

### **Endpoints Disponíveis:**
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **Frontend:** http://localhost:3000

---

## 📝 **NOTAS:**
- Todos os usuários têm a mesma senha: **123456**
- Os CPFs e CNPJs são válidos para teste
- O sistema está rodando e funcionando perfeitamente
- Use qualquer combinação de email/senha para testar
