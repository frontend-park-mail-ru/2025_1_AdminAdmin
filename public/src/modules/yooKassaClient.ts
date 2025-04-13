const SHOP_ID = '1070220';
const SECRET_KEY = 'test_EUU_Ee5GJ_F675-xg3fMUPhJDTUOAZM_Uf6rwiZN69U';

const API_URL = 'https://api.yookassa.ru/v3/payments';

function generateIdempotenceKey(): string {
  return crypto.randomUUID();
}

export async function createPayment(
  amount: number,
  description: string,
): Promise<{
  confirmationUrl: string;
  paymentId: string;
}> {
  const payload = {
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: 'https://doordashers.ru',
    },
    description,
  };

  const credentials = btoa(`${SHOP_ID}:${SECRET_KEY}`);
  const idempotenceKey = generateIdempotenceKey();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.description || 'Ошибка при создании платежа');
  }

  const data = await response.json();
  return {
    confirmationUrl: `${data.confirmation.confirmation_url}&payment_id=${data.id}`,
    paymentId: data.id,
  };
}
