import { useState, useEffect } from 'react'
import './AddModal.css'

function AddModal({ isOpen, onClose, onAdd, onEdit, type, editItem = null }) {
  const isEditMode = editItem !== null
  
  const [formData, setFormData] = useState({
    asignacion: '',
    idCode: '',
    ganancia: '',
    entregada: false
  })

  // Load edit item data when modal opens in edit mode
  useEffect(() => {
    if (isOpen && editItem) {
      setFormData({
        asignacion: editItem.asignacion,
        idCode: editItem.idCode,
        ganancia: editItem.ganancia.toString(),
        entregada: editItem.entregada
      })
    } else if (isOpen && !editItem) {
      setFormData({ asignacion: '', idCode: '', ganancia: '', entregada: false })
    }
  }, [isOpen, editItem])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.asignacion && formData.ganancia) {
      const dataToSubmit = {
        ...formData,
        ganancia: parseInt(formData.ganancia) || 0
      }
      
      if (isEditMode) {
        onEdit({ ...dataToSubmit, id: editItem.id })
      } else {
        onAdd(dataToSubmit)
      }
      setFormData({ asignacion: '', idCode: '', ganancia: '', entregada: false })
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({ asignacion: '', idCode: '', ganancia: '', entregada: false })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-container ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Editar Asignación' : 'Nueva Asignación'}</h2>
          <span className={`modal-badge ${type}`}>{type === 'poe' ? 'Poe' : 'Poisson'}</span>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="asignacion">Nombre de la Asignación</label>
            <input
              type="text"
              id="asignacion"
              placeholder="Ej: Práctica1 version 1 CAST - Sistemas operativos (75.566)"
              value={formData.asignacion}
              onChange={(e) => setFormData({ ...formData, asignacion: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idCode">ID de la Asignación</label>
              <input
                type="text"
                id="idCode"
                placeholder="Ej: (31352 . 48320)"
                value={formData.idCode}
                onChange={(e) => setFormData({ ...formData, idCode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ganancia">Ganancia Prevista (€)</label>
              <input
                type="number"
                id="ganancia"
                placeholder="Ej: 80"
                value={formData.ganancia}
                onChange={(e) => setFormData({ ...formData, ganancia: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.entregada}
                onChange={(e) => setFormData({ ...formData, entregada: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">¿Ya está entregada?</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className={`btn-submit ${type}`}>
              <span>{isEditMode ? 'Guardar Cambios' : 'Añadir Asignación'}</span>
              <span>{isEditMode ? '💾' : '➕'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddModal
