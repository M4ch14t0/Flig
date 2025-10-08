/**
 * Serviço de Validação de CNPJ para Sistema Flig
 * 
 * Integra com API CNPJá para validação real de CNPJ.
 * Verifica se o CNPJ existe na Receita Federal.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const axios = require('axios');

// Configurações da API CNPJá
const CNPJA_API_URL = 'https://open.cnpja.com/office';
const CNPJA_TOKEN = process.env.CNPJA_TOKEN;

/**
 * Valida CNPJ matematicamente (dígitos verificadores)
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - True se válido
 */
function validateCNPJFormat(cnpj) {
  if (!cnpj) return false;
  
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpj[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  if (digito1 !== parseInt(cnpj[12])) return false;
  
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpj[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  if (digito2 !== parseInt(cnpj[13])) return false;
  
  return true;
}

/**
 * Valida CNPJ na Receita Federal usando API CNPJá
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {Promise<Object>} - Resultado da validação
 */
async function validateCNPJWithAPI(cnpj) {
  try {
    // Remove formatação
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    // Valida formato primeiro
    if (!validateCNPJFormat(cleanCNPJ)) {
      return {
        valid: false,
        message: 'CNPJ inválido - dígitos verificadores incorretos',
        data: null
      };
    }

    // Se não tiver token da API, apenas valida formato
    if (!CNPJA_TOKEN) {
      console.warn('⚠️ CNPJA_TOKEN não configurado - validando apenas formato');
      return {
        valid: true,
        message: 'CNPJ válido (apenas formato)',
        data: null
      };
    }

    // Consulta API CNPJá
    const response = await axios.get(`${CNPJA_API_URL}/${cleanCNPJ}`, {
      headers: {
        'Authorization': CNPJA_TOKEN ? `Bearer ${CNPJA_TOKEN}` : undefined
      },
      timeout: 5000 // 5 segundos de timeout
    });

    // Verifica se CNPJ foi encontrado
    if (response.data && response.data.company) {
      return {
        valid: true,
        message: 'CNPJ válido e encontrado na Receita Federal',
        data: {
          razao_social: response.data.company.name,
          nome_fantasia: response.data.alias,
          situacao: response.data.status?.text,
          data_abertura: response.data.founded,
          porte: response.data.size?.text,
          cnae_principal: response.data.mainActivity?.text
        }
      };
    } else {
      return {
        valid: false,
        message: 'CNPJ não encontrado na Receita Federal',
        data: null
      };
    }

  } catch (error) {
    console.error('❌ Erro ao validar CNPJ com API:', error.message);
    
    // Se API falhou, valida apenas formato
    if (validateCNPJFormat(cnpj.replace(/[^\d]/g, ''))) {
      return {
        valid: true,
        message: 'CNPJ válido (formato) - API indisponível',
        data: null,
        warning: 'Não foi possível validar com a Receita Federal'
      };
    }
    
    return {
      valid: false,
      message: 'CNPJ inválido',
      data: null
    };
  }
}

/**
 * Busca informações de um CNPJ
 * @param {string} cnpj - CNPJ a ser consultado
 * @returns {Promise<Object>} - Dados do CNPJ
 */
async function getCNPJInfo(cnpj) {
  try {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    if (!CNPJA_TOKEN) {
      throw new Error('CNPJA_TOKEN não configurado');
    }

    const response = await axios.get(`${CNPJA_API_URL}/${cleanCNPJ}`, {
      headers: {
        'Authorization': `Bearer ${CNPJA_TOKEN}`
      },
      timeout: 5000
    });

    if (response.data && response.data.company) {
      return {
        success: true,
        data: {
          cnpj: cleanCNPJ,
          razao_social: response.data.company.name,
          nome_fantasia: response.data.alias,
          situacao: response.data.status?.text,
          data_abertura: response.data.founded,
          porte: response.data.size?.text,
          cnae_principal: response.data.mainActivity?.text,
          endereco: {
            cep: response.data.address?.zip,
            logradouro: response.data.address?.street,
            numero: response.data.address?.number,
            complemento: response.data.address?.details,
            bairro: response.data.address?.district,
            cidade: response.data.address?.city,
            uf: response.data.address?.state
          }
        }
      };
    }

    return {
      success: false,
      message: 'CNPJ não encontrado'
    };

  } catch (error) {
    console.error('❌ Erro ao buscar informações do CNPJ:', error.message);
    return {
      success: false,
      message: 'Erro ao consultar CNPJ',
      error: error.message
    };
  }
}

module.exports = {
  validateCNPJFormat,
  validateCNPJWithAPI,
  getCNPJInfo
};

