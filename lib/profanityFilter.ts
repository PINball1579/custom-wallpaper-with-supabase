// Add explicit words here in Thai and English
const PROFANITY_LIST = [
  // English profanity
  'fuck', 'shit', 'ass', 'damn', 'bitch', 'bastard', 'dick', 'pussy', 'cock',
  // Thai profanity (examples - add more as needed)
  'ควย', 'หี', 'เหี้ย', 'ไอ้สัส', 'เชี่ย', 'แม่ง', 'สัส', 'เย็ด', 'เลว',
  // Add more words as needed
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  return PROFANITY_LIST.some(word => {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    return pattern.test(lowerText) || lowerText.includes(word.toLowerCase());
  });
}

export function validateCustomText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }

  if (text.length > 10) {
    return { valid: false, error: 'Text cannot exceed 10 characters' };
  }

  if (containsProfanity(text)) {
    return { valid: false, error: 'Text contains inappropriate words' };
  }

  return { valid: true };
}