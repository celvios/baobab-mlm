-- Convert product prices from Naira to USD
-- Exchange rate: 1 USD = 1500 NGN

UPDATE products 
SET price = ROUND(price / 1500, 2)
WHERE price > 100;
