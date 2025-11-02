-- Exchange rates table for admin-managed currency rates
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    rate DECIMAL(10, 4) NOT NULL,
    updated_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default exchange rate (NGN to USD)
INSERT INTO exchange_rates (currency_code, rate) 
VALUES ('NGN', 1500.00)
ON CONFLICT (currency_code) DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON exchange_rates(currency_code);
