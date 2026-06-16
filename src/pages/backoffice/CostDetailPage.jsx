import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { BACKOFFICE_NAV_LINKS } from './navLinks.js'
import { clearBackofficeSession } from './api.js'
import { ASSET_TYPES } from '../../../shared/assetTypes.js'
import './CostDetailPage.css'

function itemTypeLabel(itemtype) {
  return ASSET_TYPES.find(t => t.itemtype === itemtype)?.label ?? itemtype
}

function BackofficeCostDetailPage({ onLock }) {
  const navigate    = useNavigate()
  const { itemtype } = useParams()

  function lock() {
    clearBackofficeSession()
    onLock()
    navigate('/backoffice/login')
  }

  const [rows,    setRows]    = useState(null)
  const [error,   setError]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('http://localhost:3001/api/backoffice/costs')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (!data.ok) throw new Error(data.error)
        setRows(data.costs.filter(c => c.itemtype === itemtype))
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [itemtype])

  return (
    <Layout
      title="Backoffice NewApp"
      navLinks={BACKOFFICE_NAV_LINKS}
      actionLabel="Verrouiller"
      onAction={lock}
    >
      <div className="cost-detail-page">
        <header className="cost-detail-page__header">
          <Link to="/backoffice/costs/new" className="cost-detail-page__back">← Retour</Link>
          <h1>Détail — {itemTypeLabel(itemtype)}</h1>
        </header>

        {loading && <p>Chargement…</p>}

        {error && (
          <p className="cost-detail-page__error">
            Impossible de charger les données. Réessayez dans quelques instants.
          </p>
        )}

        {rows && rows.length === 0 && (
          <p className="cost-detail-page__empty">Aucun coût pour ce type d'élément.</p>
        )}

        {rows && rows.length > 0 && (
          <div className="cost-detail-page__results">
            <table className="cost-detail-page__table">
              <thead>
                <tr>
                  <th>Réf. ticket</th>
                  <th>Item</th>
                  <th>glpi</th>
                  <th>réouverture</th>
                  <th>supercost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>#{row.ticketId} — {row.ticketName}</td>
                    <td>{row.assetName}</td>
                    <td>{row.costImported.toFixed(2)}</td>
                    <td>{(row.costReopening ?? 0).toFixed(2)}</td>
                    <td>{row.costNew.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default BackofficeCostDetailPage
