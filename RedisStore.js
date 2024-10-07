import client from "./redisClient.js";

class RedisStore {
  constructor() {
    this.client = client;
  }

  async incr(key) {
    const count = await this.client.incr(key);
    await this.client.expire(key, 60); // Set expiration time of 1 minute
    return count;
  }

  async reset(key) {
    await this.client.del(key);
  }

  async get(key) {
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }
}

export default RedisStore;
