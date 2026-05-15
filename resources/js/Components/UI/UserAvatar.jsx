const AVATAR_COLORS = [
    { bg: '#583c29', text: '#f5f0eb' },
    { bg: '#af987e', text: '#3c2819' },
    { bg: '#947c5e', text: '#f5f0eb' },
    { bg: '#84756d', text: '#f5f0eb' },
    { bg: '#6b5547', text: '#f5f0eb' },
];

function hashName(name = '') {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function getColor(name) {
    return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

const SIZES = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
};

export default function UserAvatar({ user, size = 'md', className = '' }) {
    const sizeClass = SIZES[size] ?? SIZES.md;
    const color     = getColor(user?.name ?? '');
    const initials  = getInitials(user?.name ?? '?');

    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt={user?.name}
                className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none ${className}`}
            style={{ background: color.bg, color: color.text }}
            aria-label={user?.name}
        >
            {initials}
        </div>
    );
}
