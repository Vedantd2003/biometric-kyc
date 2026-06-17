import { Client, Account, Databases, Storage } from "appwrite";
import { config } from "./config";

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
