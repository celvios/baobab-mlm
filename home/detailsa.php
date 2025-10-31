<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database configuration
include 'db_config.php';

// Check if the connection to the database is successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get product ID from the query string
$product_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Function to fetch the product details and all associated images
function fetchProductDetails($conn, $product_id) {
    // Fetch the product details
    $product_sql = "
        SELECT 
            p.id, 
            p.name, 
            p.description 
        FROM 
            product p 
        WHERE 
            p.id = ?
    ";
    $stmt = $conn->prepare($product_sql);
    $stmt->bind_param('i', $product_id);
    $stmt->execute();
    $stmt->bind_result($id, $name, $description);
    $stmt->fetch();
    $stmt->close();

    if ($id) {
        $product = [
            'id' => $id,
            'name' => $name,
            'description' => $description,
            'images' => []
        ];

        // Fetch all images associated with the product
        $images_sql = "
            SELECT 
                image_url 
            FROM 
                productimages 
            WHERE 
                pid = ?
        ";
        $stmt = $conn->prepare($images_sql);
        $stmt->bind_param('i', $product_id);
        $stmt->execute();
        $stmt->bind_result($image_url);

        while ($stmt->fetch()) {
            $product['images'][] = $image_url;
        }
        $stmt->close();

        return $product;
    } else {
        return null;
    }
}

// Fetch the product details
$product = fetchProductDetails($conn, $product_id);

if (!$product) {
    echo "Product not found.";
    exit;
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($product['name']); ?> - Product Details</title>
    <link rel="stylesheet" href="path/to/your/styles.css">
</head>
<body>
    <div class="container-fluid py-5">
        <div class="container">
            <h1 class="text-primary mb-3"><?php echo htmlspecialchars($product['name']); ?></h1>
            <p><?php echo ($product['description']); ?></p>

            <div class="row g-4">
                <?php
                foreach ($product['images'] as $image_url) {
                    $img_url = 'productimage/' . htmlspecialchars($image_url);
                    ?>
                    <div class="col-md-6 col-lg-4">
                        <img class="img-fluid mb-4" src="<?php echo $img_url; ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
                    </div>
                    <?php
                }
                ?>
            </div>
        </div>
    </div>
</body>
</html>

<?php
// Close the database connection
$conn->close();
?>
