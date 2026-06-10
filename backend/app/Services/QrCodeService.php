<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Common\Version;
use chillerlan\QRCode\Output\QRGdImagePNG;

class QrCodeService
{
    /**
     * Generate a JWT token for a member.
     */
    public static function generateToken($memberId)
    {
        $payload = [
            'iss' => config('app.url'),
            'iat' => time(),
            'exp' => time() + (365 * 24 * 60 * 60), // Valid for 1 year
            'member_id' => $memberId,
        ];

        return JWT::encode($payload, config('app.key'), 'HS256');
    }

    /**
     * Decode and validate a JWT token.
     */
    public static function validateToken($token)
    {
        try {
            $decoded = JWT::decode($token, new Key(config('app.key'), 'HS256'));
            return $decoded->member_id;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate QR code image (base64) from token.
     */
    public static function generateQrImage($token)
    {
        $options = new QROptions([
            'version'         => Version::AUTO,
            'outputInterface' => QRGdImagePNG::class,
            'eccLevel'        => EccLevel::L,
            'scale'           => 5,
            'outputBase64'    => true,
        ]);

        return (new QRCode($options))->render($token);
    }
}
