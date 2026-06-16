import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { BACKOFFICE_NAV_LINKS } from './navLinks.js'
import { clearBackofficeSession, backofficeFetch } from './api.js'
import './ImportPage.css'

function BackofficeImportKanbanPage({ onLock }) {
  const navigate = useNavigate()

  function lock() {
    clearBackofficeSession()
    onLock()
    navigate('/backoffice/login')
  }

  const [file,     setFile]     = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [progress, setProgress] = useState(null)
  const [result,   setResult]   = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData()
    formData.append('mouvements', file)

    setLoading(true)
    setProgress(null)
    setResult(null)

    try {
      const response = await backofficeFetch('http://localhost:3001/api/backoffice/import-kanban', {
        method: 'POST',
        body:   formData
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setResult({ ok: false, error: data.error })
        return
      }

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop()
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'progress') setProgress(event)
            else if (event.type === 'done') setResult(event)
          } catch { /* fragment malformé */ }
        }
      }
    } catch (err) {
      console.error('Échec de l\'import kanban :', err.message)
      setResult({ ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout
      title="Backoffice NewApp"
      navLinks={BACKOFFICE_NAV_LINKS}
      actionLabel="Verrouiller"
      onAction={lock}
    >
      <div className="import-page">
        <header className="import-page__header">
          <h1>Import de mouvements Kanban</h1>
          
        </header>

        <form onSubmit={handleSubmit} className="import-page__form">
          <div className="import-page__fields">
            <label>
              Fichier CSV — Mouvements
              <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>
          <div className="import-page__form-footer">
            <button type="submit" disabled={!file || loading} className="import-page__submit">
              {loading ? 'Import en cours…' : 'Lancer l\'import'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="import-page__progress-wrap">
            <p className="import-page__step-label">
              {progress?.label ?? 'Traitement en cours…'}
            </p>
            <div
              className="import-page__progress"
              role="progressbar"
              aria-valuenow={progress?.percent ?? 0}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className={`import-page__progress-bar${!progress ? ' import-page__progress-bar--indeterminate' : ''}`}
                style={progress ? { width: `${progress.percent}%` } : undefined}
              />
            </div>
            {progress && (
              <span className="import-page__percent">{progress.percent} %</span>
            )}
          </div>
        )}

        {result && (
          <div className="import-page__result">
            {result.ok ? (
              <>
                <p className="import-page__success">
                  Import terminé — {result.log.length} mouvement(s) traité(s).
                </p>
                <ul className="import-page__log">
                  {result.log.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              </>
            ) : (
              <p className="import-page__error">
                L'import a échoué. Vérifiez le fichier CSV et réessayez.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default BackofficeImportKanbanPage
