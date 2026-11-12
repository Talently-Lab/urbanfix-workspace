import { createElement } from 'react'

export function DashboardState({ loading, error, empty }) {
  if (loading) {
    return createElement(
      'p',
      { className: 'rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-300' },
      'Cargando información...'
    )
  }

  if (error) {
    return createElement(
      'p',
      {
        role: 'alert',
        className: 'rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-200',
      },
      error
    )
  }

  if (empty) {
    return createElement(
      'p',
      { className: 'rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-400' },
      empty
    )
  }

  return null
}
