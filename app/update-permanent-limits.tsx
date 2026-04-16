import Icon from "@/components/ui/Icon";
import { colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { loginApi, updateTable } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { setAccountInfo } from "@/state/slices/accountInfo";
import { setLoadingState } from "@/state/slices/loader";
import { showSuccess } from "@/state/slices/successSlice";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

type LimitItem = {
  label: string;
  maxLabel: string;
  max: number;
  key: string;
};

const LIMITS: LimitItem[] = [
  {
    label: "Cash withdrawals",
    maxLabel: "R5 000",
    max: 5000,
    key: "cashWithdrawals",
  },
  {
    label: "Card machine",
    maxLabel: "R250 000",
    max: 250000,
    key: "cardMachine",
  },
  {
    label: "Online/scan to pay",
    maxLabel: "R250 000",
    max: 250000,
    key: "onlineScanToPay",
  },
];

function formatRand(value: number): string {
  return "R" + value.toLocaleString("en-ZA").replace(/,/g, " ");
}

function parseRand(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

export default function UpdatePermanentLimitsScreen() {
  const { accountInfo } = useAuth();
  const dispatch = useDispatch();

  const [values, setValues] = useState<Record<string, number>>({
    cashWithdrawals: accountInfo?.limits?.cashWithdrawals ?? 5000,
    cardMachine: accountInfo?.limits?.cardMachine ?? 20000,
    onlineScanToPay: accountInfo?.limits?.onlineScanToPay ?? 5000,
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Limit validation errors
  const [limitErrors, setLimitErrors] = useState<Record<string, string>>({});

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleStartEdit = (key: string) => {
    setEditing(key);
    setEditText(values[key].toString());
  };

  const validateLimit = (key: string, value: number, max: number): string => {
    if (value > max) {
      return `Value cannot exceed ${formatRand(max)}`;
    }
    if (value <= 0) {
      return "Value must be greater than R0";
    }
    return "";
  };

  const handleEndEdit = (key: string, max: number) => {
    const numVal = parseRand(editText);
    const error = validateLimit(key, numVal, max);
    setLimitErrors((prev) => ({ ...prev, [key]: error }));

    // Still set the value so the user sees what they typed
    setValues((prev) => ({ ...prev, [key]: numVal }));
    setEditing(null);
  };

  // Check if any limit has a validation error
  const hasLimitErrors = Object.values(limitErrors).some((e) => e !== "");

  const handleUpdate = () => {
    // Re-validate all limits before showing PIN modal
    const newErrors: Record<string, string> = {};
    LIMITS.forEach((item) => {
      const err = validateLimit(item.key, values[item.key], item.max);
      if (err) newErrors[item.key] = err;
    });
    setLimitErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== "")) {
      return; // Don't open PIN modal if there are errors
    }

    setPin("");
    setPinError("");
    setShowPinModal(true);
  };

  const handlePinConfirm = async () => {
    if (!pin.trim()) {
      setPinError("Please enter your PIN");
      return;
    }

    // Validate PIN against stored PIN
    dispatch(setLoadingState({ isloading: true, type: "spinner" }));
    const pinResponse = await loginApi(accountInfo?.accountNumber || "", pin);
    if (pinResponse?.length === 0) {
      dispatch(setLoadingState({ isloading: false, type: "spinner" }));
      setPinError("Incorrect PIN. Please try again.");
      return;
    }

    // PIN is correct — close modal and show loader
    setShowPinModal(false);

    // Simulate processing delay
    setTimeout(async () => {
      try {
        const newLimits = {
          cashWithdrawals: values.cashWithdrawals,
          cardMachine: values.cardMachine,
          onlineScanToPay: values.onlineScanToPay,
        };

        // Update Firebase
        await updateTable("users", (accountInfo?.id as any)?.toString() || "", {
          limits: newLimits,
        });

        // Update Redux state
        dispatch(
          setAccountInfo({
            ...accountInfo!,
            limits: newLimits,
          }),
        );

        // Hide loader
        dispatch(setLoadingState({ isloading: false, type: "lock" }));

        // Show success and navigate
        dispatch(
          showSuccess({
            title: "Successful",
            message:
              "Your card limits have been updated, effective immediately",
            buttons: [
              {
                id: "done",
                title: "Done",
                variant: "primary",
                action: {
                  type: "replace",
                  payload: "/(tabs)/accounts",
                },
              },
            ],
          }),
        );

        router.replace("/success-status" as any);
      } catch (error) {
        dispatch(setLoadingState({ isloading: false, type: "lock" }));
        Alert.alert("Error", "Failed to update limits. Please try again.");
      }
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Update Permanent Limits",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingRight: 10 }}
            >
              <Icon name="arrow-left" type="Feather" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerAccent} />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerText}>
                Making a big purchase? Increase the temporary limit instead, it
                will automatically change back in 3 days.{"\n"}Easy and safe.
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/set-temporary-limits")}
              >
                <Text style={styles.bannerLink}>Increase temporary limit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section title */}
          <Text style={styles.sectionTitle}>Debit daily limits</Text>

          {/* Limit items */}
          <View style={styles.limitsCard}>
            {LIMITS.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.limitRow}
                  activeOpacity={0.7}
                  onPress={() => handleStartEdit(item.key)}
                >
                  <Text style={styles.limitLabel}>
                    {item.label} (max {item.maxLabel})
                  </Text>
                  {editing === item.key ? (
                    <TextInput
                      style={[
                        styles.limitInput,
                        limitErrors[item.key] ? styles.limitInputError : null,
                      ]}
                      value={editText}
                      onChangeText={(t) => {
                        setEditText(t);
                        // Validate in real-time as user types
                        const numVal = parseRand(t);
                        const error = validateLimit(item.key, numVal, item.max);
                        setLimitErrors((prev) => ({
                          ...prev,
                          [item.key]: error,
                        }));
                      }}
                      onBlur={() => handleEndEdit(item.key, item.max)}
                      keyboardType="number-pad"
                      autoFocus
                      selectTextOnFocus
                    />
                  ) : (
                    <Text style={styles.limitValue}>
                      {formatRand(values[item.key])}
                    </Text>
                  )}
                  {limitErrors[item.key] ? (
                    <Text style={styles.limitError}>
                      {limitErrors[item.key]}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.updateBtn}
              activeOpacity={0.85}
              onPress={handleUpdate}
            >
              <Text style={styles.updateBtnText}>Update</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── PIN Modal ── */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPinModal(false)}
        />
        <View style={styles.modalCentered}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Card Limits</Text>
            <Text style={styles.modalMessage}>
              Enter your app PIN to update these limits.
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                pinError ? styles.modalInputError : null,
              ]}
              placeholder="App PIN"
              placeholderTextColor="#111"
              value={pin}
              onChangeText={(t) => {
                setPin(t);
                if (pinError) setPinError("");
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              autoFocus
            />
            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => setShowPinModal(false)}
              >
                <Text style={styles.modalActionCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={handlePinConfirm}
              >
                <Text style={styles.modalActionConfirm}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* ── Info Banner ── */
  bannerCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    paddingLeft: 10,
    padding: 15,
  },
  bannerAccent: {
    width: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  bannerContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  bannerText: {
    fontFamily: Fonts.fontRegular,
    fontSize: 13.5,
    color: "#333",
    lineHeight: 20,
  },
  bannerLink: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 13.5,
    color: colors.primary,
    marginTop: 4,
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontFamily: Fonts.fontBold,
    fontSize: 16,
    color: "#111",
    marginTop: 28,
    marginBottom: 12,
    marginLeft: 16,
  },

  /* ── Limits Card ── */
  limitsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
  },
  limitRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  limitLabel: {
    fontFamily: Fonts.fontRegular,
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  limitValue: {
    fontFamily: Fonts.fontBold,
    fontSize: 18,
    color: "#111",
  },
  limitInput: {
    fontFamily: Fonts.fontBold,
    fontSize: 18,
    color: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
    minWidth: 100,
  },
  limitInputError: {
    borderBottomColor: "#E53E3E",
    color: "#E53E3E",
  },
  limitError: {
    color: "#E53E3E",
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 16,
  },

  /* ── Bottom Bar ── */
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#f5f7fa",
  },
  updateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  updateBtnText: {
    color: "#fff",
    fontFamily: Fonts.fontBold,
    fontSize: 17,
  },

  /* ── PIN Modal ── */
  modalBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 5,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: Fonts.fontBold,
    color: "#111",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: "#111",
    marginBottom: 18,
    lineHeight: 20,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontFamily: Fonts.fontRegular,
    fontSize: 16,
    paddingVertical: 8,
    color: "#111",
  },
  modalInputError: {
    borderBottomColor: "#E53E3E",
  },
  errorText: {
    color: "#E53E3E",
    fontFamily: Fonts.fontRegular,
    fontSize: 12,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 24,
  },
  modalActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  modalActionCancel: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 15,
    color: colors.primary,
  },
  modalActionConfirm: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 15,
    color: colors.primary,
  },
});
