import { motion } from 'framer-motion';
import { Camera, MapPin, Calendar, Clock } from 'lucide-react';
import UserAvatar from '../UI/UserAvatar';
import { router } from '@inertiajs/react';
import { useRef } from 'react';

export default function ProfileHeader({ user, stats }) {
    const fileRef = useRef(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('avatar', file);
        router.post('/profile/avatar', form, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden shadow-sm border border-brown-200/30"
        >
            <div
                className="h-28 sm:h-36"
                style={{
                    background: 'linear-gradient(135deg, #583c29 0%, #af987e 60%, #e6ddcf 100%)',
                }}
            />

            <div className="bg-white px-5 sm:px-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-10 gap-4">
                    <div className="relative w-fit">
                        <UserAvatar user={user} size="xl" className="ring-4 ring-white shadow-md" />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fileRef.current?.click()}
                            className="absolute bottom-0.5 right-0.5 w-8 h-8 bg-brown-600 rounded-full flex items-center justify-center shadow-md hover:bg-brown-700 transition-colors"
                            aria-label="Alterar foto"
                        >
                            <Camera size={13} className="text-white" />
                        </motion.button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <Pill icon={MapPin} label="Brasil" />
                        <Pill icon={Calendar} label={`Desde ${stats.member_since}`} />
                        <Pill icon={Clock} label={`${stats.member_days} dias`} />
                    </div>
                </div>

                <div className="mt-3">
                    <h1 className="text-xl font-bold text-brown-700">{user.name}</h1>
                    <p className="text-sm text-brown-400 mt-0.5">{user.email}</p>
                    {user.bio && (
                        <p className="text-sm text-brown-500 mt-2 max-w-xl leading-relaxed">{user.bio}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function Pill({ icon: Icon, label }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-brown-400 bg-cream px-3 py-1.5 rounded-full">
            <Icon size={12} />
            {label}
        </span>
    );
}
