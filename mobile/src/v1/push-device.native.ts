import Constants from "expo-constants";
import { AndroidImportance, getExpoPushTokenAsync, requestPermissionsAsync, setNotificationChannelAsync } from "expo-notifications";

export async function requestDeviceToken(platform: "ios" | "android"): Promise<string | null> {
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId !== "string") throw new Error("Expo project is not configured");

  if (platform === "android") {
    await setNotificationChannelAsync("default", {
      name: "Avisos do Papelzinho",
      importance: AndroidImportance.DEFAULT,
    });
  }
  const permission = await requestPermissionsAsync();
  if (!permission.granted) return null;
  return (await getExpoPushTokenAsync({ projectId })).data;
}
