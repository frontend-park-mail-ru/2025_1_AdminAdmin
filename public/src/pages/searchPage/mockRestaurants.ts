import { Product, SearchRestaurant } from '@myTypes/restaurantTypes';

function generateMockProduct(id: number): Product {
  return {
    id: `prod-${id}`,
    name: `Продукт ${id}`,
    price: Math.floor(Math.random() * 500 + 100),
    image_url: `https://placehold.co/100x100?text=Prod+${id}`,
    weight: Math.floor(Math.random() * 500 + 100),
  };
}

function generateMockRestaurant(id: number): SearchRestaurant {
  const products = Array.from({ length: 5 }, (_, i) => generateMockProduct(id * 10 + i));

  return {
    id: `rest-${id}`,
    name: `Ресторан ${id}`,
    description: `Описание ресторана ${id}`,
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // от 3.0 до 5.0
    products,
  };
}

/**
 * Мок-асинхронная функция, имитирующая загрузку ресторанов.
 * @param offset - с какого ресторана начинать
 * @param limit - сколько ресторанов вернуть
 * @param query
 */
export async function mockSearchRestaurants(
  offset = 0,
  limit = 16,
  query: string,
): Promise<SearchRestaurant[]> {
  await new Promise((res) => setTimeout(res, 300));

  query.trim();
  return Array.from({ length: limit }, (_, i) => generateMockRestaurant(offset + i));
}
