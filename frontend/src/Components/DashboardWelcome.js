import { createElement } from 'react'

export function getDashboardDisplayName(user) {
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(' ')
  return fullName || user?.email || 'Usuario'
}

export function DashboardWelcome({ user }) {
  return createElement(
    'p',
    { className: 'mt-2 text-sm text-slate-400' },
    'Sesión iniciada como ',
    createElement(
      'span',
      { className: 'font-medium text-slate-200' },
      getDashboardDisplayName(user)
    )
  )
}
