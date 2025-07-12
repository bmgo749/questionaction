import mongoose from 'mongoose';
import { CONFIG } from './config';
import { MongoMemoryServer } from 'mongodb-memory-server';

let isConnected = false;
let mongoMemoryServer: MongoMemoryServer | null = null;
let connectionAttempted = false;
let lastConnectionAttempt = 0;

export async function connectToMongoDB() {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection.getClient().db().databaseName;
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionAttempted && (Date.now() - lastConnectionAttempt) < 10000) {
    // Wait for existing connection attempt
    let attempts = 0;
    while (!isConnected && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (isConnected) {
      return mongoose.connection.getClient().db().databaseName;
    }
  }

  connectionAttempted = true;
  lastConnectionAttempt = Date.now();

  try {
    // Close any existing connection first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Try MongoDB Atlas first
    const atlasUri = CONFIG.MONGODB_ATLAS_URL;
    console.log('🔄 Connecting to MongoDB Atlas...');

    try {
      await mongoose.connect(atlasUri, {
        bufferCommands: false,
        dbName: 'queit',
        maxPoolSize: 10, // Limit connection pool
        serverSelectionTimeoutMS: 5000, // Timeout after 5s
        socketTimeoutMS: 45000, // Close socket after 45s
        family: 4 // Use IPv4
      });

      console.log('✅ Connected to MongoDB Atlas');

      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        isConnected = true;
      });

      isConnected = true;
      console.log(`✅ MongoDB successfully connected to: Atlas`);
      return atlasUri;
    } catch (atlasError) {
      console.error('❌ MongoDB Atlas connection failed:', atlasError);
      console.log('🔄 Falling back to Memory Server...');

      // Fallback to Memory Server
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27018,
          dbName: 'queit'
        }
      });
      let uri = mongoMemoryServer.getUri();

      await mongoose.connect(uri, {
        bufferCommands: false,
        dbName: 'queit',
        maxPoolSize: 5 // Smaller pool for memory server
      });
      console.log('✅ Connected to MongoDB Memory Server (fallback)');

      isConnected = true;
      console.log(`✅ MongoDB successfully connected to: Memory Server`);
      return uri;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    connectionAttempted = false; // Allow retry
    throw error;
  }
}

export async function disconnectFromMongoDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  isConnected = false;
  connectionAttempted = false;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});

export { mongoose };