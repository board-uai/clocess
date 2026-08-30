import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '@/auth'
import { register } from '@/lib/api'

export function Register() {
  const navigate = useNavigate()

  return (
    <div className="auth-in relative z-10 flex min-h-svh justify-center px-pad pt-[20svh]">
      <AuthForm
        title="register"
        action="register"
        autoComplete="new-password"
        confirm
        onSubmit={async (credentials) => {
          await register(credentials)
          navigate('/login', { replace: true })
        }}
        footer={
          <>
            already have an account?{' '}
            <Link to="/login" className="text-ink transition-colors hover:text-ink-2">
              sign in
            </Link>
          </>
        }
      />
    </div>
  )
}
