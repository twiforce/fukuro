<?php
    // Specify path for banner images
    $dir = "static/banners/";
    $path = $dir . $_GET['id'] . '.png';
    header("Location: {$path}");
?>