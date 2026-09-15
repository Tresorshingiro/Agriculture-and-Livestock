import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import LoginPage from './LoginPage'
import { portal } from '../data/config'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ authenticated: false }) })),
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  function renderLogin() {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    )
  }

  it('leaves the photograph without text', () => {
    const { container } = renderLogin()
    // The name heads the card; repeating it over the photo would say it twice.
    expect(container.querySelector('.login-visual').textContent).toBe('')
  })

  it('carries no agency mark on either half of the screen', () => {
    const { container } = renderLogin()
    expect(container.querySelector('img')).toBeNull()
  })

  it('heads the card with a badge and the full portal name', () => {
    const { container } = renderLogin()
    const card = container.querySelector('.login-card')

    expect(card.querySelector('.login-card__badge svg')).toBeTruthy()
    expect(card.querySelector('h1').textContent).toBe(portal.name)
    expect(card.querySelector('h1').textContent).not.toBe(portal.shortName)
  })

  it('asks for a username and a password, and submits with Sign in', () => {
    renderLogin()
    expect(screen.getByLabelText('Username')).toHaveAttribute('placeholder', 'Username')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveAttribute('type', 'submit')
  })
})
