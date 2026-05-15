import { useForm, Link } from '@inertiajs/react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import FormField, { inputClass } from '../../Components/UI/Input';

Register.layout = (page) => <GuestLayout>{page}</GuestLayout>;

export default function Register() {
    const [showPassword,    setShowPassword]    = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-brown-700">Criar conta</h2>
                <p className="text-sm text-brown-400 mt-1">Comece a gerenciar suas receitas hoje</p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">

                <FormField label="Nome completo" error={errors.name} required>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Seu nome"
                        autoComplete="name"
                        autoFocus
                        className={inputClass(errors.name)}
                    />
                </FormField>

                <FormField label="E-mail" error={errors.email} required>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        className={inputClass(errors.email)}
                    />
                </FormField>

                <FormField label="Senha" error={errors.password} hint="Mínimo 8 caracteres" required>
                    <div className={`flex items-center rounded-xl border bg-white transition-colors ${errors.password ? 'border-red-400' : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'}`}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="flex-1 px-3 py-2.5 text-sm text-brown-800 placeholder-brown-300 bg-transparent outline-none border-none focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-3 text-brown-400 hover:text-brown-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </FormField>

                <FormField label="Confirmar senha" error={errors.password_confirmation} required>
                    <div className={`flex items-center rounded-xl border bg-white transition-colors ${errors.password_confirmation ? 'border-red-400' : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'}`}>
                        <input
                            type={showConfirmation ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="flex-1 px-3 py-2.5 text-sm text-brown-800 placeholder-brown-300 bg-transparent outline-none border-none focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmation(!showConfirmation)}
                            className="px-3 text-brown-400 hover:text-brown-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </FormField>

                <Button type="submit" icon={UserPlus} loading={processing} size="lg" className="w-full mt-1">
                    Criar conta
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-cream text-center">
                <p className="text-sm text-brown-400">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="font-medium text-brown-600 hover:text-brown-700 underline underline-offset-2">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
