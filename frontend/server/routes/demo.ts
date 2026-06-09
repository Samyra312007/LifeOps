import { RequestHandler } from "express";

export const handleDemo: RequestHandler = (req, res) => {
  res.status(200).json({ message: "LifeOps Python backend is running. Proxy is active." });
};
