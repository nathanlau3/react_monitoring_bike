module.exports = {
  apps: [
    {
      name: "react-frontend",
      script: "serve",
      args: "-s build -l 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
