import { Link, useFocusEffect } from "expo-router";
import { useCallback, useRef, type ComponentPropsWithRef, type ComponentRef, type ReactNode } from "react";
import {
  AccessibilityInfo, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, palette } from "../theme";

export function Page({ title, home, children }: { title: string; home?: boolean; children: ReactNode }) {
  const heading = useRef<ComponentRef<typeof View>>(null);
  useFocusEffect(useCallback(() => {
    const frame = requestAnimationFrame(() => {
      if (!heading.current) return;
      if (Platform.OS === "web") heading.current.focus();
      else AccessibilityInfo.sendAccessibilityEvent(heading.current, "focus");
    });
    return () => cancelAnimationFrame(frame);
  }, []));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.page}>
          <Image source={require("../../assets/papelzinho-logo.png")} accessibilityLabel="Papelzinho" style={styles.logo} />
          {!home && <Link href="/" dismissTo style={styles.link}>‹ Meus grupos</Link>}
          <View ref={heading} accessible accessibilityRole="header" accessibilityLabel={title} tabIndex={-1}>
            <Text style={styles.title}>{title}</Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <View style={[styles.card, accent && styles.accent]}>{children}</View>;
}

export function Body({ children, alert }: { children: ReactNode; alert?: boolean }) {
  return <Text accessibilityRole={alert ? "alert" : undefined} accessibilityLiveRegion={alert ? "polite" : "none"} style={styles.body}>{children}</Text>;
}

export function Action({ label, run, disabled, secondary }: {
  label: string; run: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={run}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={[styles.buttonLabel, (disabled || secondary) && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, error, ...props }: ComponentPropsWithRef<typeof TextInput> & { label: string; error?: string }) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor={palette.muted} style={styles.input} {...props} />
    {error && <Body alert>{error}</Body>}
  </View>;
}

export function formatDate(date: string) {
  return date.split("-").reverse().join("/");
}

export function formatValue(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Sem conexão no momento. Verifique a internet e tente de novo.";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  scroll: { paddingHorizontal: 16, paddingVertical: 28 },
  page: { width: "100%", maxWidth: 640, alignSelf: "center", gap: 16 },
  logo: { width: 166, height: 32 },
  title: { color: palette.text, fontFamily: fonts.accent, fontSize: 24, lineHeight: 32 },
  body: { color: palette.text, fontFamily: fonts.body, fontSize: 18, lineHeight: 28 },
  card: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 },
  accent: { backgroundColor: "#f6d5b8" },
  link: { minHeight: 48, alignSelf: "flex-start", paddingVertical: 12, fontFamily: fonts.strong, fontSize: 16, color: palette.primary },
  button: { minHeight: 48, justifyContent: "center", alignItems: "center", borderRadius: 8, padding: 12, backgroundColor: palette.primary },
  secondary: { backgroundColor: "#e6f3fe" },
  disabled: { backgroundColor: "#eeece9" },
  pressed: { opacity: 0.8 },
  buttonLabel: { fontFamily: fonts.strong, fontSize: 16, lineHeight: 24, color: palette.surface, textAlign: "center" },
  secondaryLabel: { color: palette.text },
  field: { gap: 6 },
  label: { fontFamily: fonts.strong, color: palette.text, fontSize: 16, lineHeight: 24 },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#8a8580", borderRadius: 8, padding: 10, fontSize: 18, color: palette.text, fontFamily: fonts.body },
});
