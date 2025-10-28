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
  const [groupedClients, setGroupedClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [clientPosition, setClientPosition] = useState(null);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    groupSize: 2
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

  // Dados do usuário são obtidos automaticamente do contexto

  // Carrega dados da fila
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [queueId]);

  const loadQueueData = async () => {
    try {
      const [queueResponse, clientsResponse, groupedResponse] = await Promise.all([
        api.get(`/api/queues/${queueId}`),
        api.get(`/api/queues/${queueId}/clients`),
        api.get(`/api/queues/${queueId}/grouped`)
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

      if (groupedResponse.data.success) {
        setGroupedClients(groupedResponse.data.data.groupedClients || {});
      }
    } catch (error) {
      console.error('Erro ao carregar dados da fila:', error);
      if (onError) onError('Erro ao carregar dados da fila');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!user || userType !== 'cliente') {
      if (onError) onError('Usuário não autenticado');
      return;
    }

    setJoining(true);

    try {
      // Usa dados do usuário logado automaticamente
      const clientData = {
        nome: user.name || user.nome || '',
        telefone: user.telefone || user.phone || '',
        email: user.email || user.email_usuario || ''
      };

      const response = await api.post(`/api/queues/${queueId}/join`, clientData);

      if (response.data.success) {
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
      console.log('🎯 Executando avanço real na fila localmente...');
      console.log('Cliente atual:', clientPosition);
      console.log('Posições a avançar:', advanceForm.positions);
      
      // LÓGICA REAL DE AVANÇO NA FILA
      const positionsToAdvance = advanceForm.positions;
      const currentPosition = clientPosition.position;
      const newPosition = Math.max(1, currentPosition - positionsToAdvance);
      
      console.log(`Avançando de posição ${currentPosition} para ${newPosition}`);
      
      // 1. Atualizar posição do cliente atual
      const updatedClientPosition = {
        ...clientPosition,
        position: newPosition,
        paidAdvance: true,
        advancePositions: positionsToAdvance
      };
      
      // 2. Reorganizar TODOS os clientes da fila
      const updatedClients = clients.map(client => {
        if (client.id === clientPosition.id) {
          // Cliente que está avançando
          return updatedClientPosition;
        } else {
          // Outros clientes - ajustar posições
          const clientCurrentPos = client.position;
          
          if (clientCurrentPos < currentPosition && clientCurrentPos >= newPosition) {
            // Clientes que estão entre a nova posição e a posição atual
            // Devem ser "empurrados" para baixo
            return {
              ...client,
              position: clientCurrentPos + 1
            };
          } else if (clientCurrentPos === currentPosition) {
            // Se há outro cliente na mesma posição (grupo)
            return {
              ...client,
              position: clientCurrentPos + 1
            };
          }
          
          // Clientes que não são afetados mantêm a posição
          return client;
        }
      });
      
      // 3. Ordenar clientes por posição para manter consistência
      const sortedClients = updatedClients.sort((a, b) => a.position - b.position);
      
      // 4. Reajustar posições sequenciais (eliminar gaps)
      const finalClients = sortedClients.map((client, index) => ({
        ...client,
        position: index + 1
      }));
      
      // 5. Atualizar estados
      setClientPosition(updatedClientPosition);
      setClients(finalClients);
      
      // 6. Recalcular fila bidimensional
      const newGroupedClients = {};
      finalClients.forEach(client => {
        const pos = client.position;
        if (!newGroupedClients[pos]) {
          newGroupedClients[pos] = [];
        }
        newGroupedClients[pos].push(client);
      });
      setGroupedClients(newGroupedClients);
      
      console.log('✅ Fila reorganizada com sucesso!');
      console.log('Nova posição do cliente:', newPosition);
      console.log('Total de clientes:', finalClients.length);
      console.log('Fila reorganizada:', finalClients.map(c => `${c.nome} - Posição ${c.position}`));
      
      // 7. Fechar formulário
      setShowAdvanceForm(false);
      setAdvanceForm({
        positions: 1,
        paymentMethod: 'credit_card',
        cardData: { number: '', cvv: '', expiryMonth: '', expiryYear: '', holderName: '' }
      });
      
      // 8. Mostrar mensagem de sucesso
      alert(`🎉 Avanço realizado! Sua nova posição é ${newPosition}ª`);
      
      // 9. Redirecionar para página de pagamento do Mercado Pago
      const paymentUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=2915256254-39ae9b33-6e81-4be4-b388-7a079801d4e6`;
      
      console.log('🔗 Redirecionando para página de pagamento...');
      console.log('URL:', paymentUrl);
      
      // Abrir em nova aba
      window.open(paymentUrl, '_blank');
      
      // 10. Chamar callback de sucesso
      if (onJoinSuccess) onJoinSuccess({
        message: 'Avanço realizado com sucesso',
        newPosition: newPosition,
        positionsAdvanced: positionsToAdvance,
        paymentUrl: paymentUrl
      });
      
    } catch (error) {
      console.error('Erro ao avançar na fila:', error);
      if (onError) onError('Erro ao avançar na fila');
    } finally {
      setAdvancing(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setJoining(true);

    try {
      const response = await api.post(`/api/queues/${queueId}/join-group`, {
        ...groupForm,
        groupLeader: {
          nome: user.name || user.nome || '',
          telefone: user.telefone || user.phone || '',
          email: user.email || user.email_usuario || ''
        }
      });

      if (response.data.success) {
        setShowGroupForm(false);
        setGroupForm({
          nome: '',
          telefone: '',
          email: '',
          groupSize: 2
        });
        await loadQueueData(); // Recarrega dados
        if (onJoinSuccess) onJoinSuccess(response.data.data);
      } else {
        if (onError) onError(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao entrar como grupo:', error);
      if (onError) onError(error.response?.data?.message || 'Erro ao entrar como grupo');
    } finally {
      setJoining(false);
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
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#2e7d32'
          }}>
            <strong>✅ Avanço Local:</strong> O avanço será processado localmente e você será redirecionado para a página de pagamento do Mercado Pago.
          </div>
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
                {advancing ? 'Avançando...' : 'Avançar na Fila'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botões de Entrada na Fila */}
      {!clientPosition && userType === 'cliente' && (
        <div className={styles.joinOptions}>
          <button 
            className={styles.joinButton}
            onClick={handleJoinQueue}
            disabled={joining}
          >
            {joining ? 'Entrando...' : 'Entrar na Fila'}
          </button>
          <button 
            className={styles.groupButton}
            onClick={() => setShowGroupForm(true)}
            disabled={joining}
          >
            <Users size={16} />
            Entrar como Grupo
          </button>
        </div>
      )}
      
      

      {/* Formulário de Entrada como Grupo */}
      {showGroupForm && (
        <div className={styles.groupForm}>
          <h3>Entrar como Grupo</h3>
          <form onSubmit={handleJoinGroup}>
            <div className={styles.formGroup}>
              <label>Nome do Grupo</label>
              <input 
                type="text"
                placeholder="Ex: Família Silva"
                value={groupForm.nome}
                onChange={(e) => setGroupForm({ ...groupForm, nome: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tamanho do Grupo</label>
              <select 
                value={groupForm.groupSize}
                onChange={(e) => setGroupForm({ ...groupForm, groupSize: parseInt(e.target.value) })}
              >
                {[2, 3, 4, 5, 6, 7, 8].map(size => (
                  <option key={size} value={size}>{size} pessoas</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Telefone de Contato</label>
              <input 
                type="tel"
                placeholder="(11) 99999-9999"
                value={groupForm.telefone}
                onChange={(e) => setGroupForm({ ...groupForm, telefone: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email de Contato</label>
              <input 
                type="email"
                placeholder="contato@exemplo.com"
                value={groupForm.email}
                onChange={(e) => setGroupForm({ ...groupForm, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formActions}>
              <button 
                type="button"
                onClick={() => setShowGroupForm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={joining}
                className={styles.submitButton}
              >
                {joining ? 'Entrando...' : 'Entrar como Grupo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visualização Bidimensional da Fila */}
      <div className={styles.bidimensionalQueue}>
        <h3>Fila Bidimensional</h3>
        {Object.keys(groupedClients).length === 0 ? (
          <p className={styles.emptyQueue}>Ninguém na fila ainda</p>
        ) : (
          <div className={styles.positionsContainer}>
            {Object.entries(groupedClients).map(([position, clientsAtPosition]) => (
              <div key={position} className={styles.positionGroup}>
                <div className={styles.positionHeader}>
                  <h4>Posição {position}</h4>
                  <span className={styles.positionCount}>
                    {clientsAtPosition.length} cliente{clientsAtPosition.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className={styles.clientsAtPosition}>
                  {clientsAtPosition.map((client, index) => (
                    <div 
                      key={client.id} 
                      className={`${styles.clientCard} ${client.paidAdvance ? styles.paidClient : ''} ${client.isGroupLeader ? styles.groupLeader : ''} ${client.id === clientPosition?.id ? styles.currentClient : ''}`}
                    >
                      <div className={styles.clientPosition}>
                        <span className={styles.positionNumber}>
                          {position}{client.subPosition || 'a'}
                        </span>
                        {client.paidAdvance && (
                          <span className={styles.paidBadge}>PAGOU</span>
                        )}
                        {client.isGroupLeader && (
                          <span className={styles.groupBadge}>GRUPO</span>
                        )}
                      </div>
                      <div className={styles.clientInfo}>
                        <h4>{client.nome}</h4>
                        <div className={styles.clientContact}>
                          <div className={styles.contactItem}>
                            <span>📧 {client.email}</span>
                          </div>
                          <div className={styles.contactItem}>
                            <span>📱 {client.telefone}</span>
                          </div>
                        </div>
                        
                        {client.isGroupLeader && (
                          <div className={styles.groupInfo}>
                            <Users size={12} />
                            <span>Líder ({client.groupSize} pessoas)</span>
                          </div>
                        )}
                        
                        <div className={styles.clientDetails}>
                          <div className={styles.detailItem}>
                            <Clock size={12} />
                            <span>{calculateEstimatedTime(client.position)} min</span>
                          </div>
                          {client.isGroupLeader && (
                            <div className={styles.detailItem}>
                              <Users size={12} />
                              <span>{client.groupSize} pessoas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

