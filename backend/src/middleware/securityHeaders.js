/**
 * Security headers and compression middleware
 * OWASP-compliant security headers
 * Enterprise-grade security pattern
 */

const compression = require("compression");

// Note: Requires 'helmet' and 'compression' packages
// Add to package.json:
// "helmet": "^7.1.0"
// "compression": "^1.7.4"

let helmet;
try {
  helmet = require("helmet");
} catch (error) {
  console.warn("helmet not installed. Install with: npm install helmet");
  helmet = null;
}

/**
 * Setup all security middleware
 * Must be called early in Express app initialization
 *
 * @param {Express.Application} app - Express application instance
 */
function setupSecurityMiddleware(app) {
  // 1. Response compression (reduces payload size)
  app.use(compression({ threshold: 1024 }));

  if (!helmet) {
    console.warn("Security headers disabled - helmet not installed");
    return;
  }

  // 2. Helmet - general security headers
  app.use(helmet());

  // 3. Content Security Policy (CSP)
  // Prevents inline script execution and restricts resource loading
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // Only allow scripts from same origin
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow styles from self
        imgSrc: ["'self'", "data:", "https:"], // Allow images from self and HTTPS
        connectSrc: ["'self'"], // Only allow API calls to same origin
        fontSrc: ["'self'"],
        objectSrc: ["'none'"], // Disable plugins
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"], // Disable framing
      },
      reportOnly: false,
    }),
  );

  // 4. X-Content-Type-Options: nosniff
  // Prevents browser MIME type sniffing
  app.use(helmet.noSniff());

  // 5. X-Frame-Options: DENY
  // Prevents clickjacking attacks
  app.use(helmet.frameguard({ action: "deny" }));

  // 6. X-XSS-Protection
  // Legacy XSS protection header (browsers respect it)
  app.use(helmet.xssFilter());

  // 7. Remove X-Powered-By header
  // Avoid revealing stack info
  app.use(helmet.hidePoweredBy());

  // 8. Strict-Transport-Security (HSTS)
  // Force HTTPS connections
  app.use(
    helmet.strictTransportSecurity({
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true, // Include in HSTS preload list
    }),
  );

  // 9. Referrer-Policy
  // Control what referrer info is sent
  app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));

  // 10. Permissions-Policy (formerly Feature-Policy)
  // Control browser features
  app.use(
    helmet.permissionsPolicy({
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'self'"], // Allow geolocation for this domain
        accelerometer: ["'none'"],
        magnetometer: ["'none'"],
        gyroscope: ["'none'"],
      },
    }),
  );

  console.log("✅ Security middleware initialized");
}

module.exports = { setupSecurityMiddleware };
