'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types/customer';
import { useToast } from '@/components/common/ToastProvider';
import Autocomplete from '@/components/common/Autocomplete';

type MembershipType = 'student' | 'professional';
type PassType = 'walk-in' | 'day-pass' | 'night-pass' | '1-day' | 'weekly' | 'monthly';

interface CheckInCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCheckIn: (data: any) => void;
}

function CheckInCustomerModal({ open, onClose, onCheckIn }: CheckInCustomerModalProps) {
  const { showToast } = useToast();
  const RATES: Record<PassType, Record<MembershipType, number>> = {
    'walk-in': { student: 30, professional: 40 },
    'day-pass': { student: 200, professional: 250 },
    'night-pass': { student: 150, professional: 200 },
    '1-day': { student: 300, professional: 400 },
    'weekly': { student: 1000, professional: 1200 },
    'monthly': { student: 2500, professional: 3500 },
  };

  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [passType, setPassType] = useState<PassType>('walk-in');
  const [membershipType, setMembershipType] = useState<MembershipType>('student');
  const [amount, setAmount] = useState(0);
  
  // For walk-in check-in/checkout
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [isWalkInActive, setIsWalkInActive] = useState(false);
  const [hoursStayed, setHoursStayed] = useState<number>(0);
  
  // For payment processing
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  
  // For existing customers
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  
  // For new customers
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    affiliation: '',
    email: '',
    contactNumber: ''
  });

  // Fetch customers when modal opens
  useEffect(() => {
    if (open && activeTab === 'existing') {
      loadCustomers();
    }
  }, [open, activeTab]);

  // Update amount when pass or membership type changes
  useEffect(() => {
    if (passType !== 'walk-in') {
      setAmount(RATES[passType][membershipType]);
      setPaymentAmount(RATES[passType][membershipType]);
      setFinalAmount(RATES[passType][membershipType]);
    }
  }, [passType, membershipType, RATES]);

  const loadCustomers = () => {
    setCustomerLoading(true);
    setCustomerError(null);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setCustomerLoading(false);
      })
      .catch(() => {
        setCustomerError('Failed to load customers');
        setCustomerLoading(false);
      });
  };

  const handleNewCustomerChange = (field: keyof typeof newCustomerData, value: string) => {
    setNewCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateHoursStayed = (checkIn: Date, checkOut: Date): number => {
    const msDiff = checkOut.getTime() - checkIn.getTime();
    const hoursDiff = msDiff / (1000 * 60 * 60);

    // Round according to the specified conditions:
    // Less than 1 hour is considered as 1 hour
    // If minutes are <= 30, round down; if > 30, round up
    if (hoursDiff < 1) {
      return 1; // Less than 1 hour counts as 1 hour
    } else {
      const wholeHours = Math.floor(hoursDiff);
      const remainingMinutes = (hoursDiff - wholeHours) * 60;

      if (remainingMinutes <= 30) {
        return wholeHours; // Round down
      } else {
        return wholeHours + 1; // Round up
      }
    }
  };

  const handleStartWalkIn = (): void => {
    const now = new Date();
    setCheckInTime(now);
    setCheckOutTime(null);
    setIsWalkInActive(true);
    setHoursStayed(0);
    setAmount(0); // Reset amount when starting walk-in
  };

  const handleCheckoutWalkIn = async (): Promise<void> => {
    const out = new Date();
    setCheckOutTime(out);

    if (checkInTime) {
      const hours = calculateHoursStayed(checkInTime, out);
      setHoursStayed(hours);

      // Calculate amount based on hourly rate
      const hourlyRate = RATES['walk-in'][membershipType];
      let totalAmount = hours * hourlyRate;
      
      // Apply discount if promo code is applied
      if (discount > 0) {
        totalAmount = totalAmount - discount;
      }
      
      setAmount(totalAmount);
      setFinalAmount(totalAmount);
      setPaymentAmount(totalAmount);

      try {
        // Prepare the request data for walk-in checkout
        let requestData: any;
        
        if (activeTab === 'existing' && selectedCustomerId) {
          requestData = {
            customerId: selectedCustomerId,
            passType: 'walk-in',
            membershipType,
            amount: totalAmount,
            isNewCustomer: false,
            checkInTime: checkInTime.toISOString(), // Send the check-in time for the log
            checkOutTime: out.toISOString(),       // Send the check-out time for the log
            promoCode: promoCode || null,          // Include promo code if applied
            discountApplied: discount || 0         // Include discount amount if applied
          };
          
          console.log('Sending walk-in checkout request data:', requestData);
          
          const response = await fetch('/api/checkins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            const errorMessage = data.userMessage || data.error || 'Failed to checkout customer';
            throw new Error(errorMessage);
          }
          
          const customer = customers.find(c => c.id === selectedCustomerId) || null;
          onCheckIn({
            customer,
            passType: 'walk-in',
            membershipType,
            amount: totalAmount,
            isNewCustomer: false
          });
          
          showToast('Walk-in customer checked out successfully!', 'success');
        } else if (activeTab === 'new') {
          // For new customer
          const requiredFields = ['firstName', 'lastName', 'affiliation', 'email', 'contactNumber'];
          const emptyFields = requiredFields.filter(field => !newCustomerData[field as keyof typeof newCustomerData].trim());
          
          if (emptyFields.length > 0) {
            showToast(`Please fill in: ${emptyFields.join(', ')}`, 'error');
            return;
          }
          
          requestData = {
            passType: 'walk-in',
            membershipType,
            amount: totalAmount,
            isNewCustomer: true,
            newCustomerData,
            checkInTime: checkInTime.toISOString(), // Send the check-in time for the log
            checkOutTime: out.toISOString(),       // Send the check-out time for the log
            promoCode: promoCode || null,          // Include promo code if applied
            discountApplied: discount || 0         // Include discount amount if applied
          };
          
          console.log('Sending new walk-in customer request data:', requestData);
          
          const response = await fetch('/api/checkins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            const errorMessage = data.userMessage || data.error || 'Failed to checkout customer';
            throw new Error(errorMessage);
          }
          
          onCheckIn({
            customer: null,
            newCustomerData,
            passType: 'walk-in',
            membershipType,
            amount: totalAmount,
            isNewCustomer: true
          });
          
          showToast('New walk-in customer checked out successfully!', 'success');
        }
      } catch (error: any) {
        console.error('Error checking out walk-in customer:', error);
        showToast(error.message || 'An error occurred while checking out the customer', 'error');
      }
    }

    setIsWalkInActive(false);
    onClose(); // Close the modal after checkout
  };

  const handlePromoCodeApply = async () => {
    if (!promoCode.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    try {
      const response = await fetch('/api/promocodes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply promo code');
      }

      // Calculate discount based on promo code type
      let calculatedDiscount = 0;
      if (data.discount_type === 'percentage') {
        calculatedDiscount = (amount * data.discount_value) / 100;
      } else if (data.discount_type === 'fixed_amount') {
        calculatedDiscount = Math.min(data.discount_value, amount); // Don't discount more than the original amount
      }

      setDiscount(calculatedDiscount);
      const newFinalAmount = Math.max(amount - calculatedDiscount, 0);
      setFinalAmount(newFinalAmount);
      setPaymentAmount(newFinalAmount);
      showToast(`Promo code applied! Discount: ₱${calculatedDiscount.toFixed(2)}`, 'success');
    } catch (error: any) {
      console.error('Error applying promo code:', error);
      showToast(error.message || 'Failed to apply promo code', 'error');
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReceivedAmount(value);
    
    if (value && !isNaN(parseFloat(value))) {
      const received = parseFloat(value);
      const change = received - paymentAmount;
      setChangeAmount(change);
    } else {
      setChangeAmount(0);
    }
  };

  const handlePaymentSubmit = () => {
    const received = parseFloat(receivedAmount);
    if (isNaN(received) || received < paymentAmount) {
      showToast(`Amount received must be at least ₱${paymentAmount.toFixed(2)}`, 'error');
      return;
    }
    
    setIsPaid(true);
    showToast('Payment confirmed!', 'success');
  };

  const handleCheckIn = async () => {
    // Handle walk-in checkout first
    if (passType === 'walk-in' && isWalkInActive) {
      // This means the user wants to checkout after starting a walk-in session
      handleCheckoutWalkIn();
      return; // Don't proceed with normal check-in flow
    }

    // Prevent check-in if the pass type is not 'walk-in' and no payment is made
    if (passType !== 'walk-in' && !isPaid) {
      showToast('Payment is required for non-walk-in passes', 'error');
      return;
    }

    // Determine if we're dealing with an existing customer
    const isExistingCustomer = activeTab === 'existing' && selectedCustomerId;
    
    // For existing customer tab, check if customer was selected
    if (activeTab === 'existing' && !selectedCustomerId) {
      showToast('Please select a customer from the search results', 'error');
      return;
    }
    
    if (isExistingCustomer) {
      // For existing customer
      try {
        // Calculate final amount with discount
        let finalAmountValue = amount;
        if (discount > 0) {
          finalAmountValue = amount - discount;
        }
        
        const requestData = {
          customerId: selectedCustomerId,
          passType,
          membershipType,
          amount: finalAmountValue, // Use final amount after discount
          isNewCustomer: false
        };
        
        console.log('Sending request data:', requestData);
        
        const response = await fetch('/api/checkins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          const errorMessage = data.userMessage || data.error || 'Failed to check in customer';
          throw new Error(errorMessage);
        }
        
        const customer = customers.find(c => c.id === selectedCustomerId) || null;
        onCheckIn({
          customer,
          passType,
          membershipType,
          amount,
          isNewCustomer: false
        });
        
        showToast('Customer checked in successfully!', 'success');
        
        // Close modal after successful check-in
        onClose();
      } catch (error: any) {
        console.error('Error checking in customer:', error);
        showToast(error.message || 'An error occurred while checking in the customer', 'error');
      }
    } else {
      // For new customer
      const requiredFields = ['firstName', 'lastName', 'affiliation', 'email', 'contactNumber'];
      const emptyFields = requiredFields.filter(field => !newCustomerData[field as keyof typeof newCustomerData].trim());
      
      if (emptyFields.length > 0) {
        showToast(`Please fill in: ${emptyFields.join(', ')}`, 'error');
        return;
      }
      
      try {
        // Calculate final amount with discount
        let finalAmountValue = amount;
        if (discount > 0) {
          finalAmountValue = amount - discount;
        }
        
        const requestData = {
          passType,
          membershipType,
          amount: finalAmountValue, // Use final amount after discount
          isNewCustomer: true,
          newCustomerData
        };
        
        console.log('Sending new customer request data:', requestData);
        
        const response = await fetch('/api/checkins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          const errorMessage = data.userMessage || data.error || 'Failed to check in customer';
          throw new Error(errorMessage);
        }
        
        onCheckIn({
          customer: null,
          newCustomerData,
          passType,
          membershipType,
          amount,
          isNewCustomer: true
        });
        
        showToast('New customer registered and checked in successfully!', 'success');
        
        // Close modal after successful check-in
        onClose();
      } catch (error: any) {
        console.error('Error checking in new customer:', error);
        showToast(error.message || 'An error occurred while checking in the customer', 'error');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#f9f2f7] to-[#e8e4d5] rounded-xl shadow-2xl p-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-4 border border-[#1827a0] border-opacity-30 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#03034b] text-center">Check In Customer</h2>
        
        {/* Tab Selector */}
        <div className="flex mb-6 bg-[#e8e4d5] rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors duration-200 ${activeTab === 'existing' ? 'bg-[#1827a0] text-white shadow-md' : 'text-[#03034b] hover:bg-[#d4cec1]'}`}
            onClick={() => setActiveTab('existing')}
          >
            Existing Customer
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors duration-200 ${activeTab === 'new' ? 'bg-[#1827a0] text-white shadow-md' : 'text-[#03034b] hover:bg-[#d4cec1]'}`}
            onClick={() => setActiveTab('new')}
          >
            New Customer
          </button>
        </div>
        
        <div className="mb-4">
          {/* Pass Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-[#03034b]">Pass Type</label>
            <select
              value={passType}
              onChange={(e) => setPassType(e.target.value as PassType)}
              className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
            >
              <option value="walk-in">Walk-in</option>
              <option value="day-pass">Day Pass</option>
              <option value="night-pass">Night Pass</option>
              <option value="1-day">All-Day Pass</option>
              <option value="weekly">Weekly Pass</option>
              <option value="monthly">Monthly Pass</option>
            </select>
          </div>
          
          {/* Membership Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-[#03034b]">Membership Type</label>
            <select
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value as MembershipType)}
              className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
            >
              <option value="student">Student</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          
          <div className="mb-4">
            {activeTab === 'existing' ? (
              <div>
                <label className="block text-sm font-medium mb-1 text-[#03034b]">Select Customer</label>
                <Autocomplete
                  options={customers}
                  value={selectedCustomerName}
                  onChange={setSelectedCustomerName}
                  onSelect={(customer) => {
                    setSelectedCustomerId(customer.id);
                    setSelectedCustomerName(`${customer.first_name} ${customer.last_name}`);
                  }}
                  placeholder="Search customer by name or affiliation..."
                />
              </div>
            ) : (
              // New Customer Form
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#03034b]">First Name</label>
                    <input
                      type="text"
                      value={newCustomerData.firstName}
                      onChange={(e) => handleNewCustomerChange('firstName', e.target.value)}
                      className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#03034b]">Last Name</label>
                    <input
                      type="text"
                      value={newCustomerData.lastName}
                      onChange={(e) => handleNewCustomerChange('lastName', e.target.value)}
                      className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#03034b]">Affiliation/School</label>
                  <input
                    type="text"
                    value={newCustomerData.affiliation}
                    onChange={(e) => handleNewCustomerChange('affiliation', e.target.value)}
                    className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                    placeholder="Enter school or affiliation"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#03034b]">Email</label>
                    <input
                      type="email"
                      value={newCustomerData.email}
                      onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                      className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#03034b]">Contact Number</label>
                    <input
                      type="text"
                      value={newCustomerData.contactNumber}
                      onChange={(e) => handleNewCustomerChange('contactNumber', e.target.value)}
                      className="w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-[#e8e4d5] to-[#f0ebe1] p-4 rounded-xl border border-[#1827a0] border-opacity-30 shadow-inner">
            <div className="font-medium text-[#03034b] text-center mb-1">Amount to Pay:</div>
            {discount > 0 && (
              <div className="flex items-center justify-center mb-1">
                <div className="text-sm text-red-600 line-through">₱{amount.toFixed(2)}</div>
                <div className="mx-2 text-[#03034b]">→</div>
              </div>
            )}
            <div className="text-2xl font-bold text-[#03034b] text-center">₱{finalAmount.toFixed(2)}</div>
            
            {/* Promo code input */}
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2 text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                />
                <button 
                  onClick={handlePromoCodeApply}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0c5ee5] to-[#0a4ec0] text-white text-sm hover:from-[#0a4ec0] hover:to-[#083d8b] border border-[#03034b] shadow-md transition-all duration-200"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <div className="text-sm text-green-600 mt-1 text-center">Discount: -₱{discount.toFixed(2)}</div>
              )}
            </div>
            
            {/* Payment section */}
            {!isPaid && (
              <div className="mt-3">
                <div className="text-sm font-medium text-[#03034b] text-center">Payment:</div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={handlePaymentChange}
                    placeholder={`Received (₱${paymentAmount.toFixed(2)})`}
                    className="flex-1 border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2 text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200"
                  />
                  <button 
                    onClick={handlePaymentSubmit}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white text-sm hover:from-green-700 hover:to-green-800 border border-green-800 shadow-md transition-all duration-200"
                  >
                    Confirm
                  </button>
                </div>
                {changeAmount > 0 && (
                  <div className="text-base font-bold text-green-700 mt-2 text-center bg-green-100 py-2 rounded-lg border-2 border-green-300">
                    Change: ₱{changeAmount.toFixed(2)}
                  </div>
                )}
              </div>
            )}
            
            {/* Paid indicator */}
            {isPaid && (
              <div className="mt-2 text-green-600 font-bold text-center text-lg">PAID</div>
            )}
            
            {/* Walk-in specific controls */}
            {passType === 'walk-in' && (
              <div className="mt-3">
                {isWalkInActive ? (
                  <div className="space-y-2">
                    <div className="text-sm text-[#03034b] text-center">
                      Checked in at: {checkInTime ? checkInTime.toLocaleTimeString() : 'N/A'}
                    </div>
                    <div className="text-sm text-[#03034b] text-center">
                      Hours stayed: {hoursStayed > 0 ? hoursStayed : 'Calculating...'}
                    </div>
                    <button 
                      onClick={handleCheckoutWalkIn}
                      className="w-full mt-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 border border-red-800 shadow-md transition-all duration-200"
                    >
                      Checkout Walk-in
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleStartWalkIn}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 border border-green-800 shadow-md transition-all duration-200"
                  >
                    Start Walk-in Session
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#e8e4d5] to-[#d4cec1] text-[#03034b] hover:from-[#d4cec1] hover:to-[#c5bfb7] border border-[#1827a0] border-opacity-50 shadow-sm transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckIn}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] text-white hover:from-[#0c5ee5] hover:to-[#0a4ec0] border border-[#03034b] border-opacity-50 shadow-md transition-all duration-200 font-medium"
            >
              {passType === 'walk-in' && isWalkInActive ? 'Process Checkout' : 'Check In Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInCustomerModal;