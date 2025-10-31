 <?php
 include 'db_config.php';
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
function fetchProductsFooter($conn) {
    $sql = "
        SELECT 
            id, 
            name
        FROM 
            product
        ORDER BY 
            RAND()
        LIMIT 5
    ";
    $result = $conn->query($sql);

    if ($result === false) {
        die("SQL error: " . $conn->error);
    }

    if ($result->num_rows > 0) {
        // Fetch all products
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        return $products;
    } else {
        return [];
    }
}

$productsFooter = fetchProductsFooter($conn);

 ?>
 <div class="container-fluid bg-white footer">
        <div class="container py-5">
            <div class="row g-5">
                <div class="col-md-6 col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                    <a href="index.html" class="d-inline-block mb-3">
                        <h1 class="text-primary">BAOBAB WORLDWIDE</h1>
                    </a>
                       <p class="mb-0">At Baobab Export Solutions Limited, we are an innovative start-up company with a clear mission: to enrich lives with the remarkable baobab fruit. Our passion for this unique fruit drives us to harness its incredible potential and bring its numerous benefits to people around the world.</p>
                </div>
                <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                    <h5 class="mb-4">Get In Touch</h5>
                    <p><i class="fa fa-map-marker-alt me-3"></i>50 IPENT 2 Estate,
Lokogoma 
FCT Abuja, Nigeria.</p>
                    <p><i class="fa fa-phone-alt me-3"></i>+234 8165650770, +234 8181689183</p>
                    <p><i class="fa fa-envelope me-3"></i>info@baobabworldwide.com</p>
                    <div class="d-flex pt-2">
                        <a class="btn btn-square btn-outline-primary me-1" href="https://twitter.com/lentocofficial"><i class="fab fa-twitter"></i></a>
                        <a class="btn btn-square btn-outline-primary me-1" href="https://www.facebook.com/lentocofficial"><i class="fab fa-facebook-f"></i></a>
                        <a class="btn btn-square btn-outline-primary me-1" href="https://www.instagram.com/lentocofficial"><i class="fab fa-instagram"></i></a>
                       
                    </div>
                </div>
                <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                    <h5 class="mb-4">Our Products</h5>
                     <?php
        foreach ($productsFooter as $products) {
            ?>
            
               <a href="details.php?id=<?php echo htmlspecialchars($products['id']); ?>" class="btn btn-link"><?php echo htmlspecialchars($products['name']); ?></a>
                     <?php
        }
        ?>
                </div>
               
            </div>
        </div>
        <div class="container wow fadeIn" data-wow-delay="0.1s">
            <div class="copyright">
                <div class="row">
                    <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                        &copy; <a class="border-bottom" href="#">BaobabWorldwide</a> <span style="
    display: none;
">All Right Reserved.

                      
                        Designed By <a class="border-bottom" href="https://htmlcodex.com" >HTML Codex</a>

                        </span>
                    </div>
                    <div class="col-md-6 text-center text-md-end">
                        <div class="footer-menu">
                            <a href="">Home</a>
                            <a href="">Cookies</a>
                            <a href="">Help</a>
                            <a href="">FAQs</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>