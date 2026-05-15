import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';

/**
 * Escuta as flash messages do Laravel (via Inertia shared props)
 * e exibe toasts automaticamente.
 */
export function useFlash() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);
}
