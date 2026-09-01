module.exports = {
  apps: [
    {
      name: "em-bundle",
      script: "./node_modules/@remix-run/serve/dist/cli.js",
      args: "./build/server/index.js",
      cwd: "/var/www/em-bundle",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      }
    }
  ]
};
