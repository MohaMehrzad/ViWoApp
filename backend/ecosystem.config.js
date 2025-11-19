/**
 * ============================================
 * PM2 ECOSYSTEM CONFIGURATION
 * ============================================
 * Production process management for ViWoApp Backend
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 restart viwoapp-backend
 *   pm2 stop viwoapp-backend
 *   pm2 logs viwoapp-backend
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      // ==========================================
      // Main Application
      // ==========================================
      name: 'viwoapp-backend',
      script: './dist/main.js',
      
      // Cluster mode for load balancing
      instances: 'max', // or specify number: 4
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Resource management
      max_memory_restart: '1G',
      
      // Restart behavior
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // Graceful shutdown/reload
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Advanced features
      watch: false, // Set to true for development
      ignore_watch: ['node_modules', 'logs', 'uploads', 'dist'],
      watch_options: {
        followSymlinks: false
      },
      
      // Source map support
      source_map_support: true,
      
      // Instance variables
      instance_var: 'INSTANCE_ID',
      
      // Time between instance starts (cluster mode)
      wait_ready: true,
      
      // Cron restart (e.g., daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Post-deploy commands
      post_update: ['npm install', 'npm run build'],
    },
    
    // ==========================================
    // Daily Rewards Cron Job
    // ==========================================
    {
      name: 'viwoapp-rewards-cron',
      script: './dist/scripts/distribute-rewards.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 2 * * *', // Run daily at 2 AM
      autorestart: false,
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/rewards-cron-error.log',
      out_file: './logs/rewards-cron-out.log',
      merge_logs: true,
    }
  ],

  /**
   * ==========================================
   * DEPLOYMENT CONFIGURATION
   * ==========================================
   * Uncomment and configure for remote deployments
   */
  deploy: {
    production: {
      // SSH connection
      user: 'viwoapp',
      host: ['your-server-ip'],
      ref: 'origin/master',
      repo: 'git@github.com:your-username/viwoapp-backend.git',
      path: '/var/www/viwoapp/backend',
      
      // Commands
      'pre-deploy': 'git fetch --all',
      'post-deploy': 'npm install && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Environment
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'viwoapp',
      host: ['your-staging-server-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/viwoapp-backend.git',
      path: '/var/www/viwoapp/backend-staging',
      'post-deploy': 'npm install && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};



