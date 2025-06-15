/**
 * YAP Landing Page Mock Server
 * 
 * Dedicated mock server for testing YAP-landing secure waitlist registration features.
 * This server implements the specific endpoints needed for both simple waitlist signup
 * and secure wallet creation with waitlist functionality.
 * 
 * Run with: node mock-server-landing.js
 * Server will be available at http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:8100'], // Allow both YAP-frontend and YAP-landing
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Mock JWT secret - for development only
const JWT_SECRET = 'yap-landing-mock-jwt-secret-dev-only';

// In-memory database for testing
const mockDatabase = {
  waitlistUsers: new Map(), // Simple waitlist entries
  secureWalletUsers: new Map(), // Users with wallets
  walletData: new Map(), // Encrypted wallet storage
  refreshTokens: new Set()
};

// Helper functions
function generateUserId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function generateRefreshToken() {
  const token = crypto.randomBytes(32).toString('hex');
  mockDatabase.refreshTokens.add(token);
  return token;
}

// Initialize some test data
function initializeTestData() {
  // Add a pre-existing waitlist user for testing conversion
  const waitlistUserId = generateUserId();
  mockDatabase.waitlistUsers.set('waitlist@example.com', {
    userId: waitlistUserId,
    name: 'Test Waitlist User',
    email: 'waitlist@example.com',
    language_to_learn: 'spanish',
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    hasWallet: false,
    converted: false
  });

  console.log('✅ Test data initialized:');
  console.log('   • Waitlist user: waitlist@example.com (ready for wallet conversion)');
}

initializeTestData();

// =============================================================================
// SIMPLE WAITLIST ENDPOINTS
// =============================================================================

/**
 * POST /api/waitlist/simple
 * Simple waitlist signup without wallet creation
 */
app.post('/api/waitlist/simple', (req, res) => {
  console.log('📝 Simple waitlist signup request:', req.body);
  
  const { name, email, language_to_learn, acceptTerms } = req.body;

  // Validation
  if (!name || !email || !language_to_learn || !acceptTerms) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'Name, email, language preference, and terms acceptance are required'
    });
  }

  // Check if already exists
  if (mockDatabase.waitlistUsers.has(email) || mockDatabase.secureWalletUsers.has(email)) {
    return res.status(409).json({
      success: false,
      error: 'email_exists',
      message: 'Email already registered in waitlist'
    });
  }

  // Create waitlist entry
  const userId = generateUserId();
  const waitlistEntry = {
    userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    language_to_learn,
    joinedAt: new Date().toISOString(),
    hasWallet: false,
    converted: false,
    type: 'simple'
  };

  mockDatabase.waitlistUsers.set(email, waitlistEntry);

  console.log(`✅ Simple waitlist signup successful: ${email}`);

  res.json({
    success: true,
    message: 'Successfully joined the waitlist!',
    data: {
      userId,
      name,
      email,
      language_to_learn,
      estimatedPosition: mockDatabase.waitlistUsers.size,
      joinedAt: waitlistEntry.joinedAt
    }
  });
});

// =============================================================================
// SECURE WALLET + WAITLIST ENDPOINTS
// =============================================================================

/**
 * POST /api/waitlist/secure-wallet
 * Secure wallet creation with waitlist signup
 */
