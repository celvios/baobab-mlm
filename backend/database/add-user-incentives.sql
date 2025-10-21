-- Create user_incentives table
CREATE TABLE IF NOT EXISTS user_incentives (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  incentives JSONB NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_incentives_user_id ON user_incentives(user_id);
CREATE INDEX IF NOT EXISTS idx_user_incentives_stage ON user_incentives(stage);
