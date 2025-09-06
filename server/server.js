#!/usr/bin/env node

/**
 * EduSIS Backend Server Startup Script
 */

const app = require("./app");

// Set default environment
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  console.error(
    "\nPlease check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

console.log("✅ Environment variables validated");
console.log("🔧 Starting EduSIS Backend Server...");
