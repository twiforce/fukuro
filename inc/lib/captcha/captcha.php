<?php
$letters = '1234567890';
 
$caplen = 4;
$width = 180; $height = 30;
$font = 'UbuntuTitling-Bold.ttf';
$fontsize = 22;
 
header('Content-type: image/png');
 
$img = imagecreatetruecolor($width, $height);
imagesavealpha($img, true);
$bg = imagecolorallocatealpha($img, 0, 0, 0, 127);
imagefill($img, 0, 0, $bg);
 
putenv( 'GDFONTPATH=' . realpath('.') );
 
$captcha = '';
for ($i = 0; $i < $caplen; $i++)
{
    $captcha .= $letters[ rand(0, strlen($letters)-1) ];
    $x = ($width - 20) / $caplen * $i + 10;
    $x = rand($x, $x+4);
    $y = $height - ( ($height - $fontsize) / 2 );
    $curcolor = imagecolorallocate( $img, rand(50, 100), rand(50, 100), rand(50, 100) );
    $angle = rand(-25, 25);
    imagettftext($img, $fontsize, $angle, $x, $y, $curcolor, $font, $captcha[$i]);
    imageline($img, rand(0, $width/2), rand(0, $height), rand($width/2, $width), rand(0, $height), $curcolor);
}

session_start();
$_SESSION['captcha'] = $captcha;
 
imagepng($img);
imagedestroy($img);
?>