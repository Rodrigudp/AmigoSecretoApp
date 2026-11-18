import { Link, useFocusEffect } from "expo-router";
import { useCallback, useRef, type ComponentRef } from "react";
import {
  AccessibilityInfo,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockApi, type Section } from "./api";
import { fonts, palette } from "./theme";

export function Screen({ section }: { section: Section }) {
  const { title, message } = mockApi.getScreen(section);
  const heading = useRef<ComponentRef<typeof View>>(null);
  const isHome = section === "home";

  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(() => {
        const element = heading.current;
        if (!element) return;
        if (Platform.OS === "web") element.focus();
        else AccessibilityInfo.sendAccessibilityEvent(element, "focus");
      });
      return () => cancelAnimationFrame(frame);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          <Image
            source={require("../assets/papelzinho-logo.png")}
            accessibilityLabel="Papelzinho"
            style={styles.logo}
            resizeMode="contain"
          />
          {!isHome && (
            <Link href="/" dismissTo style={styles.link}>
              {mockApi.getScreen("home").title}
            </Link>
          )}
          <View style={[styles.card, section === "invitation" && styles.invitation]}>
            <View
              ref={heading}
              accessible
              accessibilityRole="header"
              accessibilityLabel={title}
              tabIndex={-1}
            >
              <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
            {isHome && (
              <Link href="/create" style={[styles.link, styles.primary]}>
                {mockApi.getScreen("create").title}
              </Link>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  scroll: { paddingHorizontal: 16, paddingVertical: 32 },
  page: { width: "100%", maxWidth: 640, alignSelf: "center", gap: 24 },
  logo: { width: 166, height: 32 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 24,
    gap: 12,
  },
  invitation: { backgroundColor: "#f6d5b8" },
  title: { fontFamily: fonts.accent, fontSize: 24, lineHeight: 32, color: palette.text },
  message: { fontFamily: fonts.body, fontSize: 18, lineHeight: 28, color: palette.muted },
  link: {
    alignSelf: "flex-start",
    minHeight: 48,
    minWidth: 48,
    paddingVertical: 12,
    fontFamily: fonts.strong,
    fontSize: 16,
    lineHeight: 24,
    color: palette.primary,
    textDecorationLine: "underline",
  },
  primary: {
    backgroundColor: palette.primary,
    color: palette.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    textDecorationLine: "none",
  },
});
