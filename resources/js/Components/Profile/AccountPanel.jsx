import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Mail, Calendar, ShieldCheck, Link } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function AccountPanel({ user, stats, googleLinked }) {
    const [confirming, setConfirming] = useState(false);

    const deleteAccount = () => {
        router.delete('/profile', { preserveScroll: true });
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-brown-200/30 shadow-sm divide-y divide-brown-200/20">
                <InfoRow icon={Mail}        label="E-mail"        value={user.email} />
                <InfoRow icon={Calendar}    label="Membro desde"  value={stats.member_since} />
                <InfoRow icon={ShieldCheck} label="Verificação"   value="Email verificado" badge="verified" />
                <InfoRow
                    iconElement={<GoogleIcon />}
                    label="Login Google"
                    value={googleLinked ? 'Conta vinculada' : 'Não vinculado'}
                    badge={googleLinked ? 'google' : null}
                />
            </div>

            <div className="bg-red-50 border border-red-200/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700">Zona de perigo</p>
                        <p className="text-xs text-red-500 mt-1">
                            Excluir sua conta remove permanentemente todos os seus dados, receitas e ingredientes. Esta ação não pode ser desfeita.
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {confirming ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 flex flex-wrap gap-2"
                        >
                            <button
                                onClick={deleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Sim, excluir minha conta
                            </button>
                            <button
                                onClick={() => setConfirming(false)}
                                className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4"
                        >
                            <button
                                onClick={() => setConfirming(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                <Trash2 size={14} />
                                Excluir conta
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, iconElement, label, value, badge }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 bg-cream rounded-lg flex items-center justify-center shrink-0">
                {iconElement ?? (Icon && <Icon size={14} className="text-brown-500" />)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-brown-300">{label}</p>
                <p className="text-sm font-medium text-brown-700 truncate">{value}</p>
            </div>
            {badge === 'verified' && (
                <span className="text-[10px] bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 font-medium shrink-0">
                    ✓ Verificado
                </span>
            )}
            {badge === 'google' && (
                <span className="text-[10px] bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-medium shrink-0">
                    ✓ Ativo
                </span>
            )}
        </div>
    );
}
