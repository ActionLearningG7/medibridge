/**
 * AddressForm Component
 * Reusable address input form with lat/lng fields
 */

import React from 'react';
import { Input } from '../../ui';

export const AddressForm = ({
  data,
  errors,
  onChange,
  onBlur,
}) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Line 1 - Required */}
      <Input
        label="Address Line 1"
        placeholder="House/Flat number and street"
        value={data.line1}
        onChange={(e) => handleChange('line1', e.target.value)}
        onBlur={onBlur}
        error={errors.line1}
        required
      />

      {/* Line 2 - Optional */}
      <Input
        label="Address Line 2"
        placeholder="Landmark, building name, etc."
        value={data.line2}
        onChange={(e) => handleChange('line2', e.target.value)}
      />

      {/* City and Pincode */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="e.g., Paris"
          value={data.city}
          onChange={(e) => handleChange('city', e.target.value)}
          onBlur={onBlur}
          error={errors.city}
          required
        />
        <Input
          label="Pincode"
          placeholder="Postal code"
          value={data.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          onBlur={onBlur}
          error={errors.zipCode}
          required
        />
      </div>

      {/* State/Province */}
      <Input
        label="State/Region"
        placeholder="e.g., Île-de-France"
        value={data.state}
        onChange={(e) => handleChange('state', e.target.value)}
        onBlur={onBlur}
        error={errors.state}
        required
      />


    </div>
  );
};
