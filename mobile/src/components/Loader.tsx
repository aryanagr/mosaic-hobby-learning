import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function Loader({
  label = "Growing your workspace…",
}: {
  label?: string;
}) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <View style={styles.mark}>
        <Text style={styles.markText}>S</Text>
      </View>
      <ActivityIndicator color={colors.lime} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    backgroundColor: colors.dark,
  },
  mark: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    transform: [{ rotate: "-3deg" }],
  },
  markText: { color: colors.ink, fontSize: 27, fontWeight: "700" },
  label: { color: colors.white, fontSize: 13, fontWeight: "700" },
});