app.post('/api/waitlist/secure-wallet', async (req, res) => {
  console.log('🔐 Secure wallet + waitlist signup request:', req.body);
  
  const { 
    name, 
    email, 
    username,
    language_to_learn, 
    passphrase,
    acceptTerms 
  } = req.body;

  // Validation
  if (!name || !email || !username || !language_to_learn || !passphrase || !acceptTerms) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'All fields are required for secure wallet creation'
    });
  }

  if (passphrase.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'weak_passphrase',
      message: 'Passphrase must be at least 8 characters long'
    });
  }

  // Check if already exists
  if (mockDatabase.waitlistUsers.has(email) || mockDatabase.secureWalletUsers.has(email)) {
    return res.status(409).json({
      success: false,
      error: 'email_exists',
      message: 'Email already registered'
    });
  }

  try {
    // Generate secure wallet data
    const userId = generateUserId();
    const mnemonic = generateMnemonic();
    const { seiWallet, evmWallet } = await generateWalletAddresses(mnemonic);
    
    // Encrypt mnemonic with passphrase (mock encryption)
    const { encryptedMnemonic, salt, nonce } = await encryptMnemonic(mnemonic, passphrase);
    
    // Create user entry
    const userEntry = {
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      language_to_learn,
      joinedAt: new Date().toISOString(),
      hasWallet: true,
      type: 'secure_wallet'
    };

    // Store wallet data separately (encrypted)
    const walletData = {
      userId,
      email: email.toLowerCase().trim(),
      encryptedMnemonic,
      salt,
      nonce,
      seiAddress: seiWallet.address,
      ethAddress: evmWallet.address,
      seiPublicKey: seiWallet.publicKey,
      ethPublicKey: evmWallet.publicKey,
      createdAt: new Date().toISOString()
    };

    // Store in database
    mockDatabase.secureWalletUsers.set(email, userEntry);
    mockDatabase.walletData.set(userId, walletData);

    console.log(`✅ Secure wallet created for: ${email}`);
    console.log(`   • SEI Address: ${seiWallet.address}`);
    console.log(`   • ETH Address: ${evmWallet.address}`);

    // Return wallet information for display
    res.json({
      success: true,
      message: 'Secure wallet created successfully!',
      walletData: {
        userId,
        mnemonic, // Only returned once for user to save
        seiAddress: seiWallet.address,
        ethAddress: evmWallet.address,
        encryptedMnemonic,
        mnemonicSalt: salt,
        mnemonicNonce: nonce
      },
      userData: {
        name,
        email,
        username,
        language_to_learn,
        joinedAt: userEntry.joinedAt,
        estimatedPosition: mockDatabase.secureWalletUsers.size + mockDatabase.waitlistUsers.size
      }
    });

  } catch (error) {
    console.error('❌ Secure wallet creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'wallet_creation_failed',
      message: 'Failed to create secure wallet. Please try again.'
    });
  }
});

// =============================================================================
// EMAIL LOOKUP & STATUS ENDPOINTS
// =============================================================================

/**
 * GET /api/wallet/email/:email
 * Check if email exists and return user status
 */
app.get('/api/wallet/email/:email', (req, res) => {
  const email = req.params.email ? req.params.email.toLowerCase().trim() : '';
  console.log(`🔍 Email lookup for: ${email}`);

  // Check in waitlist users
  const waitlistUser = mockDatabase.waitlistUsers.get(email);
  if (waitlistUser) {
    return res.json({
      email,
      name: waitlistUser.name,
      language_to_learn: waitlistUser.language_to_learn,
      userId: waitlistUser.userId,
      isWaitlistUser: true,
      hasWallet: waitlistUser.hasWallet,
      converted: waitlistUser.converted,
      waitlist_signup_at: waitlistUser.joinedAt,
      status: 'waitlist'
    });
  }

  // Check in secure wallet users
  const secureUser = mockDatabase.secureWalletUsers.get(email);
  if (secureUser) {
    return res.json({
      email,
      name: secureUser.name,
      language_to_learn: secureUser.language_to_learn,
      userId: secureUser.userId,
      isWaitlistUser: false,
      hasWallet: secureUser.hasWallet,
      status: 'registered_with_wallet'
    });
  }

  // Email not found
  res.status(404).json({
    error: 'not_found',
    message: 'Email not found in our records'
  });
});

// =============================================================================
// SECURE WALLET REGISTRATION ENDPOINTS (for SecureWalletRegistrationService)
// =============================================================================

/**
 * POST /auth/secure-signup
 * Secure wallet registration endpoint called by SecureWalletRegistrationService
 */
