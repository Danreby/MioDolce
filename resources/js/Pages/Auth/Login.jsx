import { useForm, Link } from '@inertiajs/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import FormField, { inputClass } from '../../Components/UI/Input';

Login.layout = (page) => <GuestLayout>{page}</GuestLayout>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login.store') ?? '/login');
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-brown-700">Bem-vindo de volta</h2>
                <p className="text-sm text-brown-400 mt-1">Entre na sua conta para continuar</p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">

                <FormField label="E-mail" error={errors.email} required>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        autoFocus
                        className={inputClass(errors.email)}
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
