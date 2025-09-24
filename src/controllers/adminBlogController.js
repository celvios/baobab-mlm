const pool = require('../../../backend/src/config/database');

const getBlogPosts = async (req, res) => {
  try {
    // Create blog_posts table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        featured_image TEXT,
        author_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');

    res.json({
      posts: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createBlogPost = async (req, res) => {
  try {
    const { title, content, category, status = 'draft', featured_image } = req.body;

    // Create blog_posts table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        featured_image TEXT,
        author_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(
      'INSERT INTO blog_posts (title, content, category, status, featured_image, author_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, content, category, status, featured_image, req.admin?.id || 1]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, status, featured_image } = req.body;

    const result = await pool.query(
      'UPDATE blog_posts SET title = $1, content = $2, excerpt = $3, category = $4, status = $5, featured_image = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, content, excerpt, category, status, featured_image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_blog_post', `Updated blog post: ${title}`]
    );

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'delete_blog_post', `Deleted blog post: ${result.rows[0].title}`]
    );

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const publishBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE blog_posts SET status = $1, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['published', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'publish_blog_post', `Published blog post: ${result.rows[0].title}`]
    );

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Publish blog post error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getBlogStats = async (req, res) => {
  try {
    const [total, published, drafts, views] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM blog_posts'),
      pool.query('SELECT COUNT(*) as count FROM blog_posts WHERE status = $1', ['published']),
      pool.query('SELECT COUNT(*) as count FROM blog_posts WHERE status = $1', ['draft']),
      pool.query('SELECT COALESCE(SUM(view_count), 0) as total FROM blog_posts')
    ]);

    res.json({
      totalPosts: parseInt(total.rows[0].count),
      publishedPosts: parseInt(published.rows[0].count),
      draftPosts: parseInt(drafts.rows[0].count),
      totalViews: parseInt(views.rows[0].total)
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, publishBlogPost, getBlogStats };