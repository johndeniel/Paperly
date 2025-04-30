import { LoginForm } from '@/components/login-form'
import { appConfig } from '@/lib/config'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-8 shadow">
        {/* Header */}
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-medium">{appConfig.appName}</h1>
          <p className="text-sm">{appConfig.loginHeader}</p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-2 text-center text-sm">{appConfig.loginFooter}</div>
      </div>
    </div>
  )
}
