import mongoose from "mongoose";

declare global {

  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

const uri = process.env.MONGODB_URI;

export async function connectDb(): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
  }
  return global._mongooseConn;
}
