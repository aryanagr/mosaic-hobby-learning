import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { LearningFormat, OnboardingProfile, User } from "../domain/models";
import { login, register } from "../services/api";
import { colors, shadow } from "../theme";

const formats: { value: LearningFormat; label: string }[] = [
  { value: "practice", label: "Hands-on" },
  { value: "watch", label: "Videos" },
  { value: "read", label: "Articles" },
  { value: "listen", label: "Audio" },
];

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated(user: User, isNew: boolean): Promise<void>;
}) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<OnboardingProfile>({
    hobby: "Guitar",
    experience: "some",
    goal: "Play three songs confidently at our next campfire",
    weeklyMinutes: 60,
    preferredFormat: "practice",
  });

  const submit = async () => {
    if (
      !email.trim() ||
      password.length < 8 ||
      (mode === "signup" && (!name.trim() || !profile.goal.trim()))
    ) {
      setError(
        "Please complete the required details. Passwords need at least 8 characters.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user =
        mode === "signup"
          ? await register({
              name: name.trim(),
              email: email.trim(),
              password,
              onboarding: profile,
            })
          : await login(email.trim(), password);
      await onAuthenticated(user, mode === "signup");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <Text style={styles.markText}>S</Text>
          </View>
          <Text style={styles.brand}>SkillSprout</Text>
        </View>
        <Text style={styles.kicker}>A PATH BUILT AROUND YOU</Text>
        <Text style={styles.hero}>
          Grow a hobby into something you can actually do.
        </Text>
        <Text style={styles.intro}>
          Tell us the moment you want to unlock. We’ll remove the noise and
          build the smallest useful path.
        </Text>

        <View style={styles.card}>
          <View style={styles.tabs} accessibilityRole="tablist">
            {(["signup", "signin"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setMode(item);
                  setError("");
                }}
                style={[styles.tab, mode === item && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === item }}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === item && styles.tabTextActive,
                  ]}
                >
                  {item === "signup" ? "Create account" : "Sign in"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.cardTitle}>
            {mode === "signup" ? "Let’s design your path." : "Welcome back."}
          </Text>
          {mode === "signup" && (
            <Field
              label="Your name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
          />

          {mode === "signup" && (
            <>
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>PERSONALIZE MY PATH</Text>
                <View style={styles.line} />
              </View>
              <Field
                label="Hobby you want to grow"
                value={profile.hobby}
                onChangeText={(hobby) => setProfile({ ...profile, hobby })}
              />
              <Field
                label="Moment you want to unlock"
                value={profile.goal}
                onChangeText={(goal) => setProfile({ ...profile, goal })}
                multiline
              />
              <Text style={styles.label}>YOUR EXPERIENCE</Text>
              <View style={styles.chips}>
                {[
                  { value: "new", label: "New" },
                  { value: "some", label: "Basics" },
                  { value: "returning", label: "Returning" },
                ].map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    active={profile.experience === item.value}
                    onPress={() =>
                      setProfile({
                        ...profile,
                        experience:
                          item.value as OnboardingProfile["experience"],
                      })
                    }
                  />
                ))}
              </View>
              <Text style={styles.label}>HOW YOU LEARN BEST</Text>
              <View style={styles.chips}>
                {formats.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    active={profile.preferredFormat === item.value}
                    onPress={() =>
                      setProfile({ ...profile, preferredFormat: item.value })
                    }
                  />
                ))}
              </View>
            </>
          )}
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <Pressable
            style={[styles.submit, busy && styles.disabled]}
            onPress={() => void submit()}
            disabled={busy}
            accessibilityState={{ busy, disabled: busy }}
          >
            {busy ? (
              <View style={styles.busy}>
                <ActivityIndicator color={colors.white} />
                <Text style={styles.submitText}>
                  {mode === "signup" ? "Building your path…" : "Signing in…"}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>
                {mode === "signup" ? "Create my path  ✦" : "Sign in  →"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string };
function Field({ label, multiline, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#9a968e"
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress(): void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.dark },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 44 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 46,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    transform: [{ rotate: "-3deg" }],
  },
  markText: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  brand: { color: colors.white, fontSize: 22, fontWeight: "800" },
  kicker: {
    color: colors.lime,
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "800",
  },
  hero: {
    color: colors.white,
    fontSize: 39,
    lineHeight: 42,
    letterSpacing: -1.7,
    fontWeight: "700",
    marginTop: 13,
  },
  intro: {
    color: "#b9b7af",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 17,
    marginBottom: 30,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 24,
    padding: 18,
    ...shadow,
  },
  tabs: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: "#eeece5",
    borderRadius: 13,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: colors.white },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: colors.ink },
  cardTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 24,
    marginBottom: 18,
  },
  field: { marginBottom: 14 },
  label: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: "800",
    marginBottom: 7,
  },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: "#f8f6f0",
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 14,
  },
  multiline: { minHeight: 82, paddingTop: 13, textAlignVertical: "top" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginVertical: 18,
  },
  line: { height: 1, flex: 1, backgroundColor: colors.line },
  dividerText: {
    color: colors.muted,
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: "800",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 17 },
  chip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  chipTextActive: { color: colors.ink },
  error: {
    color: colors.danger,
    backgroundColor: "#fbe9e6",
    padding: 11,
    borderRadius: 9,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  submit: {
    minHeight: 52,
    backgroundColor: colors.ink,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  submitText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  busy: { flexDirection: "row", alignItems: "center", gap: 10 },
  disabled: { opacity: 0.7 },
});
