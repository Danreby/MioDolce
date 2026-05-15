import { motion, AnimatePresence } from 'framer-motion';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ChefHat,
    User,
    LogOut,
    Candy,
    X,
    Circle,
} from 'lucide-react';
import UserAvatar from '../Components/UI/UserAvatar';

const SECTIONS = [
    {
        label: 'Menu',
        items: [
            { href: '/',            label: 'Dashboard',    icon: LayoutDashboard },
            { href: '/ingredients', label: 'Ingredientes', icon: Package },
            { href: '/recipes',     label: 'Receitas',     icon: ChefHat },
        ],
    },
    {
        label: 'Conta',
        items: [
            { href: '/profile', label: 'Meu Perfil', icon: User },
        ],
    },
];

const containerVariants = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.055, delayChildren: 0.18 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -18 },
    show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } },
};

function NavItem({ href, label, icon: Icon, isActive, onClick }) {
    return (
        <motion.div variants={itemVariants}>
            <Link
                href={href}
                onClick={onClick}
                className={`
                    relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-colors group
                    ${isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/55 hover:bg-white/10 hover:text-white'
                    }
                `}
            >
                {isActive && (
                    <motion.span
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brown-200 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                )}
                <Icon
                    size={16}
                    className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-brown-200' : ''}`}
                />
                <span>{label}</span>
                {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-brown-200/80 rounded-full" />
                )}
            </Link>
        </motion.div>
    );
}

export default function Sidebar({ open, onClose }) {
    const { url, props: { auth } } = usePage();
    const user = auth?.user;

    const isActive = (href) =>
        href === '/' ? url === '/' : url === href || url.startsWith(href + '/');

    const logout = () => {
        onClose();
        router.post('/logout');
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[6px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <motion.aside
                        className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col overflow-hidden shadow-2xl"
                        initial={{ x: -310 }}
                        animate={{ x: 0 }}
                        exit={{ x: -310 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                        aria-label="Menu de navegação"
                        style={{
                            background: 'linear-gradient(175deg, #5a3e2b 0%, #583c29 55%, #4a3221 100%)',
                        }}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                            <motion.div
                                className="flex items-center gap-2.5"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 20, scale: 1.12 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                    className="w-8 h-8 bg-brown-200 rounded-lg flex items-center justify-center cursor-default"
                                >
                                    <Candy size={16} className="text-brown-700" />
                                </motion.div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-none">MioDolce</p>
                                    <p className="text-white/40 text-[10px] mt-0.5">Gestão de Receitas</p>
                                </div>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.12, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                aria-label="Fechar menu"
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {user && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.12 }}
                                className="mx-4 mt-4 p-3.5 rounded-2xl border border-white/10"
                                style={{ background: 'rgba(255,255,255,0.07)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={user} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate leading-tight">
                                            {user.name}
                                        </p>
                                        <p className="text-white/45 text-xs truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div
                                        className="flex items-center gap-1 shrink-0 bg-emerald-500/20 rounded-full px-2 py-0.5"
                                        title="Online"
                                    >
                                        <Circle size={6} className="fill-emerald-400 text-emerald-400" />
                                        <span className="text-[10px] text-emerald-300 font-medium">Online</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <motion.nav
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin"
                        >
                            {SECTIONS.map((section) => (
                                <div key={section.label}>
                                    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.12em] px-4 mb-1.5">
                                        {section.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => (
                                            <NavItem
                                                key={item.href}
                                                {...item}
                                                isActive={isActive(item.href)}
                                                onClick={onClose}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.nav>

                        <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-0.5">
                            <motion.button
                                whileHover={{ x: 5 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/15 hover:text-red-300 transition-colors"
                            >
                                <LogOut size={16} className="shrink-0" />
                                <span>Sair da conta</span>
                            </motion.button>
                            <p className="text-[11px] text-white/20 text-center pt-2 select-none">
                                MioDolce © {new Date().getFullYear()}
                            </p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
