import { Fonts } from "@/constants/Fonts";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const { width, height } = Dimensions.get("window");

// True organic face/egg shape with integrated ears
const W = width * 0.68;
const H = W * 1.35;
// The ears in the reference are extremely subtle notches.
const EAR_W = W * 0.07;
const EAR_H = H * 0.2;
const HEAD_WIDTH = W;
const HEAD_HEIGHT = H;

const FACE_PATH = `
  M 0 ${-H / 2}
  C ${W * 0.4} ${-H / 2}, ${W / 2} ${-H * 0.25}, ${W / 2} ${-EAR_H / 2}
  C ${W / 2 + EAR_W} ${-EAR_H / 2}, ${W / 2 + EAR_W} ${EAR_H / 2}, ${W * 0.48} ${EAR_H / 2}
  C ${W * 0.46} ${H * 0.35}, ${W * 0.22} ${H / 2}, 0 ${H / 2}
  C ${-W * 0.22} ${H / 2}, ${-W * 0.46} ${H * 0.35}, ${-W * 0.48} ${EAR_H / 2}
  C ${-W / 2 - EAR_W} ${EAR_H / 2}, ${-W / 2 - EAR_W} ${-EAR_H / 2}, ${-W / 2} ${-EAR_H / 2}
  C ${-W / 2} ${-H * 0.25}, ${-W * 0.4} ${-H / 2}, 0 ${-H / 2}
  Z
`;

// Brand colours
const CAP_BLUE = "#0071CE";
const CAP_TEAL = "#0D4F6E";
const CAP_GREEN = "#27AE60";
const CAP_RED = "#CC2222";
const SCREEN_BG = "#fff";
const VIEWPORT_BG = "#C8CBD1";

type Phase = "not_ready" | "detecting" | "ready" | "success";

