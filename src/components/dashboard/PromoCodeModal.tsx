import React, { useState } from 'react';
import { useToast } from '../common/ToastProvider';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  is_active: boolean;
  max_uses: number | null;
  uses_count: number;
  start_date: string | null;
  end_date: string | null;
}

interface PromoCodeModalProps {
  open: boolean;
  onClose: () => void;
  onPromoCodeAdded?: () => void;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({ 
  open, 
  onClose, 
  onPromoCodeAdded 
}) => {
  const { showToast } = useToast();
  const [promoCodeData, setPromoCodeData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 10,
    is_active: true,
    max_uses: null as number | null,
    start_date: '',
    end_date: ''
  });

  const handleInputChange = (field: keyof typeof promoCodeData, value: any) => {
    setPromoCodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/promocodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promoCodeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create promo code');
      }

      showToast('Promo code created successfully!', 'success');
      if (onPromoCodeAdded) onPromoCodeAdded();
      onClose();
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      showToast(error.message || 'An error occurred while creating the promo code', 'error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#f9f2f7] rounded-lg shadow-lg p-8 w-full max-w-md border border-[#1827a0]">
        <h2 className="text-xl font-bold mb-4 text-[#03034b]">Create Promo Code</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#03034b]">Promo Code</label>
            <input
              type="text"
              value={promoCodeData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className="w-full border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent uppercase"
              placeholder="Enter promo code (e.g. SAVE10)"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[#03034b]">Discount Type</label>
            <select
              value={promoCodeData.discount_type}
              onChange={(e) => handleInputChange('discount_type', e.target.value as 'percentage' | 'fixed_amount')}
              className="w-full border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed Amount</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[#03034b]">
              Discount Value {promoCodeData.discount_type === 'percentage' ? '(%)' : '(₱)'}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={promoCodeData.discount_value}
              onChange={(e) => handleInputChange('discount_value', parseFloat(e.target.value))}
              className="w-full border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[#03034b]">Max Uses (Optional)</label>
            <input
              type="number"
              min="1"
              value={promoCodeData.max_uses || ''}
              onChange={(e) => handleInputChange('max_uses', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
              placeholder="Leave blank for unlimited"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[#03034b]">Start Date (Optional)</label>
            <input
              type="date"
              value={promoCodeData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="w-full border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[#03034b]">End Date (Optional)</label>
            <input
              type="date"
              value={promoCodeData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="w-full border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={promoCodeData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-[#03034b]">Active</label>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 rounded bg-[#e8e4d5] text-[#03034b] hover:bg-[#d4cec1] border border-[#1827a0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#1827a0] text-white hover:bg-[#0c5ee5] border border-[#03034b]"
            >
              Create Promo Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoCodeModal;