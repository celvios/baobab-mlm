<?php
// Include database configuration
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include 'db_config.php';
echo 'here';
//exit;
// Function to fetch products with their cover images
function fetchProducts($conn) {
    $sql = "
        SELECT 
            p.id, 
            p.name, 
            p.description, 
            pi.image_url 
        FROM 
            product p 
        LEFT JOIN 
            productimages pi 
        ON 
            p.id = pi.pid 
        WHERE 
            pi.coverimage = 1
    ";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Fetch all products with cover images
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        return $products;
    } else {
        return [];
    }
}

// Fetch the products
$products = fetchProducts($conn);

// Display the products with cover images
foreach ($products as $product) {
    echo "<div style='margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;'>";
    echo "<h2>" . htmlspecialchars($product['name']) . "</h2>";
    echo "<p>" . htmlspecialchars($product['description']) . "</p>";
    echo "<img src='productimage/" . htmlspecialchars($product['image_url']) . "' alt='" . htmlspecialchars($product['name']) . "' style='max-width: 200px;'>";
    echo "</div>";
}

// Close the database connection
$conn->close();
?>
