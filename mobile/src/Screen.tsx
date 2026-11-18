import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockApi, type Section } from "./api";
import { fonts, palette } from "./theme";

export function Screen({ section }: { section: Section }) {
  const { title, message } = mockApi.getScreen(section);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View accessible={false} style={styles.paper} />
            <Text style={styles.brand}>Papelzinho</Text>
          </View>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.message}>{message}</Text>
            {section !== "home" && (
              <Link href="/" replace style={styles.link}>
                Voltar ao início
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
  scroll: { paddingHorizontal: 20, paddingVertical: 32 },
  page: { width: "100%", maxWidth: 640, alignSelf: "center", gap: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  paper: {
    width: 18,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.note,
    transform: [{ rotate: "-8deg" }],
  },
  brand: { fontFamily: fonts.strong, fontSize: 18, color: palette.text },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 24,
    gap: 12,
  },
  title: { fontFamily: fonts.accent, fontSize: 32, lineHeight: 40, color: palette.text },
  message: { fontFamily: fonts.body, fontSize: 18, lineHeight: 28, color: palette.muted },
  link: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingVertical: 12,
    paddingRight: 12,
    fontFamily: fonts.strong,
    fontSize: 16,
    color: palette.primary,
    textDecorationLine: "underline",
  },
});
