<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Baobab Worldwide || Our Products</title>
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
            <h1 class="display-4 text-white mb-3 animated slideInDown">Products</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb justify-content-center mb-0 animated slideInDown">
                    <li class="breadcrumb-item"><a class="text-white" href="#">Home</a></li>
                   
                    <li class="breadcrumb-item text-white active" aria-current="page">Our Products</li>
                </ol>
            </nav>
        </div>
    </div>
    <!-- Hero End -->


    <!-- Product Start -->
    <div class="container-fluid py-5">
        <div class="container">
            <div class="mx-auto text-center wow fadeIn" data-wow-delay="0.1s" style="max-width: 600px;">
                <h1 class="text-primary mb-3"><span class="fw-light text-dark">Our Natural</span> Baobab Products</h1>
                <p class="mb-5"></p>
            </div>
            <div class="row g-4">
                <?php
// Enable error reporting for debugging
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
//error_reporting(E_ALL);

// Include database configuration
include 'db_config.php';

// Check if the connection to the database is successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

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

    if ($result === false) {
        die("SQL error: " . $conn->error);
    }

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

?>
                 <?php
                foreach ($products as $product) {
                    // Ensure the product image is correctly located in the `productimage` folder
                    $img_url = 'productimage/' . htmlspecialchars($product['image_url']);
                    ?>
                    <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.1s">
                        <div class="product-item text-center border h-100 p-4">
                            <img class="img-fluid mb-4" src="<?php echo $img_url; ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
                            <a href="" class="h6 d-inline-block mb-2"><?php echo htmlspecialchars($product['name']); ?></a>
                            <p></p>
                            <a class="btn btn-primary py-2 px-4" href="details.php?id=<?php echo htmlspecialchars($product['id']); ?>">View Product</a>

                        </div>
                    </div>
                    <?php
                }
                ?>
               
            </div>
        </div>
    </div>
    <!-- Product End -->


  

    <!-- Footer Start -->
   <?php 
   
   include "footer.php";
   ?>
    <!-- Footer End -->


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