app.post('/auth/secure-signup', async (req, res) => {
  console.log('🔐 Secure signup request:', req.body);
  
  const {
    email,
    username,
    encryptedStretchedKey,
    encryptionSalt,
    stretchedKeyNonce,
    encryptedMnemonic,
    mnemonicSalt,
    mnemonicNonce,
    seiAddress,
    ethAddress,
    clientMetadata
  } = req.body;

  // Basic validation
  if (!email || !username || !encryptedMnemonic || !seiAddress || !ethAddress) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields for secure registration',
      securityAuditId: generateUserId()
    });
  }

  const emailKey = email.toLowerCase().trim();

  // Check if already exists
  if (mockDatabase.waitlistUsers.has(emailKey) || mockDatabase.secureWalletUsers.has(emailKey)) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
      securityAuditId: generateUserId()
    });
  }

  try {
    // Create new user
    const userId = generateUserId();
    const userEntry = {
      userId,
      email: emailKey,
      username: username.trim(),
      joinedAt: new Date().toISOString(),
      hasWallet: true,
      type: 'secure_wallet'
    };

    const walletData = {
      userId,
      email: emailKey,
      encryptedStretchedKey,
      encryptionSalt,
      stretchedKeyNonce,
      encryptedMnemonic,
      mnemonicSalt,
      mnemonicNonce,
      seiAddress,
      ethAddress,
      createdAt: new Date().toISOString(),
      clientMetadata
    };

    // Store in database
    mockDatabase.secureWalletUsers.set(emailKey, userEntry);
    mockDatabase.walletData.set(userId, walletData);

    console.log(`✅ Secure wallet registration completed: ${email}`);
    console.log(`   • User ID: ${userId}`);
    console.log(`   • SEI Address: ${seiAddress}`);
    console.log(`   • ETH Address: ${ethAddress}`);

    res.json({
      success: true,
      userId,
      message: 'Secure wallet registration successful',
      securityAuditId: generateUserId()
    });

  } catch (error) {
    console.error('❌ Secure wallet registration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register secure wallet. Please try again.',
      securityAuditId: generateUserId()
    });
  }
});

// =============================================================================
// UNIFIED REGISTRATION ENDPOINT (for compatibility)
// =============================================================================

/**
 * POST /api/auth/wallet/signup
 * Unified registration endpoint that handles both new users and waitlist conversion
 */
app.post('/api/auth/wallet/signup', (req, res) => {
  console.log('🔄 Unified registration request:', req.body);
  
  const {
    name,
    email,
    language_to_learn,
    passphrase_hash,
    encrypted_mnemonic,
    salt,
    nonce,
    sei_address,
    sei_public_key,
    eth_address,
    eth_public_key
  } = req.body;

  // Basic validation
  if (!email || !passphrase_hash) {
    return res.status(400).json({
      error: 'missing_fields',
      message: 'Email and passphrase hash are required'
    });
  }

  if (!encrypted_mnemonic || !salt || !nonce || !sei_address || !eth_address) {
    return res.status(400).json({
      error: 'missing_wallet_data',
      message: 'Complete encrypted wallet data is required'
    });
  }

  const emailKey = email.toLowerCase().trim();

  // Check if this is a waitlist user conversion
  const waitlistUser = mockDatabase.waitlistUsers.get(emailKey);
  if (waitlistUser && !waitlistUser.converted) {
    console.log(`🔄 Converting waitlist user: ${email}`);
    
    // Update waitlist user with wallet data
    waitlistUser.hasWallet = true;
    waitlistUser.converted = true;
    waitlistUser.convertedAt = new Date().toISOString();
    
    // Store wallet data
    const walletData = {
      userId: waitlistUser.userId,
      email: emailKey,
      passphrase_hash,
      encryptedMnemonic: encrypted_mnemonic,
      salt,
      nonce,
      seiAddress: sei_address,
      ethAddress: eth_address,
      seiPublicKey: sei_public_key,
      ethPublicKey: eth_public_key,
      createdAt: new Date().toISOString()
    };
    
    mockDatabase.walletData.set(waitlistUser.userId, walletData);
    
    // Generate tokens
    const accessToken = generateToken({
      sub: waitlistUser.userId,
      email: emailKey,
      name: waitlistUser.name,
      type: 'access'
    });
    const refreshToken = generateRefreshToken();
    
    console.log(`✅ Waitlist conversion completed: ${email}`);
    
    return res.json({
      token: accessToken,
      refreshToken,
      userId: waitlistUser.userId,
      walletAddress: sei_address,
      ethWalletAddress: eth_address,
      name: waitlistUser.name,
      language_to_learn: waitlistUser.language_to_learn,
      isWaitlistConversion: true,
      starting_points: 25, // Bonus points for waitlist users
      message: 'Waitlist user converted to full account successfully'
    });
  }

  // New user registration
  if (!name || !language_to_learn) {
    return res.status(400).json({
      error: 'missing_user_data',
      message: 'Name and language preference are required for new users'
    });
  }

  // Check if email already exists as secure user
  if (mockDatabase.secureWalletUsers.has(emailKey)) {
    return res.status(409).json({
      error: 'email_exists',
      message: 'Email already registered'
    });
  }

  console.log(`🆕 Creating new user account: ${email}`);
  
  // Create new user
  const userId = generateUserId();
  const userEntry = {
    userId,
    name: name.trim(),
    email: emailKey,
    language_to_learn,
    joinedAt: new Date().toISOString(),
    hasWallet: true,
    type: 'new_user'
  };

  const walletData = {
    userId,
    email: emailKey,
    passphrase_hash,
    encryptedMnemonic: encrypted_mnemonic,
    salt,
    nonce,
    seiAddress: sei_address,
    ethAddress: eth_address,
    seiPublicKey: sei_public_key,
    ethPublicKey: eth_public_key,
    createdAt: new Date().toISOString()
  };

  // Store in database
  mockDatabase.secureWalletUsers.set(emailKey, userEntry);
  mockDatabase.walletData.set(userId, walletData);

  // Generate tokens
  const accessToken = generateToken({
    sub: userId,
    email: emailKey,
    name: name.trim(),
    type: 'access'
  });
  const refreshToken = generateRefreshToken();

  console.log(`✅ New user registration completed: ${email}`);

  res.json({
    token: accessToken,
    refreshToken,
    userId,
    walletAddress: sei_address,
    ethWalletAddress: eth_address,
    name: name.trim(),
    language_to_learn,
    isWaitlistConversion: false,
    starting_points: 0, // No bonus for new users
    message: 'Account created successfully'
  });
});

