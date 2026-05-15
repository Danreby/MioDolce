import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Mail, Calendar, ShieldCheck } from 'lucide-react';

export default function AccountPanel({ user, stats }) {
    const [confirming, setConfirming] = useState(false);

    const deleteAccount = () => {
        router.delete('/profile', { preserveScroll: true });
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-brown-200/30 shadow-sm divide-y divide-brown-200/20">
                <InfoRow icon={Mail}         label="E-mail"         value={user.email} />
                <InfoRow icon={Calendar}     label="Membro desde"   value={stats.member_since} />
                <InfoRow icon={ShieldCheck}  label="Verificação"    value="Email verificado" badge />
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

function InfoRow({ icon: Icon, label, value, badge }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 bg-cream rounded-lg flex items-center justify-center shrink-0">
                <Icon size={14} className="text-brown-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-brown-300">{label}</p>
                <p className="text-sm font-medium text-brown-700 truncate">{value}</p>
            </div>
            {badge && (
                <span className="text-[10px] bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 font-medium shrink-0">
                    ✓ Verificado
                </span>
            )}
        </div>
    );
}
