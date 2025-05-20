/**
 * Helper module to isolate the Dynamic SDK integration without direct Angular dependency
 * This provides a clean API for the Angular service to consume
 */

// Import the SDK dynamically to avoid Angular compilation issues
async function initializeDynamicSDK(environmentId, isProduction = false) {
  try {
    // Dynamic import to avoid Angular compilation issues
    const dynamic = await import('@dynamic-labs/sdk-api-core');
    
    // Access the SDK API
    const sdkApi = new dynamic.SDKApi();
    
    // Configure the API with environment ID
    sdkApi.configuration = new dynamic.Configuration({
      basePath: isProduction ? 
        'https://app.dynamic.xyz/api/v0' : 
        'https://app.dynamic.xyz/api/v0',
      apiKey: environmentId
    });

    console.log('SDK API initialized with configuration:', sdkApi.configuration);
    
    return {
      sdkApi,
      dynamic
    };
  } catch (error) {
    console.error('Failed to initialize Dynamic SDK:', error);
    throw error;
  }
}

/**
 * Create an embedded wallet using the Dynamic SDK API
 */
async function createEmbeddedWallet(sdkApi, environmentId) {
  try {
    // Create a new embedded wallet request
    const walletResponse = await sdkApi.createEmbeddedWallet({
      environmentId: environmentId,
      skipEmailVerification: true,
      chainName: 'SEI',
      network: 'mainnet'
    });
    
    if (walletResponse && walletResponse.data) {
      const walletData = walletResponse.data;
      
      return {
        seiWalletAddress: walletData.address,
        dynamicUserId: walletData.userId || 'unknown'
      };
    } else {
      throw new Error('Failed to create embedded wallet: Invalid response');
    }
  } catch (error) {
    console.error('Error creating embedded wallet:', error);
    throw error;
  }
}

export {
  initializeDynamicSDK,
  createEmbeddedWallet
};
