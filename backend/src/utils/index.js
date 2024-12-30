import envConfig from "../config/env.config.js";

export function getNodeEnvironment() {
  return envConfig.NODE_ENV;
}

export function getAdminSecretKey() {
  return envConfig.ADMIN_SECRET_KEY || "asdfghjklmnopqrstuvwxyzABCDEF";
}

export const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
