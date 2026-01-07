import { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import Login from './Login'
import Skeleton from './Skeleton'
import AddModal from './AddModal'
import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const API_BASE_URL = 'http://localhost:3001/api';

// API helper functions
const api = {
  getData: async () => {
    const response = await fetch(`${API_BASE_URL}/data`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  },
  
  addTask: async (user, task) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${user}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to add task');
    return response.json();
  },
  
  updateTask: async (user, id, task) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${user}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },
  
  deleteTask: async (user, id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${user}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },
  
  updateStatus: async (user, id, entregada) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${user}/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entregada })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  }
};

function App() {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('loggedUser') || null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [poeData, setPoeData] = useState([])
  
  const [poissonData, setPoissonData] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('poe')
  const [editItem, setEditItem] = useState(null)
  const [poeSearch, setPoeSearch] = useState('')
  const [poissonSearch, setPoissonSearch] = useState('')
  const [dataError, setDataError] = useState(null)

  // Prevent scroll jump on state updates
  useEffect(() => {
    // Save current scroll position
    const saveScrollPosition = () => {
      sessionStorage.setItem('scrollPos', window.scrollY.toString());
    };
    
    // Restore scroll position after render
    const restoreScrollPosition = () => {
      const savedPos = sessionStorage.getItem('scrollPos');
      if (savedPos) {
        window.scrollTo(0, parseInt(savedPos));
      }
    };
    
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Restore on mount
    const savedPos = sessionStorage.getItem('scrollPos');
    if (savedPos) {
      window.scrollTo(0, parseInt(savedPos));
    }
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          console.log('🔄 Loading data from API...');
          setIsLoading(true);
          setDataError(null);
          const data = await api.getData();
          console.log('✅ Data loaded:', data);
          setPoeData(data.poe || []);
          setPoissonData(data.poisson || []);
        } catch (error) {
          console.error('❌ Error loading data:', error);
          setDataError('Error al cargar los datos. Verifica que el servidor esté corriendo.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('poeData', JSON.stringify(poeData))
  }, [poeData])

  useEffect(() => {
    localStorage.setItem('poissonData', JSON.stringify(poissonData))
  }, [poissonData])

  const handleLogin = (username) => {
    setIsLoading(true)
    setUser(username)
    localStorage.setItem('loggedUser', username)
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      setUser(null)
      localStorage.removeItem('loggedUser')
      setIsLoggingOut(false)
    }, 800)
  }

  // Show skeleton while logging out
  if (isLoggingOut) {
    return <Skeleton />
  }

  // Show login if no user
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // Show skeleton while loading after login
  if (isLoading) {
    return <Skeleton />
  }

  const calculateTotal = (data) => data.reduce((sum, item) => sum + item.ganancia, 0)
  const calculateDelivered = (data) => data.filter(item => item.entregada).reduce((sum, item) => sum + item.ganancia, 0)
  const calculatePending = (data) => data.filter(item => !item.entregada).reduce((sum, item) => sum + item.ganancia, 0)

  const poeTotal = calculateTotal(poeData)
  const poissonTotal = calculateTotal(poissonData)
  const poeDelivered = calculateDelivered(poeData)
  const poissonDelivered = calculateDelivered(poissonData)
  const poePending = calculatePending(poeData)
  const poissonPending = calculatePending(poissonData)
  const difference = poeTotal - poissonTotal
  const deliveredDifference = poeDelivered - poissonDelivered

  const toggleEntregada = async (type, id) => {
    // Find task without causing re-renders
    const task = type === 'poe' 
      ? poeData.find(t => t.id === id)
      : poissonData.find(t => t.id === id);
    
    if (!task) return;
    
    const newStatus = !task.entregada;
    
    // Batch all state updates to prevent intermediate renders
    Promise.resolve().then(() => {
      // Update UI immediately (batched)
      setPoeData(prev => 
        type === 'poe'
          ? prev.map(item => item.id === id ? { ...item, entregada: newStatus } : item)
          : prev
      );
      setPoissonData(prev => 
        type === 'poisson'
          ? prev.map(item => item.id === id ? { ...item, entregada: newStatus } : item)
          : prev
      );
    });
    
    // Backend sync in background (fire and forget)
    api.updateStatus(type, id, newStatus).catch(error => {
      console.warn('Background sync failed:', error);
      // Silent rollback if needed
      Promise.resolve().then(() => {
        setPoeData(prev => 
          type === 'poe'
            ? prev.map(item => item.id === id ? { ...item, entregada: task.entregada } : item)
            : prev
        );
        setPoissonData(prev => 
          type === 'poisson'
            ? prev.map(item => item.id === id ? { ...item, entregada: task.entregada } : item)
            : prev
        );
      });
    });
  }

  const deleteEntry = async (type, id) => {
    const taskToDelete = type === 'poe' 
      ? poeData.find(t => t.id === id)
      : poissonData.find(t => t.id === id);
    
    // Immediate UI removal (batched)
    Promise.resolve().then(() => {
      setPoeData(prev => type === 'poe' ? prev.filter(item => item.id !== id) : prev);
      setPoissonData(prev => type === 'poisson' ? prev.filter(item => item.id !== id) : prev);
    });
    
    // Background sync
    api.deleteTask(type, id).catch(error => {
      console.warn('Background delete failed:', error);
      // Silent restore
      Promise.resolve().then(() => {
        setPoeData(prev => type === 'poe' ? [...prev, taskToDelete] : prev);
        setPoissonData(prev => type === 'poisson' ? [...prev, taskToDelete] : prev);
      });
    });
  }

  const addEntry = async (type, newEntry) => {
    const tempId = Date.now();
    const newTask = { ...newEntry, id: tempId };
    
    // Immediate UI update (batched)
    Promise.resolve().then(() => {
      setPoeData(prev => type === 'poe' ? [...prev, newTask] : prev);
      setPoissonData(prev => type === 'poisson' ? [...prev, newTask] : prev);
    });
    
    // Background sync
    api.addTask(type, newEntry)
      .then(addedTask => {
        // Update with real ID
        Promise.resolve().then(() => {
          setPoeData(prev => 
            type === 'poe' 
              ? prev.map(item => item.id === tempId ? addedTask : item)
              : prev
          );
          setPoissonData(prev => 
            type === 'poisson' 
              ? prev.map(item => item.id === tempId ? addedTask : item)
              : prev
          );
        });
      })
      .catch(error => {
        console.warn('Background add failed:', error);
        // Silent rollback
        Promise.resolve().then(() => {
          setPoeData(prev => type === 'poe' ? prev.filter(item => item.id !== tempId) : prev);
          setPoissonData(prev => type === 'poisson' ? prev.filter(item => item.id !== tempId) : prev);
        });
      });
  }

  const editEntry = async (type, updatedEntry) => {
    const originalTask = type === 'poe' 
      ? poeData.find(t => t.id === updatedEntry.id)
      : poissonData.find(t => t.id === updatedEntry.id);
    
    // Immediate UI update (batched)
    Promise.resolve().then(() => {
      setPoeData(prev => 
        type === 'poe'
          ? prev.map(item => item.id === updatedEntry.id ? updatedEntry : item)
          : prev
      );
      setPoissonData(prev => 
        type === 'poisson'
          ? prev.map(item => item.id === updatedEntry.id ? updatedEntry : item)
          : prev
      );
    });
    
    // Background sync
    api.updateTask(type, updatedEntry.id, updatedEntry).catch(error => {
      console.warn('Background edit failed:', error);
      // Silent rollback
      Promise.resolve().then(() => {
        setPoeData(prev => 
          type === 'poe'
            ? prev.map(item => item.id === updatedEntry.id ? originalTask : item)
            : prev
        );
        setPoissonData(prev => 
          type === 'poisson'
            ? prev.map(item => item.id === updatedEntry.id ? originalTask : item)
            : prev
        );
      });
    });
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditItem(null)
  }

  const barChartData = {
    labels: ['Total Previsto', 'Entregado', 'Pendiente'],
    datasets: [
      {
        label: 'Poe',
        data: [poeTotal, poeDelivered, poePending],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      },
      {
        label: 'Poisson',
        data: [poissonTotal, poissonDelivered, poissonPending],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Comparación de Ganancias (€)', font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Euros (€)' } },
    },
  }

  const doughnutData = {
    labels: ['Poe Entregado', 'Poe Pendiente', 'Poisson Entregado', 'Poisson Pendiente'],
    datasets: [{
      data: [poeDelivered, poePending, poissonDelivered, poissonPending],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(99, 102, 241, 0.3)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(236, 72, 153, 0.3)',
      ],
      borderWidth: 2,
    }],
  }

  // Check if user can edit a specific table type
  const canEdit = (tableType) => {
    // poe is admin, can edit everything
    if (user === 'poe') return true
    // poisson can only edit their own table
    return user === tableType
  }

  const DataTable = ({ data, type, searchTerm, setSearchTerm }) => {
    const hasEditPermission = canEdit(type)
    
    // Filter data based on search term
    const filteredData = data.filter(item => 
      item.asignacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.idCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return (
      <div className="table-container">
        <div className="table-header-row">
          <h2 className={`table-title ${type}`}>Ingresos: {type === 'poe' ? 'Poe' : 'Poisson'}</h2>
          <div className="table-actions">
            <div className={`search-box ${type}`}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar asignación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
            {hasEditPermission && (
              <button className={`add-new-btn ${type}`} onClick={() => openModal(type)}>
                <span>➕</span>
                <span>Nueva Asignación</span>
              </button>
            )}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Asignación</th>
              <th>ID</th>
              <th>Ganancia Prevista (€)</th>
              <th>Entregada</th>
              {hasEditPermission && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr className="no-results">
                <td colSpan={hasEditPermission ? "5" : "4"}>
                  <div className="no-results-message">
                    <span>🔍</span>
                    <p>No se encontraron asignaciones</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id} className={item.entregada ? 'delivered' : 'pending'}>
                  <td>{item.asignacion}</td>
                  <td className="id-cell">{item.idCode}</td>
                  <td className="ganancia-cell">{item.ganancia}€</td>
                  <td>
                    {hasEditPermission ? (
                      <button 
                        className={`status-btn ${item.entregada ? 'delivered' : 'pending'}`}
                        onClick={() => toggleEntregada(type, item.id)}
                      >
                        {item.entregada ? '✓' : '✗'}
                      </button>
                    ) : (
                      <span className={`status-badge ${item.entregada ? 'delivered' : 'pending'}`}>
                        {item.entregada ? '✓' : '✗'}
                      </span>
                    )}
                  </td>
                  {hasEditPermission && (
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => openModal(type, item)}>✏️</button>
                        <button className="delete-btn" onClick={() => deleteEntry(type, item.id)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2"><strong>Total</strong></td>
              <td className="total-cell"><strong>{calculateTotal(filteredData)}€</strong></td>
              <td colSpan={hasEditPermission ? "2" : "1"}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>📊 SIGEG - Sistema de Gestión de Ganancias</h1>
          <div className="user-info">
            <span className={`user-badge ${user}`}>
              👤 {user.charAt(0).toUpperCase() + user.slice(1)}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
        {dataError && (
          <div className="error-banner">
            ⚠️ {dataError}
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        )}
      </header>

      <div className="summary-cards">
        <div className="card poe">
          <h3>Poe</h3>
          <p className="amount">{poeTotal}€</p>
          <p className="detail">Entregado: {poeDelivered}€</p>
          <p className="detail">Pendiente: {poePending}€</p>
        </div>
        <div className="card poisson">
          <h3>Poisson</h3>
          <p className="amount">{poissonTotal}€</p>
          <p className="detail">Entregado: {poissonDelivered}€</p>
          <p className="detail">Pendiente: {poissonPending}€</p>
        </div>
        <div className={`card difference ${difference >= 0 ? 'positive' : 'negative'}`}>
          <h3>Diferencia Total</h3>
          <p className="amount">{difference >= 0 ? '+' : ''}{difference}€</p>
          <p className="detail">Poe {difference >= 0 ? 'lidera' : 'por detrás'}</p>
        </div>
        <div className={`card difference ${deliveredDifference >= 0 ? 'positive' : 'negative'}`}>
          <h3>Diferencia Entregado</h3>
          <p className="amount">{deliveredDifference >= 0 ? '+' : ''}{deliveredDifference}€</p>
          <p className="detail">En pagos confirmados</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="chart-container doughnut">
          <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Distribución de Ganancias' } } }} />
        </div>
      </div>

      <div className="tables-section">
        <DataTable data={poeData} type="poe" searchTerm={poeSearch} setSearchTerm={setPoeSearch} />
        <DataTable data={poissonData} type="poisson" searchTerm={poissonSearch} setSearchTerm={setPoissonSearch} />
      </div>

      <AddModal
        isOpen={modalOpen}
        onClose={closeModal}
        onAdd={(newEntry) => addEntry(modalType, newEntry)}
        onEdit={(updatedEntry) => editEntry(modalType, updatedEntry)}
        type={modalType}
        editItem={editItem}
      />
    </div>
  )
}

export default App
