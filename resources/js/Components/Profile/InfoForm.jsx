import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, FileText } from 'lucide-react';
import FormField, { inputClass } from '../UI/Input';

export default function InfoForm({ user }) {
    const { data, setData, patch, processing, errors } = useForm({
        name:  user.name  ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        bio:   user.bio   ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch('/profile', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                    label="Nome completo"
                    id="name"
                    icon={<User size={15} />}
                    error={errors.name}
                >
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={inputClass(!!errors.name)}
                        placeholder="Seu nome"
                    />
                </FormField>

                <FormField
                    label="E-mail"
                    id="email"
                    icon={<Mail size={15} />}
                    error={errors.email}
                >
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={inputClass(!!errors.email)}
                        placeholder="seu@email.com"
                    />
                </FormField>
            </div>

            <FormField
                label="Telefone"
                id="phone"
                icon={<Phone size={15} />}
                error={errors.phone}
            >
                <input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className={inputClass(!!errors.phone)}
                    placeholder="(00) 00000-0000"
                />
            </FormField>

            <FormField
                label="Bio"
                id="bio"
                icon={<FileText size={15} />}
                error={errors.bio}
            >
                <textarea
                    id="bio"
                    value={data.bio}
                    onChange={(e) => setData('bio', e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className={`${inputClass(!!errors.bio)} resize-none`}
                    placeholder="Conte um pouco sobre você..."
                />
                <p className="text-xs text-brown-300 mt-1 text-right">{data.bio.length}/1000</p>
            </FormField>

            <div className="flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brown-600 text-white rounded-xl text-sm font-medium hover:bg-brown-700 transition-colors disabled:opacity-60"
                >
                    <Save size={15} />
                    {processing ? 'Salvando...' : 'Salvar informações'}
                </motion.button>
            </div>
        </form>
    );
}
