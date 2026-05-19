import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import FormField, { inputClass } from '../UI/Input';
import GoogleButton from '../UI/GoogleButton';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

export default function SecurityForm({ hasPassword, googleLinked }) {
    const isSettingPassword = !hasPassword;

    const { data, setData, put, post, processing, errors, reset } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const { triggerGoogleLogin, isLoading: googleLoading } = useGoogleAuth('link');

    const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

    const submit = (e) => {
        e.preventDefault();
        if (isSettingPassword) {
            post(route('profile.password.set'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        } else {
            put(route('profile.password'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const handleUnlinkGoogle = async () => {
        try {
            await axios.delete(route('google.unlink'));
            toast.success('Conta Google desvinculada.');
            router.reload({ only: ['auth', 'googleLinked', 'hasPassword'] });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Erro ao desvincular conta Google.');
        }
    };

    const EyeBtn = ({ field }) => (
        <button
            type="button"
            onClick={() => toggle(field)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-300 hover:text-brown-500"
            aria-label={show[field] ? 'Ocultar' : 'Mostrar'}
        >
            {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
    );

    return (
        <div className="space-y-8">
            <form onSubmit={submit} className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <KeyRound size={15} className="text-brown-400" />
                    <h3 className="text-sm font-semibold text-brown-700">
                        {isSettingPassword ? 'Definir senha' : 'Alterar senha'}
                    </h3>
                </div>

                {isSettingPassword && (
                    <p className="text-xs text-brown-400 -mt-2 leading-relaxed">
                        Sua conta usa login pelo Google. Defina uma senha para também poder entrar pelo e-mail.
                    </p>
                )}

                {!isSettingPassword && (
                    <FormField label="Senha atual" id="current_password" icon={<Lock size={15} />} error={errors.current_password}>
                        <div className="relative">
                            <input
                                id="current_password"
                                type={show.current ? 'text' : 'password'}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className={`${inputClass(!!errors.current_password)} pr-10`}
                                placeholder="Senha atual"
                                autoComplete="current-password"
                            />
                            <EyeBtn field="current" />
                        </div>
                    </FormField>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                        label={isSettingPassword ? 'Senha' : 'Nova senha'}
                        id="password"
                        icon={<Lock size={15} />}
                        error={errors.password}
                    >
                        <div className="relative">
                            <input
                                id="password"
                                type={show.next ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`${inputClass(!!errors.password)} pr-10`}
                                placeholder="Nova senha"
                                autoComplete="new-password"
                            />
                            <EyeBtn field="next" />
                        </div>
                    </FormField>

                    <FormField
                        label="Confirmar senha"
                        id="password_confirmation"
                        icon={<Lock size={15} />}
                        error={errors.password_confirmation}
                    >
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                type={show.confirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={`${inputClass(!!errors.password_confirmation)} pr-10`}
                                placeholder="Repita a nova senha"
                                autoComplete="new-password"
                            />
                            <EyeBtn field="confirm" />
                        </div>
                    </FormField>
                </div>

                <div className="flex justify-end">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brown-600 text-white rounded-xl text-sm font-medium hover:bg-brown-700 transition-colors disabled:opacity-60"
                    >
                        <ShieldCheck size={15} />
                        {processing
                            ? 'Salvando...'
                            : isSettingPassword
                                ? 'Definir senha'
                                : 'Alterar senha'
                        }
                    </motion.button>
                </div>
            </form>

            <div className="border-t border-brown-200/30 pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <h3 className="text-sm font-semibold text-brown-700">Google</h3>
                    {googleLinked && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 font-medium">
                            ✓ Vinculado
                        </span>
                    )}
                </div>

                {googleLinked ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-xs text-brown-400 flex-1">
                            Sua conta Google está vinculada. Você pode entrar usando o Google.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleUnlinkGoogle}
                            disabled={!hasPassword}
                            title={!hasPassword ? 'Defina uma senha antes de desvincular o Google' : 'Desvincular conta Google'}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Desvincular Google
                        </motion.button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xs text-brown-400">
                            Vincule sua conta Google para poder entrar com um clique.
                        </p>
                        <GoogleButton
                            onClick={triggerGoogleLogin}
                            isLoading={googleLoading}
                            label="Vincular conta Google"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

