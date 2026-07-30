import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { replacePlan, updateStatus } from "../store/store";
import {
  calculateProgress,
  milestones,
  type Milestone,
} from "../domain/gamification";
import type { Technique, User } from "../domain/models";
import { generatePlan, logout } from "../services/api";
import { colors, shadow } from "../theme";

export function DashboardScreen({
  user,
  onLogout,
}: {
  user: User;
  onLogout(): void;
}) {
  const dispatch = useAppDispatch();
  const plan = useAppSelector((state) => state.learningPlan.plan);
  const progress = useMemo(
    () => calculateProgress(plan.techniques),
    [plan.techniques],
  );
  const [selected, setSelected] = useState<Technique | null>(null);
  const [completion, setCompletion] = useState<{
    techniqueTitle: string;
    milestone: Milestone | null;
  } | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tablet = width >= 700;

  const master = async () => {
    if (!selected) return;
    const before = progress.unlocked.map((item) => item.id);
    const afterTechniques = plan.techniques.map((item) =>
      item.id === selected.id ? { ...item, status: "done" as const } : item,
    );
    const after = calculateProgress(afterTechniques);
    const earned = after.unlocked.find((item) => !before.includes(item.id));
    const techniqueTitle = selected.title;
    dispatch(updateStatus({ id: selected.id, status: "done" }));
    setSelected(null);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    setTimeout(
      () => setCompletion({ techniqueTitle, milestone: earned ?? null }),
      280,
    );
  };

  const reimagine = async () => {
    setRegenerating(true);
    try {
      dispatch(replacePlan(await generatePlan(user.onboarding)));
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, tablet && styles.tabletContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            <View style={styles.mark}>
              <Text style={styles.markText}>S</Text>
            </View>
            <Text style={styles.brand}>SkillSprout</Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => void logout().finally(onLogout)}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.avatarText}>{initials(user.name)}</Text>
          </Pressable>
        </View>

        <View style={[styles.hero, tablet && styles.tabletHero]}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>YOUR MINIMUM VIABLE MASTERY</Text>
            <Text style={styles.heroTitle}>{plan.title}</Text>
            <Text style={styles.heroText}>{plan.promise}</Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.primary}
                onPress={() =>
                  setSelected(
                    plan.techniques.find(
                      (item) =>
                        item.status !== "done" && item.status !== "skipped",
                    ) ?? null,
                  )
                }
              >
                <Text style={styles.primaryText}>Continue learning →</Text>
              </Pressable>
              <Pressable
                style={styles.secondary}
                onPress={() => void reimagine()}
                disabled={regenerating}
              >
                {regenerating ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <Text style={styles.secondaryText}>✦ Reimagine</Text>
                )}
              </Pressable>
            </View>
          </View>
          <View style={styles.progressRing}>
            <Text style={styles.progressValue}>{progress.percentage}%</Text>
            <Text style={styles.progressLabel}>COMPLETE</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat
            icon="✓"
            value={`${progress.mastered} mastered`}
            detail={`of ${progress.total} techniques`}
            tone={colors.peach}
          />
          <Stat
            icon="◷"
            value={`${user.onboarding.weeklyMinutes} minutes`}
            detail="planned this week"
            tone="#ffecad"
          />
          <Stat
            icon="⚡"
            value={`${progress.xp} XP`}
            detail={`level ${progress.level} learner`}
            tone="#e6dcff"
          />
        </View>

        <View style={[styles.growth, tablet && styles.tabletGrowth]}>
          <View style={styles.levelCard}>
            <Text style={styles.levelKicker}>YOUR GROWTH</Text>
            <Text style={styles.levelTitle}>
              Level {progress.level}
              {"\n"}learner
            </Text>
            <Text style={styles.xp}>{progress.xp} XP</Text>
            <View style={styles.xpTrack}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${(progress.levelXp / 300) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.levelFoot}>
              {300 - progress.levelXp} XP to the next level
            </Text>
          </View>
          <View style={styles.badges}>
            {milestones.map((item) => {
              const earned = progress.unlocked.some(
                (unlocked) => unlocked.id === item.id,
              );
              return (
                <View
                  key={item.id}
                  style={[styles.badge, earned && styles.badgeEarned]}
                >
                  <Text style={styles.badgeIcon}>
                    {earned ? item.icon : "◇"}
                  </Text>
                  <Text style={styles.badgeTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.earned, !earned && styles.locked]}>
                    {earned ? "EARNED" : "LOCKED"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.pathHeader}>
          <View>
            <Text style={styles.kickerDark}>YOUR LEARNING PATH</Text>
            <Text style={styles.pathTitle}>
              Small steps, in the right order.
            </Text>
          </View>
        </View>
        <View style={styles.pathList}>
          {plan.techniques
            .filter((item) => item.status !== "skipped")
            .map((item, index) => (
              <TechniqueCard
                key={item.id}
                item={item}
                index={index}
                isLast={index === progress.total - 1}
                onPress={() => setSelected(item)}
              />
            ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          { height: 64 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <Nav icon="⌂" label="My path" active />
        <Nav icon="◇" label="Discover" />
        <Nav icon="↗" label="Progress" />
      </View>
      <LessonModal
        technique={selected}
        onClose={() => setSelected(null)}
        onMaster={() => void master()}
        onSkip={() => {
          if (selected)
            dispatch(updateStatus({ id: selected.id, status: "skipped" }));
          setSelected(null);
        }}
      />
      <CompletionModal
        completion={completion}
        onClose={() => setCompletion(null)}
      />
    </SafeAreaView>
  );
}

function TechniqueCard({
  item,
  index,
  isLast,
  onPress,
}: {
  item: Technique;
  index: number;
  isLast: boolean;
  onPress(): void;
}) {
  return (
    <Pressable
      style={styles.techniqueRow}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.stepRail}>
        <View style={[styles.step, item.status === "done" && styles.stepDone]}>
          <Text
            style={[
              styles.stepText,
              item.status === "done" && styles.stepTextDone,
            ]}
          >
            {item.status === "done" ? "✓" : index + 1}
          </Text>
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>
      <View style={styles.techniqueCard}>
        <View style={styles.cardTop}>
          <Text style={styles.kickerDark}>{item.eyebrow.toUpperCase()}</Text>
          <Text style={styles.medium}>
            {mediumIcon(item.medium)} {item.medium.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.techniqueTitle}>{item.title}</Text>
        <Text style={styles.techniqueText}>{item.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>◷ {item.duration} min</Text>
          {item.status === "done" && (
            <Text style={styles.mastered}>MASTERED</Text>
          )}
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

function LessonModal({
  technique,
  onClose,
  onMaster,
  onSkip,
}: {
  technique: Technique | null;
  onClose(): void;
  onMaster(): void;
  onSkip(): void;
}) {
  const [displayed, setDisplayed] = useState<Technique | null>(technique);
  useEffect(() => {
    if (technique) setDisplayed(technique);
  }, [technique]);
  return (
    <Modal
      visible={!!technique}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <View
            style={[
              styles.lessonVisual,
              {
                backgroundColor:
                  displayed?.medium === "watch" ? colors.peach : "#e6dcff",
              },
            ]}
          >
            <Text style={styles.lessonIcon}>
              {displayed ? mediumIcon(displayed.medium) : "✦"}
            </Text>
            <Text style={styles.lessonMedium}>
              {displayed?.medium.toUpperCase()} · {displayed?.duration} MIN
            </Text>
          </View>
          <Text style={styles.kickerDark}>
            {displayed?.eyebrow.toUpperCase()}
          </Text>
          <Text style={styles.lessonTitle}>{displayed?.title}</Text>
          <Text style={styles.lessonText}>{displayed?.description}</Text>
          <View style={styles.why}>
            <Text style={styles.whyIcon}>✦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.whyTitle}>Why this made your path</Text>
              <Text style={styles.whyText}>{displayed?.why}</Text>
            </View>
          </View>
          <Pressable style={styles.masterButton} onPress={onMaster}>
            <Text style={styles.primaryText}>
              {displayed?.status === "done"
                ? "Practise again"
                : "Mark as mastered"}{" "}
              ✓
            </Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Not for me</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CompletionModal({
  completion,
  onClose,
}: {
  completion: { techniqueTitle: string; milestone: Milestone | null } | null;
  onClose(): void;
}) {
  const scale = useRef(new Animated.Value(0.75)).current;
  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (completion) {
      scale.setValue(0.75);
      burst.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
        }),
        Animated.timing(burst, {
          toValue: 1,
          duration: 950,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [burst, completion, scale]);
  return (
    <Modal
      visible={!!completion}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.celebrationBackdrop}>
        <ConfettiBurst progress={burst} />
        <Animated.View
          style={[styles.celebrationCard, { transform: [{ scale }] }]}
        >
          <View style={styles.bigBadge}>
            <Text style={styles.bigBadgeIcon}>
              {completion?.milestone?.icon ?? "✓"}
            </Text>
          </View>
          <Text style={styles.kickerDark}>
            {completion?.milestone ? "MILESTONE UNLOCKED" : "STEP MASTERED"}
          </Text>
          <Text style={styles.celebrationTitle} numberOfLines={2}>
            {completion?.milestone?.title ?? completion?.techniqueTitle}
          </Text>
          <Text style={styles.celebrationText}>
            Nice work. Your progress is saved and the next step is ready.
          </Text>
          <Text style={styles.bonus}>+120 XP</Text>
          <Pressable style={styles.masterButton} onPress={onClose}>
            <Text style={styles.primaryText}>Keep learning →</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function ConfettiBurst({ progress }: { progress: Animated.Value }) {
  const pieces = ["◆", "✦", "●", "■", "✦", "◆", "●", "■", "✦", "◆", "●", "■"];
  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {pieces.map((piece, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const distance = 45 + (index % 4) * 20;
        return (
          <Animated.Text
            key={`${piece}-${index}`}
            style={[
              styles.confettiPiece,
              {
                color:
                  index % 3 === 0
                    ? colors.purple
                    : index % 3 === 1
                      ? colors.lime
                      : "#ee967b",
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, direction * distance],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 150 + (index % 3) * 35],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", `${direction * 320}deg`],
                    }),
                  },
                ],
                opacity: progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [1, 1, 0],
                }),
              },
            ]}
          >
            {piece}
          </Animated.Text>
        );
      })}
    </View>
  );
}

