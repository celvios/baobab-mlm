const pool = require('../config/database');

const REPURCHASE_PRODUCTS = {
  powders: { initial: 3000, repurchase: 6000 },
  lipgloss: { initial: 6000, repurchase: 12000 },
  soap: { initial: 4000, repurchase: 6000 },
  facial_oil: { initial: 4000, repurchase: 6000 }
};

class RepurchaseService {
  async checkRepurchaseRequired(userId, stage) {
    const result = await pool.query(
      'SELECT required_amount FROM repurchase_requirements WHERE stage = $1',
      [stage]
    );
    
    if (result.rows.length === 0) return { required: false, amount: 0 };
    
    const requiredAmount = result.rows[0].required_amount;
    
    // Check if user has made repurchase for this stage
    const repurchaseCheck = await pool.query(
      'SELECT * FROM repurchase_orders WHERE user_id = $1 AND stage = $2 AND status = $3',
      [userId, stage, 'completed']
    );
    
    return {
      required: repurchaseCheck.rows.length === 0,
      amount: requiredAmount
    };
  }

  async createRepurchaseOrder(userId, stage, products) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get required amount for stage
      const reqResult = await client.query(
        'SELECT required_amount FROM repurchase_requirements WHERE stage = $1',
        [stage]
      );
      
      const requiredAmount = reqResult.rows[0].required_amount;
      
      // Create repurchase order
      const orderResult = await client.query(`
        INSERT INTO repurchase_orders (user_id, stage, amount, products, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING *
      `, [userId, stage, requiredAmount, JSON.stringify(products)]);
      
      await client.query('COMMIT');
      return orderResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async processStageCompletion(userId, stage, grossPayout) {
    const repurchaseCheck = await this.checkRepurchaseRequired(userId, stage);
    
    if (repurchaseCheck.required) {
      // Auto-deduct repurchase amount
      const netPayout = grossPayout - repurchaseCheck.amount;
      
      // Create auto-repurchase order
      const defaultProducts = this.getDefaultRepurchaseProducts(repurchaseCheck.amount);
      await this.createRepurchaseOrder(userId, stage, defaultProducts);
      
      return {
        grossPayout,
        repurchaseDeduction: repurchaseCheck.amount,
        netPayout: Math.max(0, netPayout),
        repurchaseRequired: true
      };
    }
    
    return {
      grossPayout,
      repurchaseDeduction: 0,
      netPayout: grossPayout,
      repurchaseRequired: false
    };
  }

  getDefaultRepurchaseProducts(targetAmount) {
    // Logic to select products that sum to target amount
    const products = [];
    let remaining = targetAmount;
    
    if (remaining >= REPURCHASE_PRODUCTS.lipgloss.repurchase) {
      products.push({ name: 'Lipgloss', price: REPURCHASE_PRODUCTS.lipgloss.repurchase });
      remaining -= REPURCHASE_PRODUCTS.lipgloss.repurchase;
    }
    
    while (remaining >= REPURCHASE_PRODUCTS.soap.repurchase) {
      products.push({ name: 'Soap', price: REPURCHASE_PRODUCTS.soap.repurchase });
      remaining -= REPURCHASE_PRODUCTS.soap.repurchase;
    }
    
    return products;
  }
}

module.exports = new RepurchaseService();