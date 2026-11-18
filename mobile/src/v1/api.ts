import { createHttpApi } from "./client";
import { createMockApi } from "./mock";

export const useDemo = process.env.EXPO_PUBLIC_MOBILE_API !== "live";
export const api = useDemo ? createMockApi() : createHttpApi();
