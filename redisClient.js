import { createClient } from "redis";

const client = createClient(
  // { url: 'redis://redis:6379'}
  { url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` }
);

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

export default client;
