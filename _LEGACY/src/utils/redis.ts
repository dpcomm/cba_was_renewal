import { createClient } from "redis";

// console.log(process.env.REDIS_URL);
const redisClient = createClient({ url: process.env.REDIS_URL });

export default redisClient;