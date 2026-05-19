import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Settings } from 'lucide-react';
import ProfileHeader from '../../Components/Profile/ProfileHeader';
import ProfileStats  from '../../Components/Profile/ProfileStats';
import InfoForm      from '../../Components/Profile/InfoForm';
import SecurityForm  from '../../Components/Profile/SecurityForm';
import AccountPanel  from '../../Components/Profile/AccountPanel';

const TABS = [
    { id: 'info',     label: 'Informações',  icon: User },
    { id: 'security', label: 'Segurança',    icon: ShieldCheck },
    { id: 'account',  label: 'Conta',        icon: Settings },
];

export default function Index({ stats, googleLinked, hasPassword }) {
    const { props: { auth } } = usePage();
    const user = auth.user;
    const [tab, setTab] = useState('info');

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <ProfileHeader user={user} stats={stats} />
            <ProfileStats  stats={stats} />

            <div className="bg-white rounded-2xl border border-brown-200/30 shadow-sm overflow-hidden">
                <div className="flex border-b border-brown-200/30 px-4 gap-1 pt-2">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`
                                relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                                ${tab === t.id ? 'text-brown-700' : 'text-brown-400 hover:text-brown-600'}
                            `}
                        >
                            <t.icon size={14} />
                            {t.label}
                            {tab === t.id && (
                                <motion.span
                                    layoutId="tabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brown-600 rounded-t"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="p-6"
                    >
                        {tab === 'info'     && <InfoForm     user={user} />}
                        {tab === 'security' && <SecurityForm hasPassword={hasPassword} googleLinked={googleLinked} />}
                        {tab === 'account'  && <AccountPanel user={user} stats={stats} googleLinked={googleLinked} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
