import React from "react";
import { Plus } from "lucide-react"; // Added Plus for better UX in list adding

// --- Reusable Form Field Component (Input Text/Number/Email) ---
export const FormField = ({ label, id, value, onChange, placeholder, type = 'text', required = true, maxLength, children, hideLabel, note }) => (
    <div className="mb-4">
        {!hideLabel && (
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
                {maxLength && <span className="float-right text-xs text-gray-500">{value?.length ?? 0} / {maxLength}</span>}
            </label>
        )}
        {children || (
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 
                    transition-colors duration-200"
            />
        )}
        {note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note}</p>}
    </div>
);

// --- TextArea Field Component ---
export const TextAreaField = ({ label, id, value, onChange, placeholder, required = true, rows = 3, maxLength, note }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
            {maxLength && <span className="float-right text-xs text-gray-500">{value?.length ?? 0} / {maxLength}</span>}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            maxLength={maxLength}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 
                transition-colors duration-200"
        ></textarea>
        {note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note}</p>}
    </div>
);

// --- Select Field Component ---
// 🚨 FIX 1: onChange prop is now defaulted to an empty function '() => {}' to prevent React warning 
// about controlled component with missing onChange handler.
export const SelectField = ({ label, id, value, onChange = () => {}, options, defaultOptionText = "Select an option", required = true, note }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            value={value}
            // 🚨 FIX 1: Using the provided onChange or the default no-op function
            onChange={onChange} 
            required={required}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 
                transition-colors duration-200"
        >
            <option value="" disabled>{defaultOptionText}</option>
            {(options || []).map(option => (
                <option key={option.id || option.name} value={option.id || option.name}>
                    {option.name}
                </option>
            ))}
        </select>
        {note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note}</p>}
    </div>
);

// --- New: Checkbox/Toggle Field Component ---
export const CheckboxField = ({ label, id, checked, onChange, description }) => (
    <div className="flex items-start gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer" onClick={() => onChange({ target: { checked: !checked } })}>
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <div className="flex-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                {label}
            </label>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
    </div>
);


// --- Reusable Array Field Component (e.g., for FAQ, Links, Keywords) ---
export const ArrayField = ({ label, fields, items, onAddItem, onRemoveItem, renderItem, note }) => (
    <div className="mb-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex justify-between items-center">
            {label} 
            <button 
                type="button" 
                onClick={onAddItem} 
                className="flex items-center text-sm px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition disabled:opacity-50"
                title={`Add New ${label.replace(' List', '')}`}
            >
                <Plus className="w-4 h-4 mr-1"/> Add
            </button>
        </label>

        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={item.frontendId || index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
        
        {note && <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{note}</p>}
    </div>
);