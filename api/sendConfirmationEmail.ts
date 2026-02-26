/**
 * Send order confirmation email after payment success
 */
import axios from "./axiosConfig";

export const sendOrderConfirmationEmail = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`/api/v1/orders/${orderId}/send-confirmation-email`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || ''),
      },
    });
    
    if (response.data?.success) {
      console.log('[sendConfirmationEmail] Order confirmation email sent successfully');
      return { success: true, message: 'Confirmation email sent' };
    } else {
      console.error('[sendConfirmationEmail] Failed to send confirmation email:', response.data);
      return { success: false, message: response.data?.message || 'Failed to send email' };
    }
  } catch (error) {
    console.error('[sendConfirmationEmail] Error sending confirmation email:', error);
    return { success: false, message: 'Error sending confirmation email' };
  }
};
