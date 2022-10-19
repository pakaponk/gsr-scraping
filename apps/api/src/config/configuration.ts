function getConfig() {
  return {
    port: parseInt(process.env.PORT, 10) || 5001,
    auth: {
      jwt: {
        secret: process.env.AUTH_JWT_SECRET,
        expiresIn: process.env.AUTH_JWT_EXPIRES_IN,
      },
      secureSession: {
        secret: process.env.AUTH_SECURE_SESSION_SECRET,
        salt: process.env.AUTH_SECURE_SESSION_SALT,
      },
    },
    queue: {
      host: process.env.QUEUE_HOST,
      port: parseInt(process.env.QUEUE_PORT, 10) || 6379,
    },
  };
}

export type AppConfig = ReturnType<typeof getConfig>;

export default getConfig;
