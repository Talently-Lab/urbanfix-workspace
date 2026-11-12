import { createElement } from 'react'

export function LoadingIndicator({ label = 'Cargando...', className = '' }) {
  return createElement(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      className: `flex items-center gap-3 ${className}`,
    },
    [
      createElement('span', {
        key: 'spinner',
        'aria-hidden': true,
        className: 'inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent',
      }),
      createElement('span', { key: 'label' }, label),
    ],
  )
}

export function DashboardState({ loading, error, empty }) {
  if (loading) {
    return createElement(
      'div',
      { className: 'rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-300' },
      LoadingIndicator({ label: 'Cargando información...' })
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
