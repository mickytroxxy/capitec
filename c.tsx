import { Fonts } from "@/constants/Fonts";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    useCameraDevice,
    useCameraPermission,
} from "react-native-vision-camera";
import {
    Face,
    FaceDetectionOptions,
    Camera as VisionCamera,
} from "react-native-vision-camera-face-detector";

const { width } = Dimensions.get("window");

// Head shape dimensions
const HEAD_WIDTH = width * 0.7;
const HEAD_HEIGHT = HEAD_WIDTH * 1.28;
const EAR_W = HEAD_WIDTH * 0.085;
const EAR_H = EAR_W * 1.6;

// Brand colours
const CAP_BLUE = "#0071CE";
const CAP_GREEN = "#27AE60";
const CAP_RED = "#E53E3E";

// Screen background — light grey (as requested)
const SCREEN_BG = "#F0F2F5";
// Viewport area behind the oval — slightly darker grey
const VIEWPORT_BG = "#D8DCE3";

type Phase = "not_ready" | "detecting" | "ready" | "success";

type Props = {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export function contains({
  outside,
  inside,
}: {
  outside: any;
  inside: any;
}): boolean {
  const outsideMaxX = outside.minX + outside.width;
  const insideMaxX = inside.minX + inside.width;

  const outsideMaxY = outside.minY + outside.height;
  const insideMaxY = inside.minY + inside.height;

  if (inside.minX < outside.minX) {
    return false;
  }
  if (insideMaxX > outsideMaxX) {
    return false;
  }
  if (inside.minY < outside.minY) {
    return false;
  }
  if (insideMaxY > outsideMaxY) {
    return false;
  }

  return true;
}

const PREVIEW_SIZE = width > 380 ? 360 : 340;
const PREVIEW_RECT = {
  minX: (width - PREVIEW_SIZE) / 2,
  minY: 65,
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
};
export default function CapitecSelfieModal({
  visible,
  onSuccess,
  onCancel,
}: Props) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const [phase, setPhase] = useState<Phase>("not_ready");

  // Timer for auto-progressing through phases
  const faceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated values
  const borderAnim = useRef(new Animated.Value(0)).current; // 0 = red, 1 = green
  const scanLine = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const cameraRef = useRef<any>(null);
  const [instructions, setInstructions] = useState<{
    status: boolean;
    text: string;
  }>({ status: false, text: "Position your face in the circle and then" });
  const requestCamPermission = async () => {
    await requestPermission();
  };

  // Reset all state when modal opens/closes
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

    // Request camera permission on first open
    if (!hasPermission) {
      requestCamPermission();
    }

    startAnimations();
    // Initially just "detecting"
    setPhase("detecting");

    return () => {
      scanRef.current?.stop();
      pulseRef.current?.stop();
      if (faceTimerRef.current) clearTimeout(faceTimerRef.current);
    };
  }, [visible, hasPermission]);

  // Keep track of phase linearly to avoid stale closures in handleFacesDetection
  const phaseRef = useRef<Phase>("not_ready");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const handleInvalidFace = useCallback(
    (text: string) => {
      setInstructions((prev) =>
        prev.text !== text || prev.status !== false
          ? { status: false, text }
          : prev,
      );
      if (phaseRef.current === "ready") {
        setPhase("detecting");
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }).start();
        if (faceTimerRef.current) clearTimeout(faceTimerRef.current);
      }
    },
    [borderAnim],
  );

  const handleValidFace = useCallback(() => {
    const text = "Keep the device still and perform the following actions:";
    setInstructions((prev) =>
      prev.text !== text || prev.status !== true
        ? { status: true, text }
        : prev,
    );

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

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    landmarkMode: "all",
    classificationMode: "all",
  }).current;

  const handleFacesDetection = useCallback(
    (faces: Face[]) => {
      // Do nothing if already success or not_ready
      if (phaseRef.current === "success" || phaseRef.current === "not_ready")
        return;

      if (faces.length !== 1) {
        handleInvalidFace("Position your face in the circle and then");
        return;
      }
      const face = faces[0];
      const faceRect = {
        minX: face.bounds.x,
        minY: face.bounds.y,
        width: face.bounds.width,
        height: face.bounds.height,
      };
      const edgeOffset = 65;
      const faceRectSmaller = {
        width: faceRect.width - edgeOffset,
        height: faceRect.height - edgeOffset,
        minY: faceRect.minY + edgeOffset / 2,
        minX: faceRect.minX + edgeOffset / 2,
      };
      const previewContainsFace = contains({
        outside: PREVIEW_RECT,
        inside: faceRectSmaller,
      });

      if (!previewContainsFace && Platform.OS === "android") {
        handleInvalidFace("Position your face in the circle and then");
        return;
      }

      const faceMaxSize = PREVIEW_SIZE - 120;

      if (
        faceRect.width >= faceMaxSize &&
        faceRect.height >= faceMaxSize &&
        Platform.OS === "android"
      ) {
        handleInvalidFace("You're too close. Hold the device further and then");
        return;
      }

      const isValid =
        previewContainsFace &&
        !(faceRect.width >= faceMaxSize && faceRect.height >= faceMaxSize);

      if (isValid) {
        handleValidFace();
      } else {
        handleInvalidFace("Position your face in the circle and then");
      }
    },
    [handleInvalidFace, handleValidFace],
  );
  function startAnimations() {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 1500,
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
          toValue: 1.025,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
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

  const borderColorValue =
    phase === "ready" || phase === "success" ? CAP_GREEN : CAP_RED;

  const scanlineY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [-HEAD_HEIGHT / 2 + 10, HEAD_HEIGHT / 2 - 10],
  });

  const instructionText =
    phase === "not_ready" || phase === "detecting"
      ? "Hold\nphone\nupright"
      : phase === "ready"
        ? "Face\ndetected"
        : "";

  const statusText =
    phase === "not_ready"
      ? "Align your face in the oval"
      : phase === "detecting"
        ? "Detecting face..."
        : phase === "ready"
          ? "Hold still..."
          : "Verified ✓";

  const cameraReady = hasPermission && visible && device != null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.root}>
        {/* ── TOP BAR ── */}
        <View style={styles.topBar}>
          <Text style={styles.takeText}>Take a selfie</Text>
          <CapitecLogo />
        </View>

        {/* ── VIEWPORT ── */}
        <View style={styles.viewportArea}>
          <Animated.View
            style={[styles.headWrapper, { transform: [{ scale: pulseAnim }] }]}
          >
            {/* Main oval — rendered AFTER ears so it paints on top */}
            {/* Left ear — behind oval */}
            <Animated.View
              style={[
                styles.ear,
                styles.earLeft,
                { borderColor: animBorderColor },
              ]}
            />
            {/* Right ear — behind oval */}
            <Animated.View
              style={[
                styles.ear,
                styles.earRight,
                { borderColor: animBorderColor },
              ]}
            />

            {/* Face oval — on top; covers inner half of ears */}
            <Animated.View
              style={[styles.headOval, { borderColor: animBorderColor }]}
            >
              {/* Camera feed fills the oval */}
              {cameraReady && (
                <VisionCamera
                  faceDetectionCallback={handleFacesDetection}
                  faceDetectionOptions={faceDetectionOptions}
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device!}
                  enableLocation
                  enableZoomGesture
                  isActive={phase !== "success"}
                  photo
                  video
                  audio
                />
              )}

              {/* Dark tint layer so text is readable over camera */}
              <View style={styles.cameraTint} />

              {/* Scan line — only while detecting */}
              {phase !== "success" && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      backgroundColor: phase === "ready" ? CAP_GREEN : CAP_RED,
                      transform: [{ translateY: scanlineY }],
                    },
                  ]}
                />
              )}

              {/* Success tick */}
              {phase === "success" && (
                <View style={styles.successTick}>
                  <Text style={styles.tickText}>✓</Text>
                </View>
              )}

              {/* Me: label */}
              <View style={styles.meLabel}>
                <Text style={styles.meLabelText}>Me:</Text>
              </View>

              {/* Instruction text */}
              {phase !== "success" && (
                <View style={styles.instructionBox} pointerEvents="none">
                  <Text
                    style={[
                      styles.instructionText,
                      { color: borderColorValue },
                    ]}
                  >
                    {instructionText}
                  </Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>

          {/* Status hint */}
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: borderColorValue }]}
            />
            <Text style={[styles.statusText, { color: borderColorValue }]}>
              {statusText}
            </Text>
          </View>

          {/* Permission denied fallback */}
          {!hasPermission && (
            <View style={styles.permissionBox}>
              <Text style={styles.permissionText}>
                Camera access is required for selfie verification.
              </Text>
              <TouchableOpacity
                onPress={requestCamPermission}
                style={styles.grantBtn}
              >
                <Text style={styles.grantBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── BOTTOM BAR ── */}
        <View style={styles.bottomBar}>
          <CapitecLogo />
          <Text style={styles.bankingAppText}>Banking App Selfie</Text>

          {phase !== "success" && (
            <View style={styles.progressRow}>
              {/* seg 1: always coloured */}
              <View
                style={[styles.progressSegment, { backgroundColor: CAP_RED }]}
              />
              {/* seg 2: green once detecting */}
              <View
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor:
                      phase === "detecting" || phase === "ready"
                        ? CAP_GREEN
                        : "#ccc",
                  },
                ]}
              />
              {/* seg 3: green once ready */}
              <View
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: phase === "ready" ? CAP_GREEN : "#ccc",
                  },
                ]}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CapitecLogo() {
  return (
    <View style={logoStyles.wrap}>
      <View style={logoStyles.iconBox}>
        <Text style={logoStyles.iconText}>C</Text>
      </View>
      <Text style={logoStyles.wordCapitec}>CAPITEC</Text>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: CAP_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: "#fff", fontFamily: Fonts.fontBold, fontSize: 14 },
  wordCapitec: {
    color: CAP_BLUE,
    fontFamily: Fonts.fontBold,
    fontSize: 16,
    letterSpacing: 1,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SCREEN_BG },

  // Top bar
  topBar: {
    backgroundColor: "#fff",
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  takeText: { fontFamily: Fonts.fontSemiBold, fontSize: 16, color: "#222" },

  // Banner
  bannerWrap: {
    backgroundColor: "#fff",
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  banner: {
    backgroundColor: "#EFEFEF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  bannerText: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 13,
    color: "#222",
    textAlign: "center",
    fontStyle: "italic",
  },

  // Viewport — light grey surround
  viewportArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: VIEWPORT_BG,
  },

  // ── Head wrapper (holds oval + floating ears) ──
  headWrapper: {
    width: HEAD_WIDTH,
    height: HEAD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  // Ears — sit BEHIND the oval (zIndex 0).
  // The face oval (zIndex 2) paints over the inner half of each ear,
  // so only the outer bump is visible — classic childhood drawing look.
  ear: {
    position: "absolute",
    width: EAR_W,
    height: EAR_H,
    borderRadius: EAR_W / 2,
    borderWidth: 3.5, // matches oval border thickness
    backgroundColor: VIEWPORT_BG, // blends with surround; no inner fill visible
    top: (HEAD_HEIGHT - EAR_H) / 2, // vertically centred on the face
    zIndex: 0, // behind everything
  },
  // Each ear overlaps the oval by ~60% of its width so only the outer bump shows
  earLeft: { left: -(EAR_W * 0.4) },
  earRight: { right: -(EAR_W * 0.4) },

  // Main oval — camera lives here; zIndex 2 so it covers ear inner edges
  headOval: {
    position: "absolute",
    width: HEAD_WIDTH,
    height: HEAD_HEIGHT,
    borderRadius: HEAD_WIDTH / 2,
    borderWidth: 3.5,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    zIndex: 2,
  },

  // Slight dark tint over camera so overlays are readable
  cameraTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 2,
  },

  // Scan line
  scanLine: {
    position: "absolute",
    left: 14,
    right: 14,
    height: 2,
    opacity: 0.8,
    borderRadius: 2,
    zIndex: 3,
  },

  // Success
  successTick: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: CAP_GREEN,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  tickText: { color: "#fff", fontSize: 38, fontFamily: Fonts.fontBold },

  // Me: label
  meLabel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 4,
  },
  meLabelText: { color: "#fff", fontFamily: Fonts.fontSemiBold, fontSize: 12 },

  // Instructions
  instructionBox: {
    zIndex: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontFamily: Fonts.fontBold,
    fontSize: 30,
    lineHeight: 40,
    textAlign: "center",
  },

  // Status hint below oval
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusText: { fontFamily: Fonts.fontSemiBold, fontSize: 13 },

  // Permission fallback
  permissionBox: {
    marginTop: 16,
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

  // Bottom bar
  bottomBar: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 34,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  bankingAppText: {
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    color: "#555",
    letterSpacing: 0.5,
  },

  // 3-segment progress bar
  progressRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  progressSegment: { width: 50, height: 4, borderRadius: 2 },

  cancelBtn: {
    marginTop: 8,
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: CAP_BLUE,
  },
  cancelText: { color: CAP_BLUE, fontFamily: Fonts.fontSemiBold, fontSize: 15 },
});