type Props = {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function CapitecSelfieModal({
  visible,
  onSuccess,
  onCancel,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("not_ready");

  const faceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated values
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible) {
      setPhase("not_ready");
      borderAnim.setValue(0);
      scanLine.setValue(0);
      pulseAnim.setValue(1);
      scanRef.current?.stop();
      pulseRef.current?.stop();
      if (faceTimerRef.current) clearTimeout(faceTimerRef.current);
      return;
    }

    if (!permission?.granted) {
      requestPermission();
    }

    startAnimations();
    setPhase("detecting");

    return () => {
      scanRef.current?.stop();
      pulseRef.current?.stop();
      if (faceTimerRef.current) clearTimeout(faceTimerRef.current);
    };
  }, [visible, permission?.granted]);

  const phaseRef = useRef<Phase>("not_ready");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const handleValidFace = useCallback(() => {
    if (phaseRef.current === "detecting") {
      setPhase("ready");
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();

      if (faceTimerRef.current) clearTimeout(faceTimerRef.current);
      faceTimerRef.current = setTimeout(() => {
        setPhase("success");
        scanRef.current?.stop();
        pulseRef.current?.stop();
        setTimeout(() => onSuccess(), 700);
      }, 1500);
    }
  }, [borderAnim, onSuccess]);

  function startAnimations() {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.012,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    scanRef.current = scan;
    pulseRef.current = pulse;
    scan.start();
    pulse.start();
  }

  const animBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CAP_RED, CAP_GREEN],
  });

  const scanlineY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [-HEAD_HEIGHT / 2 + 10, HEAD_HEIGHT / 2 - 10],
  });

  const cameraReady = permission?.granted && visible;
  const borderColorValue =
    phase === "ready" || phase === "success" ? CAP_GREEN : CAP_RED;

  const instructionLabel =
    phase === "success"
      ? ""
      : phase === "ready"
        ? "Hold\nstill..."
        : "Position\nyour\nface";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.root}>
        {/* ── TOP WHITE BAR ── */}
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Take a selfie</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onCancel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ── LOGO ROW ── */}
        <View style={styles.logoRow}>
          <CapitecLogoFull />
        </View>

        {/* ── VIEWPORT / CAMERA AREA ── */}
        <View style={styles.viewportArea}>
          {/* Camera feed fills viewport underneath the mask */}
          {cameraReady && (
            <CameraView style={StyleSheet.absoluteFill} facing="front" />
          )}

          <Animated.View
            style={[styles.headWrapper, { transform: [{ scale: pulseAnim }] }]}
          >
            {/* The True Egg Face Mask */}
            <Svg
              width={width * 2}
              height={height * 2}
              style={{
                position: "absolute",
                top: HEAD_HEIGHT / 2 - height,
                left: HEAD_WIDTH / 2 - width,
              }}
            >
              <Defs>
                <ClipPath id="faceClip">
                  <Path d={FACE_PATH} />
                </ClipPath>
              </Defs>
              <G x={width} y={height}>
                {/* 1. White mask outside the face */}
                <Path
                  d={`M -3000 -3000 H 3000 V 3000 H -3000 Z ${FACE_PATH}`}
                  fill="#fff"
                  fillRule="evenodd"
                />

                {/* 2. Navy tint inside hole */}
                <Path d={FACE_PATH} fill="rgba(11,26,44, 0.85)" />

                {/* 3. Scan line natively clipped to face curvature using SVG clipPath */}
                {phase !== "success" && (
                  <AnimatedRect
                    x={-W}
                    y={scanlineY}
                    width={W * 2}
                    height={3}
                    fill={
                      phase === "ready" ? CAP_GREEN : "rgba(255,255,255,0.7)"
                    }
                    clipPath="url(#faceClip)"
                  />
                )}

                {/* 4. Flawless continuous stroke around the edge and ears */}
                <AnimatedPath
                  d={FACE_PATH}
                  stroke={animBorderColor}
                  strokeWidth={5}
                  fill="none"
                />
              </G>
            </Svg>

            {/* Instruction text inside oval */}
            {phase !== "success" && (
              <View style={styles.instructionBox}>
                <Text
                  style={[
                    styles.instructionText,
                    { color: phase === "ready" ? CAP_GREEN : "#fff" },
                  ]}
                >
                  {instructionLabel}
                </Text>
              </View>
            )}

            {/* Success tick */}
            {phase === "success" && (
              <View style={styles.successTick}>
                <Text style={styles.tickText}>✓</Text>
              </View>
            )}
          </Animated.View>

          {/* ── FULL-WIDTH BANNER ── sits safely atop entire viewportArea */}
          {phase !== "success" && (
            <View style={styles.banner}>
              <CapitecLogoFull light />
              <Text style={styles.bannerSub}>Banking App Selfie</Text>
            </View>
          )}

          {/* Status dot + label */}
          {/* <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: borderColorValue }]}
            />
            <Text style={[styles.statusLabel, { color: borderColorValue }]}>
              {phase === "not_ready"
                ? "Align your face"
                : phase === "detecting"
                  ? "Looking for face..."
                  : phase === "ready"
                    ? "Face detected — hold still"
                    : "Identity verified ✓"}
            </Text>
          </View> */}

          {/* Permission fallback */}
          {!permission?.granted && (
            <View style={styles.permissionBox}>
              <Text style={styles.permissionText}>
                Camera access is required for selfie verification.
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={styles.grantBtn}
              >
                <Text style={styles.grantBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── BOTTOM WHITE BAR ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={handleValidFace}>
            <CapitecLogoFull />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Full Capitec logo (icon.png + wordmark) ──────────────────────────────────
function CapitecLogoFull({ light = false }: { light?: boolean }) {
  const textColor = light ? "#fff" : CAP_BLUE;
  return (
    <View style={logoStyles.wrap}>
      <Image
        source={
          light
            ? require("@/assets/images/capitec-logo-white.png")
            : require("@/assets/images/capitec-logo.png")
        }
        style={logoStyles.icon}
        resizeMode="contain"
      />
    </View>
  );
}

const logoStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 230, height: 60 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  // ── Top bar ──
  topBar: {
    backgroundColor: "#fff",
    paddingTop: 48,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 16,
    color: "#111",
  },
  closeBtn: {
    position: "absolute",
    right: 18,
    top: 48,
    padding: 4,
  },
  closeX: {
    fontSize: 16,
    color: "#888",
    fontFamily: Fonts.fontRegular,
  },

  // ── Logo row (between top bar and camera) ──
  logoRow: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 6,
  },

  // ── Camera viewport ──
  viewportArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden", // Crucial: prevents the massive absolute SVG mask from blanketing over the header and bottom logos!
  },

  headWrapper: {
    width: HEAD_WIDTH,
    height: HEAD_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end", // forces content cleanly into lower jaw
  },

  // Banner positioned securely intersecting the top upper half of the face
  banner: {
    position: "absolute",
    top: "22%",
    width: "100%",
    backgroundColor: "rgba(13, 79, 110, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
    zIndex: 10,
  },
  bannerSub: {
    fontFamily: Fonts.fontBold,
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // Instruction text in lower part of oval
  instructionBox: {
    zIndex: 5,
    alignItems: "center",
    paddingBottom: 100,
  },
  instructionText: {
    fontFamily: Fonts.fontBold,
    fontSize: 34,
    lineHeight: 42,
    textAlign: "center",
  },

  // Success tick
  successTick: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CAP_GREEN,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    marginBottom: 40,
  },
  tickText: { color: "#fff", fontSize: 42, fontFamily: Fonts.fontBold },

  // Status row below oval
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: Fonts.fontSemiBold, fontSize: 13 },

  // Permission
  permissionBox: {
    marginTop: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  permissionText: {
    textAlign: "center",
    color: "#555",
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
  },
  grantBtn: {
    backgroundColor: CAP_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  grantBtnText: { color: "#fff", fontFamily: Fonts.fontSemiBold, fontSize: 14 },

  // ── Bottom white bar ──
  bottomBar: {
    backgroundColor: "#fff",
    paddingTop: 18,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 0,
  },

  hiddenTrigger: {
    width: "100%",
    height: 22,
    backgroundColor: "transparent",
    marginTop: 6,
  },
});
