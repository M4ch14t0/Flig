#!/bin/bash

# Script de Setup Completo da Database Flig
# Este script configura toda a database do zero ou aplica migrações
# 
# @author Flig Team
# @version 1.0.0

echo "🚀 === SETUP DATABASE FLIG ==="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se MySQL está rodando
check_mysql() {
    print_info "Verificando se MySQL está rodando..."
    
    if ! systemctl is-active --quiet mysql; then
        print_warning "MySQL não está rodando. Tentando iniciar..."
        sudo systemctl start mysql
        
        if [ $? -eq 0 ]; then
            print_status "MySQL iniciado com sucesso!"
        else
            print_error "Falha ao iniciar MySQL. Verifique a instalação."
            exit 1
        fi
    else
        print_status "MySQL está rodando!"
    fi
}

# Solicitar credenciais do MySQL
get_mysql_credentials() {
    print_info "Solicitando credenciais do MySQL..."
    
    read -p "Usuário MySQL (padrão: root): " MYSQL_USER
    MYSQL_USER=${MYSQL_USER:-root}
    
    read -s -p "Senha MySQL: " MYSQL_PASSWORD
    echo ""
    
    if [ -z "$MYSQL_PASSWORD" ]; then
        print_warning "Senha vazia detectada. Continuando sem senha..."
        MYSQL_CMD="mysql -u $MYSQL_USER"
    else
        MYSQL_CMD="mysql -u $MYSQL_USER -p$MYSQL_PASSWORD"
    fi
}

# Testar conexão com MySQL
test_mysql_connection() {
    print_info "Testando conexão com MySQL..."
    
    if $MYSQL_CMD -e "SELECT 1;" > /dev/null 2>&1; then
        print_status "Conexão com MySQL estabelecida!"
    else
        print_error "Falha na conexão com MySQL. Verifique as credenciais."
        exit 1
    fi
}

# Verificar se o banco já existe
check_database_exists() {
    print_info "Verificando se o banco 'flig_db' já existe..."
    
    DB_EXISTS=$($MYSQL_CMD -e "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='flig_db';" 2>/dev/null | grep -c "flig_db")
    
    if [ $DB_EXISTS -gt 0 ]; then
        print_warning "Banco 'flig_db' já existe!"
        read -p "Deseja recriar o banco? (y/N): " RECREATE_DB
        
        if [[ $RECREATE_DB =~ ^[Yy]$ ]]; then
            print_info "Removendo banco existente..."
            $MYSQL_CMD -e "DROP DATABASE IF EXISTS flig_db;"
            print_status "Banco removido!"
            return 0
        else
            print_info "Aplicando migrações no banco existente..."
            return 1
        fi
    else
        print_info "Banco 'flig_db' não existe. Criando novo banco..."
        return 0
    fi
}

# Criar banco do zero
create_fresh_database() {
    print_info "Criando banco de dados do zero..."
    
    if $MYSQL_CMD < schema_corrigido.sql; then
        print_status "Schema criado com sucesso!"
    else
        print_error "Falha ao criar schema!"
        exit 1
    fi
    
    print_info "Inserindo dados de seed..."
    if $MYSQL_CMD < seed.sql; then
        print_status "Dados de seed inseridos com sucesso!"
    else
        print_error "Falha ao inserir dados de seed!"
        exit 1
    fi
}

# Aplicar migrações
apply_migrations() {
    print_info "Aplicando migrações..."
    
    if $MYSQL_CMD < migrate.sql; then
        print_status "Migrações aplicadas com sucesso!"
    else
        print_error "Falha ao aplicar migrações!"
        exit 1
    fi
}

# Verificar integridade
verify_database() {
    print_info "Verificando integridade da database..."
    
    if $MYSQL_CMD < verify_database.sql; then
        print_status "Verificação concluída!"
    else
        print_error "Falha na verificação!"
        exit 1
    fi
}

# Mostrar resumo
show_summary() {
    echo ""
    print_status "=== RESUMO DO SETUP ==="
    echo ""
    print_info "Banco de dados: flig_db"
    print_info "Usuário MySQL: $MYSQL_USER"
    print_info "Localização: $(pwd)"
    echo ""
    print_info "Tabelas criadas:"
    $MYSQL_CMD -e "USE flig_db; SHOW TABLES;" 2>/dev/null | tail -n +2 | while read table; do
        echo "  - $table"
    done
    echo ""
    print_info "Para testar a conexão:"
    echo "  mysql -u $MYSQL_USER -p flig_db"
    echo ""
    print_status "Setup concluído com sucesso! 🎉"
}

# Função principal
main() {
    echo "Este script irá configurar a database do sistema Flig."
    echo "Escolha uma opção:"
    echo "1) Setup completo (criar do zero)"
    echo "2) Aplicar apenas migrações"
    echo "3) Apenas verificar database existente"
    echo ""
    read -p "Opção (1-3): " OPTION
    
    case $OPTION in
        1)
            print_info "Iniciando setup completo..."
            check_mysql
            get_mysql_credentials
            test_mysql_connection
            
            if check_database_exists; then
                create_fresh_database
            else
                apply_migrations
            fi
            
            verify_database
            show_summary
            ;;
        2)
            print_info "Aplicando migrações..."
            check_mysql
            get_mysql_credentials
            test_mysql_connection
            apply_migrations
            verify_database
            show_summary
            ;;
        3)
            print_info "Verificando database existente..."
            check_mysql
            get_mysql_credentials
            test_mysql_connection
            verify_database
            ;;
        *)
            print_error "Opção inválida!"
            exit 1
            ;;
    esac
}

# Executar script
main "$@"

