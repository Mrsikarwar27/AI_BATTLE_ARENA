import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Input, FieldLabel, FieldError } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { fadeInUp } from '@/lib/animations'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    if (isSubmitting) return
    setServerError(null)
    try {
      await login(values.email.trim(), values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <PageContainer narrow className="py-12">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/10 mx-auto mb-4">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant/70 leading-relaxed">
            Log in to continue comparing AI models.
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-border-subtle shadow-sm p-6 sm:p-8">
          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl bg-error/10 border border-error/20 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-error" />
              <p className="text-sm text-on-error-container leading-relaxed">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <FieldLabel htmlFor="email" required>
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              <FieldError id="email-error" message={errors.email?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="password" required>
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-on-surface-variant/60 hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError id="password-error" message={errors.password?.message} />
            </div>

            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full" size="md">
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant/70">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </PageContainer>
  )
}
