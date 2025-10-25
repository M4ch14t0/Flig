/**
 * Componente de Visualização da Fila para Estabelecimentos
 * 
 * Exibe a fila bidimensional com informações detalhadas dos grupos
 * para que o estabelecimento possa ver todos os clientes e membros.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContextImports.js';
import { api } from '../services/api';
import { Users, Clock, MapPin, Phone, Mail, CreditCard, ArrowUp, User, Eye, EyeOff } from 'lucide-react';
import styles from './QueueComponent.module.css';

export default function EstablishmentQueueView({ queueId, establishmentId, onError }) {
  const { user, userType } = useAuth();
  
  const [queue, setQueue] = useState(null);
  const [groupedClients, setGroupedClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [showGroupDetails, setShowGroupDetails] = useState(true);

  // Carrega dados da fila
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [queueId]);

  const loadQueueData = async () => {
    try {
      const [queueResponse, groupedResponse] = await Promise.all([
        api.get(`/api/queues/${queueId}`),
        api.get(`/api/queues/${queueId}/grouped`)
      ]);

      if (queueResponse.data.success) {
        setQueue(queueResponse.data.data);
      }

      if (groupedResponse.data.success) {
        setGroupedClients(groupedResponse.data.data.groupedClients);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da fila:', error);
      if (onError) onError('Erro ao carregar dados da fila');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedTime = (position) => {
    if (!queue || !position) return 0;
    return (position - 1) * Number(queue.tempo_estimado || 0);
  };

  const getTotalPeopleInQueue = () => {
    let total = 0;
    for (const position in groupedClients) {
      for (const client of groupedClients[position]) {
        if (client.isGroupLeader) {
          total += client.groupSize || 1;
        } else {
          total += 1;
        }
      }
    }
    return total;
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

  const totalPeople = getTotalPeopleInQueue();

  return (
    <div className={styles.queueContainer}>
      <div className={styles.queueHeader}>
        <h2 className={styles.queueName}>{queue.nome}</h2>
        <div className={styles.queueInfo}>
          <div className={styles.infoItem}>
            <Users size={16} />
            <span>{totalPeople} pessoas na fila</span>
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

      <div className={`${styles.queueStatus} ${styles[queue.status]}`}>
        <span>Status: {queue.status}</span>
      </div>

      {/* Controles de Visualização */}
      <div className={styles.viewControls}>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowGroupDetails(!showGroupDetails)}
        >
          {showGroupDetails ? <EyeOff size={16} /> : <Eye size={16} />}
          {showGroupDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
        </button>
      </div>

      {/* Lista de Clientes na Fila (Bidimensional) */}
      <div className={styles.clientsList}>
        <h3>Fila Bidimensional - Visão do Estabelecimento</h3>
        {Object.keys(groupedClients).length === 0 ? (
          <p className={styles.emptyQueue}>Ninguém na fila ainda</p>
        ) : (
          <div className={styles.bidimensionalQueue}>
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
                      className={`${styles.clientCard} ${client.paidAdvance ? styles.paidClient : ''} ${client.isGroupLeader ? styles.groupLeader : ''}`}
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
                            <Phone size={12} />
                            <span>{client.telefone}</span>
                          </div>
                          <div className={styles.contactItem}>
                            <Mail size={12} />
                            <span>{client.email}</span>
                          </div>
                        </div>
                        
                        {client.isGroupLeader && (
                          <div className={styles.groupInfo}>
                            <Users size={12} />
                            <span>Líder ({client.groupSize} pessoas)</span>
                          </div>
                        )}
                        
                        {showGroupDetails && client.isGroupLeader && client.groupMembers && (
                          <div className={styles.groupMembers}>
                            <strong>Membros do grupo:</strong>
                            <ul>
                              {client.groupMembers.map((member, memberIndex) => (
                                <li key={memberIndex}>
                                  <strong>{member.nome}</strong>
                                  <br />
                                  <small>
                                    📧 {member.email} | 📱 {member.telefone}
                                  </small>
                                </li>
                              ))}
                            </ul>
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

