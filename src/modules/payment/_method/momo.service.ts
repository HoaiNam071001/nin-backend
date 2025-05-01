import { Injectable } from '@nestjs/common';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import axios from 'axios';
import { PaymentMethod } from '../payment.dto';

@Injectable()
export class MoMoPaymentService {
  private readonly endpoint =
    'https://test-payment.momo.vn/v2/gateway/api/create';
  private readonly partnerCode = PaymentMethod.MOMO;
  private readonly accessKey = 'F8BBA842ECF85';
  private readonly secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  private readonly redirectUrl = 'http://localhost:3000/en/course/registered';
  private readonly ipnUrl =
    'https://fc68-116-111-185-4.ngrok-free.app/payments/notify';

  async createPayment(orderId: string, orderInfo: string, amount: number) {
    const requestId = orderId;
    const requestType = 'payWithMethod';
    const extraData = '';
    const orderGroupId = '';
    const autoCapture = true;
    const lang = 'vi';

    // Tạo rawSignature
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    // Tạo chữ ký HMAC-SHA256 bằng @noble/hashes
    const encoder = new TextEncoder();
    const secretKeyBytes = encoder.encode(this.secretKey);
    const messageBytes = encoder.encode(rawSignature);
    const signatureBytes = hmac(sha256, secretKeyBytes, messageBytes);
    const signature = Buffer.from(signatureBytes).toString('hex');
    // Tạo request body
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature,
    };

    try {
      // Gửi yêu cầu bằng axios
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      console.log('Response Status:', response.status);
      console.log('Response Body:', data);

      if (response.status === 200 && data.resultCode === 0) {
        return { payUrl: data.payUrl, orderId, requestId };
      } else {
        throw new Error(
          `MoMo payment error: ${data.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      console.error('MoMo payment error:', error);
      throw new Error(`Failed to create MoMo payment: ${error.message}`);
    }
  }
}
