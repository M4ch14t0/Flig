/**
 * Componente de Fila para Sistema Flig
 * 
 * Exibe informações da fila, permite entrada de clientes e
 * gerencia posições na fila em tempo real.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContextImports.js';
import { api } from '../services/api';
import { Users, Clock, MapPin, Phone, Mail, CreditCard, ArrowUp } from 'lucide-react';
import styles from './QueueComponent.module.css';

export default function QueueComponent({ queueId, establishmentId, onJoinSuccess, onError }) {
  const { user, userType } = useAuth();
  
  const [queue, setQueue] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [clientPosition, setClientPosition] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [joinForm, setJoinForm] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  const [advanceForm, setAdvanceForm] = useState({
    positions: 1,
    paymentMethod: 'credit_card',
    cardData: {
      number: '',
      cvv: '',
      expiryMonth: '',
      expiryYear: '',
      holderName: ''
    }
  });

  // Carrega dados da fila
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [queueId]);

  const loadQueueData = async () => {
    try {
      const [queueResponse, clientsResponse] = await Promise.all([
        api.get(`/queues/${queueId}`),
        api.get(`/queues/${queueId}/clients`)
      ]);

      if (queueResponse.data.success) {
        setQueue(queueResponse.data.data);
      }

      if (clientsResponse.data.success) {
        setClients(clientsResponse.data.data.clients);
        
        // Verifica se o usuário está na fila
        if (user && userType === 'cliente') {
          const userInQueue = clientsResponse.data.data.clients.find(
            client => client.email === user.email
          );
          if (userInQueue) {
            setClientPosition(userInQueue);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da fila:', error);
      if (onError) onError('Erro ao carregar dados da fila');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    setJoining(true);

    try {
      const response = await api.post(`/queues/${queueId}/join`, joinForm);

      if (response.data.success) {
        setShowJoinForm(false);
        setJoinForm({ nome: '', telefone: '', email: '' });
        await loadQueueData(); // Recarrega dados
        if (onJoinSuccess) onJoinSuccess(response.data.data);
      } else {
        if (onError) onError(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      if (onError) onError(error.response?.data?.message || 'Erro ao entrar na fila');
    } finally {
      setJoining(false);
    }
  };

  const handleAdvanceInQueue = async (e) => {
    e.preventDefault();
    setAdvancing(true);

    try {
      const response = await api.post(`/queues/${queueId}/advance`, {
        clientId: clientPosition.id,
        positions: advanceForm.positions,
        paymentData: {
          paymentMethod: advanceForm.paymentMethod,
          cardData: advanceForm.cardData
        }
      });

      if (response.data.success) {
        setShowAdvanceForm(false);
        setAdvanceForm({
          positions: 1,
          paymentMethod: 'credit_card',
          cardData: { number: '', cvv: '', expiryMonth: '', expiryYear: '', holderName: '' }
        });
        await loadQueueData(); // Recarrega dados
        if (onJoinSuccess) onJoinSuccess(response.data.data);
      } else {
        if (onError) onError(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao avançar na fila:', error);
      if (onError) onError(error.response?.data?.message || 'Erro ao avançar na fila');
    } finally {
      setAdvancing(false);
    }
  };

  const calculateEstimatedTime = (position) => {
    if (!queue || !position) return 0;
    return (position - 1) * Number(queue.tempo_estimado || 0);
  };

  const calculateAdvancePrice = (positions) => {
    if (!queue) return 0;
    const basePrice = Number(queue.valor_avancos || 0);
    if (positions === 1) return basePrice;
    if (positions === 2) return basePrice * 1.5;
    if (positions === 3) return basePrice * 2;
    if (positions === 4) return basePrice * 2.5;
    if (positions === 5) return basePrice * 3;
    if (positions === 6) return basePrice * 3.5;
    if (positions === 7) return basePrice * 4;
    if (positions === 8) return basePrice * 4.5;
    return basePrice * positions;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando fila...</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className={styles.error}>
        <p>Fila não encontrada</p>
      </div>
    );
  }

  return (
    <div className={styles.queueContainer}>
      {/* Cabeçalho da Fila */}
      <div className={styles.queueHeader}>
        <h2 className={styles.queueName}>{queue.nome}</h2>
        <div className={styles.queueInfo}>
          <div className={styles.infoItem}>
            <Users size={16} />
            <span>{clients.length} pessoas na fila</span>
          </div>
          <div className={styles.infoItem}>
            <Clock size={16} />
            <span>{Number(queue.tempo_estimado || 0)} min por posição</span>
          </div>
          <div className={styles.infoItem}>
            <CreditCard size={16} />
            <span>R$ {Number(queue.valor_avancos || 0).toFixed(2)} por avanço</span>
          </div>
        </div>
        {queue.descricao && (
          <p className={styles.queueDescription}>{queue.descricao}</p>
        )}
      </div>

      {/* Status da Fila */}
      <div className={`${styles.queueStatus} ${styles[queue.status]}`}>
        <span>Status: {queue.status}</span>
      </div>

      {/* Posição do Cliente */}
      {clientPosition && (
        <div className={styles.clientPosition}>
          <h3>Sua Posição na Fila</h3>
          <div className={styles.positionInfo}>
            <div className={styles.positionNumber}>
              <span className={styles.number}>{clientPosition.position}</span>
              <span className={styles.label}>Posição</span>
            </div>
            <div className={styles.estimatedTime}>
              <Clock size={20} />
              <span>{calculateEstimatedTime(clientPosition.position)} min</span>
            </div>
          </div>
          
          {!showAdvanceForm && (
            <button 
              className={styles.advanceButton}
              onClick={() => setShowAdvanceForm(true)}
            >
              <ArrowUp size={16} />
              Avançar na Fila
            </button>
          )}
        </div>
      )}

      {/* Formulário de Avanço */}
      {showAdvanceForm && clientPosition && (
        <div className={styles.advanceForm}>
          <h3>Avançar na Fila</h3>
          <form onSubmit={handleAdvanceInQueue}>
            <div className={styles.formGroup}>
              <label>Quantas posições avançar?</label>
              <select 
                value={advanceForm.positions}
                onChange={(e) => setAdvanceForm({
                  ...advanceForm,
                  positions: parseInt(e.target.value)
                })}
                max={queue.max_avancos}
              >
                {Array.from({ length: Math.min(queue.max_avancos, clientPosition.position - 1) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} posição{num > 1 ? 'ões' : ''}</option>
                ))}
              </select>
            </div>

            <div className={styles.priceInfo}>
              <strong>Valor: R$ {calculateAdvancePrice(advanceForm.positions).toFixed(2)}</strong>
            </div>

            <div className={styles.formGroup}>
              <label>Método de Pagamento</label>
              <select 
                value={advanceForm.paymentMethod}
                onChange={(e) => setAdvanceForm({
                  ...advanceForm,
                  paymentMethod: e.target.value
                })}
              >
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">PIX</option>
              </select>
            </div>

            {advanceForm.paymentMethod === 'credit_card' && (
              <div className={styles.cardForm}>
                <div className={styles.formGroup}>
                  <label>Número do Cartão</label>
                  <input 
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={advanceForm.cardData.number}
                    onChange={(e) => setAdvanceForm({
                      ...advanceForm,
                      cardData: { ...advanceForm.cardData, number: e.target.value }
                    })}
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>CVV</label>
                    <input 
                      type="text"
                      placeholder="123"
                      value={advanceForm.cardData.cvv}
                      onChange={(e) => setAdvanceForm({
                        ...advanceForm,
                        cardData: { ...advanceForm.cardData, cvv: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Validade</label>
                    <div className={styles.expiryInputs}>
                      <input 
                        type="text"
                        placeholder="MM"
                        value={advanceForm.cardData.expiryMonth}
                        onChange={(e) => setAdvanceForm({
                          ...advanceForm,
                          cardData: { ...advanceForm.cardData, expiryMonth: e.target.value }
                        })}
                        required
                      />
                      <input 
                        type="text"
                        placeholder="AAAA"
                        value={advanceForm.cardData.expiryYear}
                        onChange={(e) => setAdvanceForm({
                          ...advanceForm,
                          cardData: { ...advanceForm.cardData, expiryYear: e.target.value }
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Nome no Cartão</label>
                  <input 
                    type="text"
                    placeholder="Nome como está no cartão"
                    value={advanceForm.cardData.holderName}
                    onChange={(e) => setAdvanceForm({
                      ...advanceForm,
                      cardData: { ...advanceForm.cardData, holderName: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                type="button"
                onClick={() => setShowAdvanceForm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={advancing}
                className={styles.submitButton}
              >
                {advancing ? 'Processando...' : 'Avançar na Fila'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botão de Entrada na Fila */}
      {!clientPosition && !showJoinForm && userType === 'cliente' && (
        <button 
          className={styles.joinButton}
          onClick={() => setShowJoinForm(true)}
        >
          Entrar na Fila
        </button>
      )}
      
      

      {/* Formulário de Entrada na Fila */}
      {showJoinForm && (
        <div className={styles.joinForm}>
          <h3>Entrar na Fila</h3>
          <form onSubmit={handleJoinQueue}>
            <div className={styles.formGroup}>
              <label>Nome Completo</label>
              <input 
                type="text"
                value={joinForm.nome}
                onChange={(e) => setJoinForm({ ...joinForm, nome: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Telefone</label>
              <input 
                type="tel"
                value={joinForm.telefone}
                onChange={(e) => setJoinForm({ ...joinForm, telefone: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email"
                value={joinForm.email}
                onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formActions}>
              <button 
                type="button"
                onClick={() => setShowJoinForm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={joining}
                className={styles.submitButton}
              >
                {joining ? 'Entrando...' : 'Entrar na Fila'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Clientes na Fila */}
      <div className={styles.clientsList}>
        <h3>Pessoas na Fila</h3>
        {clients.length === 0 ? (
          <p className={styles.emptyQueue}>Ninguém na fila ainda</p>
        ) : (
          <div className={styles.clientsGrid}>
            {clients.map((client, index) => (
              <div 
                key={client.id} 
                className={`${styles.clientCard} ${client.id === clientPosition?.id ? styles.currentClient : ''}`}
              >
                <div className={styles.clientPosition}>
                  <span className={styles.positionNumber}>{client.position}</span>
                </div>
                <div className={styles.clientInfo}>
                  <h4>{client.nome}</h4>
                  <div className={styles.clientDetails}>
                    <div className={styles.detailItem}>
                      <Clock size={12} />
                      <span>{calculateEstimatedTime(client.position)} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

