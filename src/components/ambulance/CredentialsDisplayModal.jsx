import React, { useState } from 'react';
import { Copy, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Modal to display newly generated credentials
 * Shows once and warns about security
 */
export default function CredentialsDisplayModal({
    credentials,
    driver,
    isOpen,
    onClose
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen || !credentials) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Driver Created Successfully</h2>
                        <p className="text-sm text-gray-600">{driver?.fullName}</p>
                    </div>
                </div>

                {/* Security Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-sm font-medium text-red-800">⚠️ Important Security Notice</p>
                        <p className="text-xs text-red-700 mt-1">
                            These credentials are displayed ONLY ONCE. Copy them now and share securely with the driver.
                            Do not leave this screen without saving the credentials.
                        </p>
                    </div>
                </div>

                {/* Credentials Display */}
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Username</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={credentials.username}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                            />
                            <button
                                onClick={() => copyToClipboard(credentials.username)}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Copy username"
                            >
                                <Copy size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Temporary Password</label>
                        <div className="flex items-center gap-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={credentials.generatedPassword}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} className="text-gray-600" />
                                ) : (
                                    <Eye size={18} className="text-gray-600" />
                                )}
                            </button>
                            <button
                                onClick={() => copyToClipboard(credentials.generatedPassword)}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Copy password"
                            >
                                <Copy size={18} className={copied ? 'text-green-600' : 'text-gray-600'} />
                            </button>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Email</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                value={credentials.email}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                            />
                            <button
                                onClick={() => copyToClipboard(credentials.email)}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Copy email"
                            >
                                <Copy size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Expiration */}
                    <div className="pt-2 border-t border-gray-300">
                        <p className="text-xs text-gray-600">
                            <strong>Password expires:</strong> {new Date(credentials.temporaryPasswordExpiresAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            <strong>Status:</strong> Temporary password - must change on first login
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Next Steps:</p>
                    <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Share these credentials securely with the driver</li>
                        <li>Driver logs in with username and temporary password</li>
                        <li>Driver must change password on first login</li>
                        <li>Credentials email notification has been sent</li>
                    </ol>
                </div>

                {/* Action Button */}
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