// =============================================================================
// WALLET RECOVERY ENDPOINTS
// =============================================================================

/**
 * POST /api/wallet/recover
 * Wallet recovery using email and passphrase
 */
app.post('/api/wallet/recover', async (req, res) => {
  console.log('🔐 Wallet recovery request for:', req.body.email);
  
  const { email, passphrase } = req.body;

  if (!email || !passphrase) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'Email and passphrase are required'
    });
  }

  const emailKey = email.toLowerCase().trim();

  // Find user in secure wallet users
  const user = mockDatabase.secureWalletUsers.get(emailKey);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'user_not_found',
      message: 'No account found with this email'
    });
  }

  // Get wallet data
  const walletData = mockDatabase.walletData.get(user.userId);
  if (!walletData) {
    return res.status(404).json({
      success: false,
      error: 'wallet_not_found',
      message: 'No wallet found for this account'
    });
  }

  // In a real implementation, we would verify the passphrase hash
  // For this mock, we'll simulate successful recovery
  try {
    // Decrypt mnemonic (mock decryption)
    const mnemonic = await decryptMnemonic(
      walletData.encryptedMnemonic,
      passphrase,
      walletData.salt,
      walletData.nonce
    );

    console.log(`✅ Wallet recovery successful for: ${email}`);

    res.json({
      success: true,
      mnemonic,
      seiAddress: walletData.seiAddress,
      ethAddress: walletData.ethAddress,
      userId: user.userId,
      message: 'Wallet recovered successfully'
    });

  } catch (error) {
    console.log(`❌ Wallet recovery failed for: ${email} - Invalid passphrase`);
    res.status(401).json({
      success: false,
      error: 'invalid_passphrase',
      message: 'Invalid passphrase provided'
    });
  }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'yap-landing-mock-server',
    timestamp: new Date().toISOString(),
    endpoints: {
      'Simple Waitlist': '/api/waitlist/simple',
      'Secure Wallet': '/api/waitlist/secure-wallet',
      'Secure Registration': '/auth/secure-signup',
      'Email Lookup': '/api/wallet/email/:email',
      'Unified Registration': '/api/auth/wallet/signup',
      'Wallet Recovery': '/api/wallet/recover'
    },
    database: {
      waitlistUsers: mockDatabase.waitlistUsers.size,
      secureWalletUsers: mockDatabase.secureWalletUsers.size,
      totalUsers: mockDatabase.waitlistUsers.size + mockDatabase.secureWalletUsers.size
    }
  });
});