function Stat({
  icon,
  value,
  detail,
  tone,
}: {
  icon: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tone }]}>
        <Text>{icon}</Text>
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statDetail}>{detail}</Text>
      </View>
    </View>
  );
}
function Nav({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <View style={styles.navItem}>
      <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </View>
  );
}
function initials(name: string) {
  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function mediumIcon(medium: Technique["medium"]) {
  return { watch: "▶", read: "Aa", practice: "♪", listen: "◉" }[medium];
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.dark },
  scroll: { backgroundColor: colors.paper },
  content: { paddingBottom: 110 },
  tabletContent: { alignSelf: "center", width: "100%", maxWidth: 900 },
  topbar: {
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.dark,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    transform: [{ rotate: "-3deg" }],
  },
  markText: { fontSize: 19, fontWeight: "800", color: colors.ink },
  brand: { color: colors.white, fontSize: 20, fontWeight: "800" },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e7a98b",
  },
  avatarText: { color: "#442a21", fontSize: 12, fontWeight: "800" },
  hero: { backgroundColor: "#ece8dd", padding: 24, gap: 24 },
  tabletHero: { flexDirection: "row", alignItems: "center" },
  heroCopy: { flex: 1 },
  kicker: {
    color: colors.purple,
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "800",
  },
  heroTitle: {
    color: colors.purple,
    fontSize: 42,
    lineHeight: 43,
    letterSpacing: -1.8,
    fontWeight: "600",
    marginTop: 13,
  },
  heroText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 22 },
  primary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryText: { color: colors.white, fontWeight: "800", fontSize: 12 },
  secondary: {
    minWidth: 116,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4cfc4",
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryText: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  progressRing: {
    alignSelf: "center",
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1ede4",
  },
  progressValue: { color: colors.ink, fontSize: 31, fontWeight: "500" },
  progressLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "700",
    marginTop: 3,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 18,
    gap: 16,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  stat: {
    minWidth: 150,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  statDetail: { color: colors.muted, fontSize: 9, marginTop: 3 },
  growth: { padding: 16, backgroundColor: colors.canvas, gap: 10 },
  tabletGrowth: { flexDirection: "row" },
  levelCard: {
    flex: 1,
    minHeight: 146,
    padding: 17,
    borderRadius: 19,
    backgroundColor: colors.dark,
  },
  levelKicker: {
    color: "#aaa79e",
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: "800",
  },
  levelTitle: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: "500",
    marginTop: 8,
  },
  xp: { color: colors.lime, fontSize: 11, fontWeight: "800", marginTop: 12 },
  xpTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#45443d",
    overflow: "hidden",
    marginTop: 9,
  },
  xpFill: { height: "100%", backgroundColor: colors.lime },
  levelFoot: { color: "#aaa79e", fontSize: 8, marginTop: 7 },
  badges: { flex: 1, flexDirection: "row", gap: 7 },
  badge: {
    flex: 1,
    minHeight: 112,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    padding: 12,
  },
  badgeEarned: { borderColor: "#b8d42d", backgroundColor: "#fcfff1" },
  badgeIcon: { fontSize: 23 },
  badgeTitle: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 9,
  },
  badgeDetail: { color: colors.muted, fontSize: 9, marginTop: 4 },
  earned: {
    color: "#66751d",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: "auto",
  },
  locked: { color: colors.muted },
  emptyBadge: {
    flex: 1,
    minHeight: 100,
    borderRadius: 17,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 28, color: colors.muted },
  pathHeader: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 18 },
  kickerDark: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "800",
  },
  pathTitle: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -1,
    fontWeight: "600",
    marginTop: 9,
  },
  pathList: { paddingHorizontal: 20 },
  techniqueRow: { flexDirection: "row", gap: 10 },
  stepRail: { width: 32, alignItems: "center" },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  stepDone: { backgroundColor: colors.dark },
  stepText: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  stepTextDone: { color: colors.white, fontSize: 14 },
  connector: {
    width: 1,
    flex: 1,
    minHeight: 18,
    backgroundColor: "#d9d4c8",
  },
  techniqueCard: {
    flex: 1,
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    padding: 15,
    marginBottom: 10,
    ...shadow,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  medium: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: "800",
    backgroundColor: "#edf5c4",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 11,
  },
  techniqueTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 11,
  },
  techniqueText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  meta: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  metaText: { color: colors.muted, fontSize: 9 },
  mastered: {
    color: colors.purple,
    backgroundColor: "#eee8ff",
    padding: 5,
    borderRadius: 7,
    fontSize: 8,
    fontWeight: "800",
    marginLeft: 9,
  },
  arrow: { marginLeft: "auto", fontSize: 19, color: colors.muted },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    flexDirection: "row",
    ...shadow,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  navIcon: { color: colors.muted, fontSize: 17 },
  navLabel: { color: colors.muted, fontSize: 9 },
  navActive: { color: colors.ink, fontWeight: "800" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20,19,17,.62)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.paper,
    padding: 22,
    paddingBottom: 34,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    backgroundColor: colors.line,
    marginBottom: 17,
  },
  close: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 23, color: colors.ink },
  lessonVisual: {
    height: 145,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  lessonIcon: { fontSize: 40, color: colors.ink },
  lessonMedium: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 10,
  },
  lessonTitle: {
    color: colors.ink,
    fontSize: 29,
    fontWeight: "800",
    marginTop: 8,
  },
  lessonText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
  },
  why: {
    flexDirection: "row",
    gap: 11,
    backgroundColor: colors.canvas,
    borderRadius: 14,
    padding: 14,
    marginVertical: 20,
  },
  whyIcon: { color: colors.purple, fontSize: 18 },
  whyTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  whyText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  masterButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  skipButton: { minHeight: 42, alignItems: "center", justifyContent: "center" },
  skipText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  celebrationBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(20,19,17,.78)",
  },
  confettiLayer: {
    position: "absolute",
    width: 12,
    height: 12,
    top: "34%",
    left: "50%",
    zIndex: 2,
  },
  confettiPiece: { position: "absolute", fontSize: 17, fontWeight: "900" },
  celebrationCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    padding: 30,
    backgroundColor: colors.paper,
    alignItems: "center",
  },
  bigBadge: {
    width: 82,
    height: 82,
    borderRadius: 23,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    transform: [{ rotate: "-3deg" }],
  },
  bigBadgeIcon: { fontSize: 40 },
  celebrationTitle: {
    color: colors.ink,
    fontSize: 35,
    fontWeight: "700",
    marginTop: 10,
  },
  celebrationText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  bonus: {
    color: colors.purple,
    fontSize: 18,
    fontWeight: "800",
    marginVertical: 20,
  },
});
