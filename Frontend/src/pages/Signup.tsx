import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Input, FieldLabel, FieldError } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { fadeInUp } from '@/lib/animations'

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name must be at most 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be at most 50 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupValues = z.infer<typeof signupSchema>

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: SignupValues) => {
    if (isSubmitting) return
    setServerError(null)
    try {
      await signup(values.firstName.trim(), values.lastName.trim(), values.email.trim(), values.password)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    }
  }

  return (
    <PageContainer narrow className="py-12">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/10 mx-auto mb-4">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant/70 leading-relaxed">
            Join AI Battle Arena to compare AI models side-by-side.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="firstName" required>
                  First name
                </FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Ada"
                  invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  {...register('firstName')}
                />
                <FieldError id="firstName-error" message={errors.firstName?.message} />
              </div>
              <div>
                <FieldLabel htmlFor="lastName" required>
                  Last name
                </FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Lovelace"
                  invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  {...register('lastName')}
                />
                <FieldError id="lastName-error" message={errors.lastName?.message} />
              </div>
            </div>

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
                  autoComplete="new-password"
                  placeholder="At least 8 characters, letter + number"
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

            <div>
              <FieldLabel htmlFor="confirmPassword" required>
                Confirm password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className="pr-11"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirm}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-on-surface-variant/60 hover:text-on-surface transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError id="confirmPassword-error" message={errors.confirmPassword?.message} />
            </div>

            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full" size="md">
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant/70">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </PageContainer>
  )
}