/**
 * GET /api/admin/users
 * Development endpoint to view all users
 */
app.get('/api/admin/users', (req, res) => {
  res.json({
    waitlistUsers: Array.from(mockDatabase.waitlistUsers.values()),
    secureWalletUsers: Array.from(mockDatabase.secureWalletUsers.values()),
    totalWallets: mockDatabase.walletData.size
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a mock BIP39 mnemonic phrase
 */
function generateMnemonic() {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance'
  ];
  
  const mnemonic = [];
  for (let i = 0; i < 12; i++) {
    mnemonic.push(words[Math.floor(Math.random() * words.length)]);
  }
  return mnemonic.join(' ');
}

/**
 * Generate mock wallet addresses from mnemonic
 */
async function generateWalletAddresses(mnemonic) {
  // In real implementation, would use @cosmjs/crypto and ethers
  return {
    seiWallet: {
      address: 'sei1' + crypto.randomBytes(19).toString('hex'),
      publicKey: 'sei_pub_' + crypto.randomBytes(32).toString('hex'),
      privateKey: crypto.randomBytes(32).toString('hex')
    },
    evmWallet: {
      address: '0x' + crypto.randomBytes(20).toString('hex'),
      publicKey: crypto.randomBytes(64).toString('hex'),
      privateKey: crypto.randomBytes(32).toString('hex')
    }
  };
}

/**
 * Mock encrypt mnemonic with passphrase
 */
async function encryptMnemonic(mnemonic, passphrase) {
  // Mock encryption - in real implementation would use crypto.subtle
  const salt = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(12).toString('hex');
  const encryptedMnemonic = Buffer.from(
    JSON.stringify({ mnemonic, passphrase: passphrase.substring(0, 4) + '***' })
  ).toString('base64');
  
  return { encryptedMnemonic, salt, nonce };
}

/**
 * Mock decrypt mnemonic with passphrase
 */
async function decryptMnemonic(encryptedMnemonic, passphrase, salt, nonce) {
  // Mock decryption - in real implementation would use crypto.subtle
  try {
    const decrypted = JSON.parse(Buffer.from(encryptedMnemonic, 'base64').toString());
    // Simple validation - check if passphrase starts with same characters
    if (decrypted.passphrase.startsWith(passphrase.substring(0, 4))) {
      return decrypted.mnemonic;
    }
    throw new Error('Invalid passphrase');
  } catch (error) {
    throw new Error('Invalid passphrase');
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'POST /api/waitlist/simple',
      'POST /api/waitlist/secure-wallet',
      'POST /auth/secure-signup',
      'GET /api/wallet/email/:email',
      'POST /api/auth/wallet/signup',
      'POST /api/wallet/recover',
      'GET /api/health',
      'GET /api/admin/users'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
  console.log('🚀 YAP Landing Page Mock Server started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('   • Simple Waitlist:     POST /api/waitlist/simple');
  console.log('   • Secure Wallet:       POST /api/waitlist/secure-wallet');
  console.log('   • Secure Registration: POST /auth/secure-signup');
  console.log('   • Email Lookup:        GET  /api/wallet/email/:email');
  console.log('   • Unified Registration: POST /api/auth/wallet/signup');
  console.log('   • Wallet Recovery:     POST /api/wallet/recover');
  console.log('   • Health Check:        GET  /api/health');
  console.log('   • Admin Users:         GET  /api/admin/users');
  console.log('');
  console.log('🧪 Test data available:');
  console.log('   • Waitlist user: waitlist@example.com (ready for conversion)');
  console.log('');
  console.log('💡 Usage:');
  console.log('   1. Test simple waitlist signup');
  console.log('   2. Test secure wallet creation');
  console.log('   3. Test waitlist user conversion');
  console.log('   4. Test wallet recovery');
  console.log('');
  console.log('🔗 Access admin panel: http://localhost:3001/api/admin/users');
});
