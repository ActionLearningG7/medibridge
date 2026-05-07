import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Ambulance Driver Form Component
 * Used for creating and editing driver profiles
 */
export default function DriverForm({ driver, onSubmit, onClose, isLoading }) {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactEmail: '',
        licenseNumber: '',
        licenseExpiry: '',
        joiningDate: '',
        employeeId: '',
        yearsOfExperience: '',
        vehicleRegistrationNumber: '',
        certificationNumber: '',
        serviceArea: '',
        homeBaseLatitude: '',
        homeBaseLongitude: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (driver) {
            setFormData({
                email: driver.email || '',
                firstName: driver.firstName || '',
                lastName: driver.lastName || '',
                dateOfBirth: driver.dateOfBirth || '',
                gender: driver.gender || '',
                phoneNumber: driver.phoneNumber || '',
                emergencyContactName: driver.emergencyContactName || '',
                emergencyContactPhone: driver.emergencyContactPhone || '',
                emergencyContactEmail: driver.emergencyContactEmail || '',
                licenseNumber: driver.licenseNumber || '',
                licenseExpiry: driver.licenseExpiry || '',
                joiningDate: driver.joiningDate || '',
                employeeId: driver.employeeId || '',
                yearsOfExperience: driver.yearsOfExperience || '',
                vehicleRegistrationNumber: driver.vehicleRegistrationNumber || '',
                certificationNumber: driver.certificationNumber || '',
                serviceArea: driver.serviceArea || '',
                homeBaseLatitude: driver.homeBaseLatitude || '',
                homeBaseLongitude: driver.homeBaseLongitude || '',
            });
        }
    }, [driver]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Invalid email format';

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        else if (!/^[+]?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\D/g, '')))
            newErrors.phoneNumber = 'Invalid phone format';

        if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';

        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
        if (!formData.vehicleRegistrationNumber) newErrors.vehicleRegistrationNumber = 'Vehicle registration is required';
        if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">
                        {driver ? 'Edit Ambulance Driver' : 'Create New Ambulance Driver'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Smith"
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="+1-555-0000"
                                />
                                {errors.phoneNumber && (
                                    <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.gender ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {errors.gender && (
                                    <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Name *
                                </label>
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Jane Smith"
                                />
                                {errors.emergencyContactName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.emergencyContactName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="emergencyContactPhone"
                                    value={formData.emergencyContactPhone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="+1-555-0001"
                                />
                                {errors.emergencyContactPhone && (
                                    <p className="text-sm text-red-600 mt-1">{errors.emergencyContactPhone}</p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Email
                                </label>
                                <input
                                    type="email"
                                    name="emergencyContactEmail"
                                    value={formData.emergencyContactEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* License Information Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">License & Certification</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    License Number *
                                </label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="DL-2026-001"
                                />
                                {errors.licenseNumber && (
                                    <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    License Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="licenseExpiry"
                                    value={formData.licenseExpiry}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.licenseExpiry ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.licenseExpiry && (
                                    <p className="text-sm text-red-600 mt-1">{errors.licenseExpiry}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Certification Number
                                </label>
                                <input
                                    type="text"
                                    name="certificationNumber"
                                    value={formData.certificationNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="CERT-2026-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    name="yearsOfExperience"
                                    value={formData.yearsOfExperience}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="5"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & Employment Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle & Employment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vehicle Registration *
                                </label>
                                <input
                                    type="text"
                                    name="vehicleRegistrationNumber"
                                    value={formData.vehicleRegistrationNumber}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.vehicleRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="AMB-001"
                                />
                                {errors.vehicleRegistrationNumber && (
                                    <p className="text-sm text-red-600 mt-1">{errors.vehicleRegistrationNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="EMP-2026-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Joining Date *
                                </label>
                                <input
                                    type="date"
                                    name="joiningDate"
                                    value={formData.joiningDate}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.joiningDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.joiningDate && (
                                    <p className="text-sm text-red-600 mt-1">{errors.joiningDate}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Area
                                </label>
                                <input
                                    type="text"
                                    name="serviceArea"
                                    value={formData.serviceArea}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Downtown"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Base Latitude
                                </label>
                                <input
                                    type="number"
                                    name="homeBaseLatitude"
                                    value={formData.homeBaseLatitude}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="40.7128"
                                    step="0.0001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Base Longitude
                                </label>
                                <input
                                    type="number"
                                    name="homeBaseLongitude"
                                    value={formData.homeBaseLongitude}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="-74.0060"
                                    step="0.0001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : driver ? 'Update Driver' : 'Create Driver'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
