// Reusable form input components with consistent styling

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
        <input
            className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = ({ label, error, className = '', children, ...props }: SelectProps) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
        <select
            className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = ({ label, error, className = '', ...props }: TextAreaProps) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
        <textarea
            className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    children: React.ReactNode;
}

export const Button = ({ variant = 'primary', className = '', children, ...props }: ButtonProps) => {
    const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-500/30',
        secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30',
        success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ title, children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${className}`}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
    </div>
);

interface TableProps {
    headers: string[];
    children: React.ReactNode;
    className?: string;
}

export const Table = ({ headers, children, className = '' }: TableProps) => (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-b border-gray-200">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="p-5 font-semibold">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
    <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
    </div>
);
