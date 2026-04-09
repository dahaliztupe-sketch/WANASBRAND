import { z } from 'zod';

export const createConciergeRequest = async (
  formData: {
    fullName: string;
    phone: string;
    contactMethod: 'whatsapp' | 'phone';
    vibe: 'styling' | 'sizing';
    consent: true;
  }
): Promise<{ success: boolean; id: string }> => {
  try {
    const response = await fetch('/api/concierge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit concierge request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting concierge request:', error);
    throw error;
  }
};
