"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { LeadFormPopup } from '@/components/LeadFormPopup';
import { FaWhatsapp } from 'react-icons/fa';
import {
  openStayWhatsAppBooking,
  stayWhatsAppButtonClassName,
} from '@/components/StayCardActions';

interface BottomBookingTabProps {
  selectedRooms?: any[];
  selectedPackages?: any[];
  title: string;
  price: string;
  itemType?: 'stay' | 'activity' | 'trip';
  destination?: string;
}

export function BottomBookingTab({ selectedRooms = [], selectedPackages = [], title, price, itemType, destination }: BottomBookingTabProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const prevSelectedItemsRef = useRef<any[]>([]);
  const [shouldShake, setShouldShake] = useState(false);

  // Use selectedRooms or selectedPackages based on what's available
  const selectedItems = selectedRooms.length > 0 ? selectedRooms : selectedPackages;
  const itemLabel = itemType === 'trip' ? 'Dish' : itemType === 'activity' ? 'Item' : 'Room';

  useEffect(() => {
    // Check if form has been filled
    const checkFormFilled = () => {
      const filled = localStorage.getItem('leadFormFilled') === 'true';
      setFormFilled(filled);
    };
    
    checkFormFilled();
    
    // Listen for storage changes (when form is submitted)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'leadFormFilled') {
        checkFormFilled();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage is updated in same window
    const interval = setInterval(checkFormFilled, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Trigger shake animation when items are selected
  useEffect(() => {
    if (selectedItems.length > prevSelectedItemsRef.current.length) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);
    }
    prevSelectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  // Always show the tab, even if no items are selected

  const handleMobileAction = () => {
    if (itemType === 'stay') {
      openStayWhatsAppBooking(title, destination || '');
      return;
    }
    setIsPopupOpen(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {/* Mobile Version */}
        <motion.div
          key="mobile-booking-tab"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-2xl"
        >
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {itemType === 'stay' ? (
                <motion.button
                  animate={shouldShake ? {
                    x: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.02, 1],
                  } : {}}
                  transition={{ duration: 0.5 }}
                  onClick={handleMobileAction}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-sm sm:text-base ${stayWhatsAppButtonClassName}`}
                >
                  <FaWhatsapp className="w-6 h-6 flex-shrink-0" />
                  <span>Book through WhatsApp</span>
                </motion.button>
              ) : (
                <>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Grab your special deal</p>
                {selectedItems.length > 0 && (
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedItems.length} {selectedItems.length === 1 ? itemLabel : `${itemLabel}s`} Selected
                  </p>
                )}
              </div>
              <motion.button
                animate={shouldShake ? {
                  x: [0, -10, 10, -10, 10, 0],
                  rotate: [0, -5, 5, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => setIsPopupOpen(true)}
                className="bg-gradient-to-r from-[#E51A4B] to-[#c91742] hover:from-[#c91742] hover:to-[#E51A4B] text-white font-semibold py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-w-[140px] justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>{formFilled ? 'Connect With Us' : 'Book With Us'}</span>
              </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Desktop Version */}
        <motion.div
          key="desktop-booking-tab"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl justify-center"
        >
          <div className="max-w-4xl w-full px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-medium">Grab your special deal</p>
                {selectedItems.length > 0 && (
                  <>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedItems.length} {selectedItems.length === 1 ? itemLabel : `${itemLabel}s`} Selected
                    </p>
                    <div className="text-xs text-gray-600 mt-1">
                      {selectedItems.map((item, idx) => (
                        <span key={`${item.id || item.name || idx}-${idx}`}>
                          {item.name}
                          {idx < selectedItems.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <motion.button
                animate={shouldShake ? {
                  x: [0, -10, 10, -10, 10, 0],
                  rotate: [0, -5, 5, -5, 5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => setIsPopupOpen(true)}
                className="bg-gradient-to-r from-[#E51A4B] via-[#E51A4B] to-[#c91742] hover:from-[#c91742] hover:via-[#E51A4B] hover:to-[#E51A4B] text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center group"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-base">Connect With Us</span>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Lead Form Popup */}
      <LeadFormPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          // Check if form was filled after closing
          const filled = localStorage.getItem('leadFormFilled') === 'true';
          setFormFilled(filled);
        }}
        onSkip={() => {
          setIsPopupOpen(false);
          // Check if form was filled after closing
          const filled = localStorage.getItem('leadFormFilled') === 'true';
          setFormFilled(filled);
        }}
        itemName={title}
        itemType={itemType}
        itemPrice={price}
        itemDestination={destination}
      />
    </>
  );
}
