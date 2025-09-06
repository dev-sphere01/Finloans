import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { IoCloseCircleOutline } from "react-icons/io5";

const icons = {
    success: <CheckCircle className="text-green-600" />,
    info: <Info className="text-blue-600" />,
    warning: <AlertTriangle className="text-yellow-600" />,
    error: <XCircle className="text-red-600" />,
    loading: <Loader2 className="animate-spin text-gray-600" />,
};

const bgColors = {
    success: 'bg-green-100 border-green-300 text-green-800',
    info: 'bg-blue-100 border-blue-300 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    error: 'bg-red-100 border-red-300 text-red-800',
    loading: 'bg-gray-100 border-gray-300 text-gray-800',
};

const iconColors = {
    success: 'text-green-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    loading: 'text-gray-600',
};


let subscribers = [];

export const pushToast = (toast) => {
    subscribers.forEach((fn) => fn(toast));
};

const NotificationContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handle = (toast) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { ...toast, id }]);
            if (toast.autoClose !== false) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id));
                }, toast.duration || 3000);
            }
        };
        subscribers.push(handle);
        return () => {
            subscribers = subscribers.filter((s) => s !== handle);
        };
    }, []);

    const remove = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="fixed z-[9999] top-4 right-4 space-y-3 flex flex-col items-end">
            <AnimatePresence>
                {toasts.map(({ id, type, message }) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex items-start gap-3 w-80 px-5 py-4 rounded-xl shadow-lg border ${bgColors[type] || bgColors.info}`}
                    >
                        {icons[type]}
                        <div className="text-sm font-medium flex-1">{message}</div>
                        <button
                            onClick={() => remove(id)}
                            className="self-center hover:opacity-80 transition-opacity"
                        >
                            <IoCloseCircleOutline
                                size={25}
                                className={iconColors[type] || 'text-blue-600'}
                            />
                        </button>

                    </motion.div>
                ))}

            </AnimatePresence>
        </div>
    );
};

export default NotificationContainer;
