import { Platform } from "react-native";
import { localWebApiEnabled, nativeApiEndpoint } from "./api-origin";
import { createHttpApi } from "./client";
import { createMockApi } from "./mock";

const configuredOrigin = process.env.EXPO_PUBLIC_API_URL;
const isWeb = Platform.OS === "web";
const isLocalWeb =
  isWeb &&
  typeof window !== "undefined" &&
  localWebApiEnabled(__DEV__, window.location.hostname, configuredOrigin);

export const useDemo = process.env.EXPO_PUBLIC_MOBILE_API !== "live" || (isWeb && !isLocalWeb);
export const api = useDemo
  ? createMockApi()
  : createHttpApi(fetch, isWeb ? "/api/v1" : nativeApiEndpoint(configuredOrigin, __DEV__));
