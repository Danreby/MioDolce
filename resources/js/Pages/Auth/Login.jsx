import { useForm, Link } from '@inertiajs/react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import FormField, { inputClass } from '../../Components/UI/Input';
import GoogleButton from '../../Components/UI/GoogleButton';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import useAuthErrors from '../../hooks/useAuthErrors';

Login.layout = (page) => <GuestLayout>{page}</GuestLayout>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const googleButtonRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    const { triggerGoogleLogin, isLoading: googleLoading } = useGoogleAuth('login');
    const { isGoogleOnly, isThrottle, emailMessage, humanizeError } = useAuthErrors(errors);

    useEffect(() => {
        if (isGoogleOnly) {
            googleButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isGoogleOnly]);

    const submit = (e) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    const showEmailError = !isGoogleOnly && !isThrottle && errors.email;

    return (
        <div className="p-6 sm:p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-brown-700">Bem-vindo de volta</h2>
                <p className="text-sm text-brown-400 mt-1">Entre na sua conta para continuar</p>
            </div>

            {isGoogleOnly && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>
                        Este email está vinculado apenas ao Google.{' '}
                        <button
                            type="button"
                            onClick={() => googleButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="font-medium underline underline-offset-2 hover:text-amber-800"
                        >
                            Usar login com Google →
                        </button>
                    </span>
                </div>
            )}

            {isThrottle && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{emailMessage}</span>
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">

                <FormField label="E-mail" error={showEmailError ? (emailMessage ?? errors.email) : null} required>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        autoFocus
                        className={inputClass(showEmailError)}
                    />
                </FormField>

                <FormField label="Senha" error={errors.password} required>
                    <div className={`flex items-center rounded-xl border bg-white transition-colors ${errors.password ? 'border-red-400' : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'}`}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="flex-1 px-3 py-2.5 text-sm text-brown-800 placeholder-brown-300 bg-transparent outline-none border-none focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-3 text-brown-400 hover:text-brown-600 transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </FormField>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-brown-300 text-brown-600 focus:ring-brown-400"
                        />
                        <span className="text-sm text-brown-500">Lembrar-me</span>
                    </label>
                </div>

                <Button type="submit" icon={LogIn} loading={processing} size="lg" className="w-full mt-1">
                    Entrar
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brown-200/60" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-brown-400 uppercase tracking-wide">ou</span>
                </div>
            </div>

            <div ref={googleButtonRef}>
                <GoogleButton
                    onClick={triggerGoogleLogin}
                    isLoading={googleLoading}
                    label="Entrar com Google"
                    disabled={processing}
                />
            </div>

            <div className="mt-6 pt-6 border-t border-cream text-center">
                <p className="text-sm text-brown-400">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="font-medium text-brown-600 hover:text-brown-700 underline underline-offset-2">
                        Criar conta
                    </Link>
                </p>
            </div>
        </div>
    );
}
