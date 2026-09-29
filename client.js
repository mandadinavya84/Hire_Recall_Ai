const { HindsightClient: VectorizeHindsightClient } = require('@vectorize-io/hindsight-client');
const config = require('../../config');

class HindsightClient {
  constructor() {
    this.mode = config.hindsight.mode || 'remote';
    this.baseUrl = (config.hindsight.baseUrl || 'https://api.hindsight.vectorize.io').replace(/\/$/, '');
    this.apiKey = config.hindsight.apiKey || '';
    this.bankId = config.hindsight.bankId || 'hirerecall_recruitment';
    this.lastHealthCheck = null;
    this.isConnected = false;

    // Initialize official Vectorize Hindsight client
    this.client = new VectorizeHindsightClient({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey || undefined
    });
  }

  isRemote() {
    return this.mode === 'remote';
  }

  /**
   * Health check verifying genuine connectivity to Hindsight API
   */
  async checkHealth() {
    const startTime = Date.now();
    try {
      // Verify API version from Hindsight server
      const version = await this.client.getVersion();
      const latencyMs = Date.now() - startTime;
      
      this.isConnected = true;
      this.lastHealthCheck = Date.now();

      return {
        connected: true,
        mode: 'remote',
        engine: 'Official Vectorize Hindsight API',
        bank: this.bankId,
        serverUrl: this.baseUrl.replace(/\/\/.*@/, '//***@'),
        version: version.api_version || '0.10.1',
        features: version.features || {},
        latencyMs,
        status: 'connected'
      };
    } catch (err) {
      this.isConnected = false;
      this.lastHealthCheck = Date.now();
      
      const errorMsg = err.message || 'Hindsight connection unavailable. Please check the Hindsight configuration.';
      console.warn(`[Hindsight Health] Server check failed at ${this.baseUrl}: ${errorMsg}`);

      return {
        connected: false,
        mode: 'remote',
        bank: this.bankId,
        serverUrl: this.baseUrl,
        engine: 'Official Vectorize Hindsight API',
        error: errorMsg,
        status: 'offline'
      };
    }
  }

  getStatus() {
    return {
      mode: 'remote',
      bankId: this.bankId,
      baseUrl: this.baseUrl,
      status: this.isConnected ? 'connected' : 'offline',
      engine: 'Official Vectorize Hindsight Client',
      capabilities: [
        'Persistent Experiential Memory',
        'Official Retain API (World Facts, Experiences, Observations)',
        'Official Recall API (TEMPR Multi-Strategy Search)',
        'Official Reflect API (Mental Models & Progression Synthesis)',
        'Strict Candidate Tag Partitioning & Isolation'
      ]
    };
  }
}

module.exports = new HindsightClient();
