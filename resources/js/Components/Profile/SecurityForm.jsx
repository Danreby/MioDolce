import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import FormField, { inputClass } from '../UI/Input';

export default function SecurityForm() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const [show, setShow] = useState({ current: false, next: false, confirm: false });

    const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

    const submit = (e) => {
        e.preventDefault();
        put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const EyeBtn = ({ field }) => (
        <button
            type="button"
            onClick={() => toggle(field)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-300 hover:text-brown-500"
        >
            {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
    );

    return (
        <form onSubmit={submit} className="space-y-5">
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

            <div className="grid sm:grid-cols-2 gap-5">
                <FormField label="Nova senha" id="password" icon={<Lock size={15} />} error={errors.password}>
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

                <FormField label="Confirmar nova senha" id="password_confirmation" icon={<Lock size={15} />} error={errors.password_confirmation}>
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
                    {processing ? 'Alterando...' : 'Alterar senha'}
                </motion.button>
            </div>
        </form>
    );
}
