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
    <meta charset="utf-8">
    <title><?php echo htmlspecialchars($product['name']); ?> - Product Detail</title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <meta content="" name="keywords">
    <meta content="" name="description">

    <!-- Favicon -->
    <link href="img/favicon.ico" rel="icon">

    <!-- Google Web Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500&family=Poppins:wght@200;600;700&display=swap"
        rel="stylesheet">

    <!-- Icon Font Stylesheet -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet">

    <!-- Libraries Stylesheet -->
    <link href="lib/animate/animate.min.css" rel="stylesheet">
    <link href="lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet">

    <!-- Customized Bootstrap Stylesheet -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- Template Stylesheet -->
    <link href="css/style.css" rel="stylesheet">
    <style>
    ul.benefits {
        list-style-type: none; /* Removes default list styling */
        padding: 0; /* Removes default padding */
    }
    ul.benefits li {
        text-align: justify; /* Justifies the text */
        margin-bottom: 10px; /* Adds spacing between items */
    }
     .social-icon {
        font-size: 50px;
         vertical-align: middle;
    }
    
     .social-text {
    margin-left: 5px; /* Adjust as needed */
        display: inline-block;
        vertical-align: middle;
    }
</style>
</head>

<body>
    <!-- Spinner Start -->
    <div id="spinner"
        class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    <!-- Spinner End -->


    <!-- Navbar Start -->
     <?php


include "nav.php"
   ?>
    <!-- Navbar End -->


    <!-- Hero Start -->
    <div class="container-fluid bg-primary hero-header mb-5">
        <div class="container text-center">
            <h1 class="display-4 text-white mb-3 animated slideInDown"><?php echo htmlspecialchars($product['name']); ?></h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb justify-content-center mb-0 animated slideInDown">
                    <li class="breadcrumb-item"><a class="text-white" href="index.php">Home</a></li>
                   
                    <li class="breadcrumb-item text-white active" aria-current="page">product </li>
                </ol>
            </nav>
        </div>
    </div>
    <!-- Hero End -->


  


    <!-- Contact Start -->
  <div class="container-fluid py-5">
        <div class="container">
            
          
            
            <div class="row g-5 align-items-cenater mb-4">
                
                
                 <?php
                foreach ($product['images'] as $image_url) {
                    $img_url = 'productimage/' . htmlspecialchars($image_url);
                    ?>
                    <div class="col-md-6 col-lg-6 wow fadeIn">
                        <img class="img-fluid animated pulse infinite mb-4" src="<?php echo $img_url; ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
                    </div>
                    <?php
                }
                ?>
                
               
                <div class="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                    
                    <p class="mb-4"><?php echo ($product['description']); ?>
</p>
               
                 
                </div>
            </div>
            
           
        </div>
    </div>
        

    


    <!-- Footer Start -->
  
    <!-- Footer End -->

 <?php 
   
   include "footer.php";
   ?>
    <!-- Back to Top -->
    <a href="#" class="btn btn-lg btn-primary btn-lg-square back-to-top"><i class="bi bi-arrow-up"></i></a>


    <!-- JavaScript Libraries -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="lib/wow/wow.min.js"></script>
    <script src="lib/easing/easing.min.js"></script>
    <script src="lib/waypoints/waypoints.min.js"></script>
    <script src="lib/owlcarousel/owl.carousel.min.js"></script>

    <!-- Template Javascript -->
    <script src="js/main.js"></script>
</body>

</html>