import { useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import GuestLayout from '../../Layouts/GuestLayout';

VerifyEmail.layout = (page) => <GuestLayout>{page}</GuestLayout>;

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const resend = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="p-6 sm:p-8">
            <div className="mb-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mx-auto w-16 h-16 bg-brown-100 rounded-2xl flex items-center justify-center mb-4"
                >
                    <Mail size={28} className="text-brown-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-brown-700">Verifique seu email</h2>
                <p className="text-sm text-brown-400 mt-1">
                    Um link de verificação foi enviado para o seu email
                </p>
            </div>

            <p className="text-sm text-brown-500 text-center leading-relaxed mb-6">
                Obrigado por se cadastrar! Antes de continuar, verifique seu email clicando no
                link que enviamos. Se não recebeu, clique abaixo para reenviar.
            </p>

            {status === 'verification-link-sent' && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"
                >
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium text-emerald-700">
                        Novo link enviado com sucesso!
                    </p>
                </motion.div>
            )}

            <form onSubmit={resend} className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brown-600 text-white rounded-xl text-sm font-medium hover:bg-brown-700 transition-colors disabled:opacity-60"
                >
                    {processing ? (
                        <>
                            <RefreshCw size={15} className="animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={15} />
                            Reenviar email de verificação
                        </>
                    )}
                </motion.button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-brown-200 text-brown-500 rounded-xl text-sm font-medium hover:bg-cream-50 transition-colors"
                >
                    <LogOut size={15} />
                    Sair da conta
                </Link>
            </form>
        </div>
    );
}
