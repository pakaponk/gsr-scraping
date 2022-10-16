export type AppConfig = {
  port: number;
};

export default (): AppConfig => {
  return {
    port: parseInt(process.env.PORT, 10) || 5001,
  };
};
