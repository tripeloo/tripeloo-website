import whatsappNumbers from '@/config/whatsapp-numbers.json';

const STAY_CARD_NUMBERS =
  (whatsappNumbers as { stayCardNumbers?: string[] }).stayCardNumbers?.length
    ? (whatsappNumbers as { stayCardNumbers: string[] }).stayCardNumbers
    : ['+9190379179463', '+918086538856', '+9190379179467'];

/**
 * Gets a random WhatsApp number for stay card booking buttons.
 * @returns A randomly selected number from the stay card pool
 */
export function getRandomStayCardWhatsAppNumber(): string {
  if (STAY_CARD_NUMBERS.length === 0) {
    return '+9190379179463';
  }
  const index = Math.floor(Math.random() * STAY_CARD_NUMBERS.length);
  return STAY_CARD_NUMBERS[index];
}

/**
 * Gets the next WhatsApp number using round-robin logic
 * Uses localStorage to track the current index
 * @returns The next WhatsApp number in the round-robin sequence
 */
export function getNextWhatsAppNumber(): string {
  if (typeof window === 'undefined') {
    // Server-side: return first number as fallback
    return whatsappNumbers.numbers[0] || '+9190379179463';
  }

  const numbers = whatsappNumbers.numbers;
  if (numbers.length === 0) {
    return '+9190379179463'; // Fallback
  }

  // Get current index from localStorage, default to 0
  const currentIndexKey = 'whatsapp_round_robin_index';
  const currentIndex = parseInt(localStorage.getItem(currentIndexKey) || '0', 10);
  
  // Get the number at current index
  const selectedNumber = numbers[currentIndex % numbers.length];
  
  // Increment and save for next time
  const nextIndex = (currentIndex + 1) % numbers.length;
  localStorage.setItem(currentIndexKey, nextIndex.toString());
  
  return selectedNumber;
}

/**
 * Formats a phone number for WhatsApp URL (removes + and spaces)
 * @param phoneNumber Phone number in any format
 * @returns Formatted number for WhatsApp URL
 */
export function formatWhatsAppNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s\+-]/g, '');
}

/**
 * Gets the primary WhatsApp number (for general inquiries, not bookings)
 * @returns The primary WhatsApp number
 */
export function getPrimaryWhatsAppNumber(): string {
  return '+9190379179463';
}

