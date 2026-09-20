import React, { useRef, useEffect } from 'react';

export default function OtpInput({
  value = '',
  onChange,
  disabled = false,
  hasError = false,
  length = 6
}) {
  const inputRefs = useRef([]);

  // Convert string value to array of characters padded to length
  const otpArray = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty box or first box on mount if not disabled
    if (!disabled && inputRefs.current[0]) {
      const firstEmptyIndex = otpArray.findIndex((val) => !val);
      const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex].focus();
      }
    }
  }, []);

  const handleChange = (e, index) => {
    const inputValue = e.target.value;
    // Only accept numeric characters
    const digits = inputValue.replace(/\D/g, '');

    if (!digits) {
      // If cleared manually
      const newOtp = [...otpArray];
      newOtp[index] = '';
      onChange(newOtp.join(''));
      return;
    }

    // Handle single character digit input
    const newDigit = digits[digits.length - 1]; // take the last entered digit
    const newOtp = [...otpArray];
    newOtp[index] = newDigit;
    const combinedValue = newOtp.join('');
    onChange(combinedValue);

    // Auto-advance to next box
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous box if current is already empty
        inputRefs.current[index - 1].focus();
        const newOtp = [...otpArray];
        newOtp[index - 1] = '';
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    const pasteData = e.clipboardData.getData('text');
    const numericData = pasteData.replace(/\D/g, '').slice(0, length);

    if (numericData) {
      onChange(numericData);
      // Focus the next empty box or the last box
      const targetIndex = Math.min(numericData.length, length - 1);
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex].focus();
      }
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-3 w-full font-mono select-none">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otpArray[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`OTP Digit ${index + 1}`}
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border transition shadow-xs focus:outline-none ${
            hasError
              ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400'
              : 'border-slate-300 bg-slate-50 text-slate-950 focus:border-slate-950 focus:ring-2 focus:ring-slate-900/20 focus:bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
        />
      ))}
    </div>
  );
}
