import './Skeleton.css'

function Skeleton() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-user"></div>
      </div>

      <div className="skeleton-cards">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>

      <div className="skeleton-charts">
        <div className="skeleton-chart-large"></div>
        <div className="skeleton-chart-small"></div>
      </div>

      <div className="skeleton-tables">
        <div className="skeleton-table">
          <div className="skeleton-table-header"></div>
          <div className="skeleton-table-row"></div>
          <div className="skeleton-table-row"></div>
          <div className="skeleton-table-row"></div>
          <div className="skeleton-table-row"></div>
        </div>
        <div className="skeleton-table">
          <div className="skeleton-table-header"></div>
          <div className="skeleton-table-row"></div>
          <div className="skeleton-table-row"></div>
          <div className="skeleton-table-row"></div>
          <div className="skeleton-table-row"></div>
        </div>
      </div>

      <div className="skeleton-loading-text">
        <span>Cargando</span>
        <div className="dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  )
}

export default Skeleton
