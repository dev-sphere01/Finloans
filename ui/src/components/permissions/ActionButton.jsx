import { usePermissions } from '@/contexts/PermissionContext';
import {
    FaEye,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCog
} from 'react-icons/fa';

const actionStyles = {
    read: 'bg-blue-500 hover:bg-blue-600 text-white',
    create: 'bg-green-500 hover:bg-green-600 text-white',
    update: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    delete: 'bg-red-500 hover:bg-red-600 text-white',
    manage: 'bg-purple-500 hover:bg-purple-600 text-white',
};

const defaultIcons = {
    read: FaEye,
    create: FaPlus,
    update: FaEdit,
    delete: FaTrash,
    manage: FaCog,
};



/**
 * Universal ActionButton component with permission-based rendering
 * 
 * @param {string} module - The module name (optional, defaults to 'general')
 * @param {string} action - The action type (optional, defaults to 'read')
 * @param {string} label - Button text (optional, defaults to icon-only)
 * @param {function} onClick - Click handler function (required)
 * @param {string} className - Additional Tailwind classes
 * @param {ReactElement} icon - Custom icon (optional)
 * @param {boolean} disabled - Disable button
 * @param {string} size - Button size (sm, md, lg)
 * @param {object} style - Inline styles (optional)
 */
const ActionButton = ({
    module = 'general',
    action = 'read',
    label,
    onClick,
    className = '',
    icon,
    disabled = false,
    size = 'md',
    style = {}
}) => {
    const { hasPermission } = usePermissions();

    // Check if user has permission for this module/action (skip if module is 'general')
    let isAllowed = true;
    if (module !== 'general') {
        try {
            isAllowed = hasPermission(module, action);
        } catch (error) {
            console.warn('Permission check failed, denying action:', error);
            isAllowed = false; // Fallback to deny action if permission check fails
        }
    }

    // If user doesn't have permission, don't render the button
    if (!isAllowed) return null;

    // Size variants - different for icon-only vs text buttons
    const getSizeClasses = (hasText) => {
        if (hasText) {
            // Text buttons - normal padding
            return {
                sm: 'px-2 py-1 text-sm',
                md: 'px-4 py-2',
                lg: 'px-6 py-3 text-lg',
            };
        } else {
            // Icon-only buttons - equal padding on all sides
            return {
                sm: 'p-2 text-sm',
                md: 'p-4',
                lg: 'p-6 text-lg',
            };
        }
    };

    // Determine if we have text to display
    let buttonText = '';
    let hasText = false;

    if (typeof label === 'string' && label.length > 0) {
        // Custom text provided
        buttonText = label;
        hasText = true;
    } else {
        // Default to icon-only (no text)
        hasText = false;
    }

    // Get the appropriate icon with conditional margin
    const getIcon = () => {
        if (icon) {
            // Clone the icon and add margin class if text is present
            if (hasText) {
                return <span className="mr-2">{icon}</span>;
            }
            return icon;
        }
        const IconComponent = defaultIcons[action];
        if (!IconComponent) return null;
        return <IconComponent className={hasText ? "mr-2" : ""} />;
    };

    const sizeClasses = getSizeClasses(hasText);

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={style}
            className={`
        flex items-center justify-center
        ${sizeClasses[size]}
        rounded cursor-pointer mr-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${actionStyles[action] || 'bg-gray-500 hover:bg-gray-600 text-white'}
        ${className}
      `}
        >
            {getIcon()}
            {hasText && buttonText}
        </button>
    );
};

export default ActionButton;