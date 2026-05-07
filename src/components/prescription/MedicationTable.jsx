import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

const MedicineRouteOptions = [
    'ORAL', 'IV', 'IM', 'SC', 'TOPICAL', 'INHALATION', 'RECTAL', 'DROPS', 'OTHER'
];

const MedicationTable = ({ medications, onChange, errors = {} }) => {
    const handleAddRow = () => {
        onChange([
            ...medications,
            {
                id: Date.now(), // Temp ID
                medicineName: '',
                dosage: '',
                route: 'ORAL',
                frequency: '',
                durationDays: 1,
                quantity: 1,
                instructions: '',
            },
        ]);
    };

    const handleRemoveRow = (index) => {
        const newMeds = [...medications];
        newMeds.splice(index, 1);
        onChange(newMeds);
    };

    const handleChange = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index] = { ...newMeds[index], [field]: value };
        onChange(newMeds);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Medications</h3>
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center px-3 py-1.5 border border-primary-600 shadow-sm text-xs font-medium rounded text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medication
                </button>
            </div>

            {errors.medications && (
                <div className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.medications}
                </div>
            )}

            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-1/4">Medicine Name</th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Dosage</th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Route</th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Frequency</th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Days</th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Qty</th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-1/4">Instructions</th>
                            <th scope="col" className="relative px-4 py-4 w-10">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {medications.map((med, index) => (
                            <tr key={med.id || index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={med.medicineName}
                                        onChange={(e) => handleChange(index, 'medicineName', e.target.value)}
                                        placeholder="e.g. Amoxicillin"
                                        className="block w-full border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={med.dosage}
                                        onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                                        placeholder="500mg"
                                        className="block w-full border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={med.route}
                                        onChange={(e) => handleChange(index, 'route', e.target.value)}
                                        className="block w-full border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all bg-white"
                                    >
                                        {MedicineRouteOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={med.frequency}
                                        onChange={(e) => handleChange(index, 'frequency', e.target.value)}
                                        placeholder="TID"
                                        className="block w-full border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={med.durationDays}
                                        onChange={(e) => handleChange(index, 'durationDays', parseInt(e.target.value) || 0)}
                                        className="block w-20 border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={med.quantity}
                                        onChange={(e) => handleChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="block w-20 border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={med.instructions}
                                        onChange={(e) => handleChange(index, 'instructions', e.target.value)}
                                        placeholder="After meals"
                                        className="block w-full border-gray-200 rounded-xl shadow-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(index)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {medications.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-3 py-8 text-center text-sm text-gray-500">
                                    No medications added. Click "Add Medication" to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MedicationTable;
