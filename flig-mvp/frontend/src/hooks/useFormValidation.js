import { useState, useCallback } from 'react';
import { VALIDATIONS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Hook customizado para validação de formulários
 * Gerencia estado, validação e erros de formulários de forma reativa
 * @param {Object} initialValues - Valores iniciais dos campos do formulário
 * @param {Object} validationRules - Regras de validação para cada campo
 * @returns {Object} - Objeto com estados e funções para gerenciar o formulário
 */
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  // Estado para armazenar os valores atuais dos campos do formulário
  const [values, setValues] = useState(initialValues);

  // Estado para armazenar erros de validação de cada campo
  const [errors, setErrors] = useState({});

  // Estado para controlar quais campos foram tocados/interagidos pelo usuário
  const [touched, setTouched] = useState({});

  /**
   * Função para validar um campo específico
   * Executa todas as regras de validação aplicáveis ao campo
   * @param {string} name - Nome do campo a ser validado
   * @param {any} value - Valor atual do campo
   * @returns {string} - Mensagem de erro ou string vazia se válido
   */
  const validateField = useCallback((name, value) => {
    // Busca as regras de validação para o campo específico
    const rules = validationRules[name];

    // Se não há regras definidas, o campo é considerado válido
    if (!rules) return '';

    // Itera por todas as regras de validação do campo
    for (const rule of rules) {
      // Regra: Campo obrigatório - verifica se existe valor e não é apenas espaços
      if (rule.required && (!value || value.trim() === '')) {
        return ERROR_MESSAGES.required;
      }

      // Regra: Comprimento mínimo - verifica se o valor tem pelo menos X caracteres
      if (rule.minLength && value && value.length < rule.minLength) {
        return `Mínimo de ${rule.minLength} caracteres`;
      }

      // Regra: Comprimento máximo - verifica se o valor não excede X caracteres
      if (rule.maxLength && value && value.length > rule.maxLength) {
        return `Máximo de ${rule.maxLength} caracteres`;
      }

      // Regra: Padrão regex - verifica se o valor corresponde ao padrão esperado
      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.message || 'Formato inválido';
      }

      // Regra: Validação customizada - executa função personalizada de validação
      if (rule.custom && value) {
        const customError = rule.custom(value, values);
        if (customError) return customError;
      }
    }

    // Se passou por todas as regras, o campo é válido
    return '';
  }, [validationRules, values]);

  /**
   * Função para validar todos os campos do formulário
   * Executa validação completa e retorna se o formulário é válido
   * @returns {boolean} - True se todos os campos são válidos, false caso contrário
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Itera por todos os campos que têm regras de validação
    Object.keys(validationRules).forEach(fieldName => {
      // Valida cada campo individualmente
      const error = validateField(fieldName, values[fieldName] || '');

      // Se há erro, adiciona ao objeto de erros e marca como inválido
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    // Atualiza o estado de erros com todos os erros encontrados
    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  /**
   * Função para atualizar o valor de um campo específico
   * Atualiza o valor e valida automaticamente se o campo foi tocado
   * @param {string} name - Nome do campo a ser atualizado
   * @param {any} value - Novo valor do campo
   */
  const setFieldValue = useCallback((name, value) => {
    // Atualiza o valor do campo no estado
    setValues(prev => ({ ...prev, [name]: value }));

    // Se o campo já foi tocado pelo usuário, valida automaticamente
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  /**
   * Função para marcar um campo como tocado/interagido
   * Marca o campo como tocado e executa validação imediata
   * @param {string} name - Nome do campo a ser marcado como tocado
   */
  const setFieldTouched = useCallback((name) => {
    // Marca o campo como tocado no estado
    setTouched(prev => ({ ...prev, [name]: true }));

    // Executa validação imediata do campo quando é tocado
    const error = validateField(name, values[name] || '');
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  /**
   * Função para resetar o formulário para valores iniciais
   * Limpa todos os erros e estados de campos tocados
   * @param {Object} newValues - Novos valores iniciais (opcional)
   */
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Função para definir todos os valores de uma vez
   * Útil para preencher formulário com dados existentes
   * @param {Object} newValues - Objeto com todos os novos valores
   */
  const setValuesAll = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  // Retorna todos os estados e funções para gerenciar o formulário
  return {
    values, // Valores atuais dos campos
    errors, // Erros de validação de cada campo
    touched, // Campos que foram tocados pelo usuário
    setFieldValue, // Função para atualizar valor de um campo
    setFieldTouched, // Função para marcar campo como tocado
    validateForm, // Função para validar todo o formulário
    resetForm, // Função para resetar o formulário
    setValuesAll, // Função para definir todos os valores
    isValid: Object.keys(errors).length === 0 || Object.values(errors).every(error => !error) // Boolean indicando se o formulário é válido
  };
};

/**
 * Regras de validação pré-definidas para campos comuns
 * Pode ser importado e usado diretamente nos formulários
 */
export const VALIDATION_RULES = {
  // Regras para campo de email
  email: [
    { required: true }, // Campo obrigatório
    { pattern: VALIDATIONS.email, message: ERROR_MESSAGES.invalidEmail } // Padrão de email válido
  ],

  // Regras para campo de senha
  password: [
    { required: true }, // Campo obrigatório
    { minLength: 6, message: 'Senha deve ter pelo menos 6 caracteres' } // Mínimo 6 caracteres
  ],

  // Regras para campo de nome
  name: [
    { required: true }, // Campo obrigatório
    { minLength: 2, message: 'Nome deve ter pelo menos 2 caracteres' } // Mínimo 2 caracteres
  ],

  // Regras para campo de CPF
  cpf: [
    { required: true }, // Campo obrigatório
    { pattern: VALIDATIONS.cpf, message: ERROR_MESSAGES.invalidCPF } // Padrão de CPF válido
  ],

  // Regras para campo de CNPJ
  cnpj: [
    { required: true }, // Campo obrigatório
    { pattern: VALIDATIONS.cnpj, message: ERROR_MESSAGES.invalidCNPJ } // Padrão de CNPJ válido
  ],

  // Regras para campo de telefone
  phone: [
    { required: true }, // Campo obrigatório
    { pattern: VALIDATIONS.phone, message: ERROR_MESSAGES.invalidPhone } // Padrão de telefone válido
  ]
};
