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
    maxLabel: "R10 000",
    max: 10000,
    key: "cashWithdrawals",
  },
  {
    label: "Card machine",
    maxLabel: "R1 000 000",
    max: 1000000,
    key: "cardMachine",
  },
  {
    label: "Online/scan to pay",
    maxLabel: "R1 000 000",
    max: 1000000,
    key: "onlineScanToPay",
  },
];

function formatRand(value: number): string {
  return "R " + value.toLocaleString("en-ZA").replace(/,/g, " ");
}

function parseRand(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

export default function SetTemporaryLimitsScreen() {
  const { accountInfo } = useAuth();
  const dispatch = useDispatch();

  const permanentLimits: Record<string, number> = {
    cashWithdrawals: accountInfo?.limits?.cashWithdrawals ?? 5000,
    cardMachine: accountInfo?.limits?.cardMachine ?? 20000,
    onlineScanToPay: accountInfo?.limits?.onlineScanToPay ?? 5000,
  };

  const [values, setValues] = useState<Record<string, number>>({
    cashWithdrawals: permanentLimits.cashWithdrawals,
    cardMachine: permanentLimits.cardMachine,
    onlineScanToPay: permanentLimits.onlineScanToPay,
  });

  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    cashWithdrawals: true,
    cardMachine: true,
    onlineScanToPay: true,
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [limitErrors, setLimitErrors] = useState<Record<string, string>>({});
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Expiration date (3 days from now)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  const expiresText = `Expires on ${futureDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} at midnight`;

  const handleStartEdit = (key: string) => {
    if (!enabled[key]) return;
    setEditing(key);
    setEditText(values[key].toString());
  };

  const validateLimit = (key: string, value: number, max: number): string => {
    if (value > max) {
      return `Value cannot exceed ${formatRand(max)}`;
    }
    if (value <= 0) {
      return "Value must be greater than R 0";
    }
    if (value === permanentLimits[key]) {
      return "Limit cannot be the same as permanent limit";
    }
    return "";
  };

  const handleEndEdit = (key: string, max: number) => {
    const numVal = parseRand(editText);
    const error = validateLimit(key, numVal, max);
    setLimitErrors((prev) => ({ ...prev, [key]: error }));
    setValues((prev) => ({ ...prev, [key]: numVal }));
    setEditing(null);
  };

  const toggleCheckbox = (key: string) => {
    setEnabled((prev) => {
      const isNowEnabled = !prev[key];
      if (!isNowEnabled && limitErrors[key]) {
        // Clear error if disabling
        setLimitErrors((errs) => ({ ...errs, [key]: "" }));
      }
      return { ...prev, [key]: isNowEnabled };
    });
  };

  const handleSet = () => {
    const newErrors: Record<string, string> = {};
    let hasValidationError = false;
    let anyEnabled = false;

    LIMITS.forEach((item) => {
      if (enabled[item.key]) {
        anyEnabled = true;
        const err = validateLimit(item.key, values[item.key], item.max);
        if (err) {
          newErrors[item.key] = err;
          hasValidationError = true;
        }
      }
    });

    setLimitErrors(newErrors);

    if (hasValidationError) {
      return;
    }

    if (!anyEnabled) {
      Alert.alert(
        "No limits selected",
        "Please select at least one limit to apply temporarily.",
      );
      return;
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

    dispatch(setLoadingState({ isloading: true, type: "spinner" }));

    try {
      const pinResponse = await loginApi(accountInfo?.accountNumber || "", pin);

      if (pinResponse?.length === 0) {
        dispatch(setLoadingState({ isloading: false, type: "spinner" }));
        setPinError("Incorrect PIN. Please try again.");
        return;
      }

      setShowPinModal(false);

      setTimeout(async () => {
        try {
          const newTempLimits = {
            cashWithdrawals: enabled.cashWithdrawals
              ? values.cashWithdrawals
              : undefined,
            cardMachine: enabled.cardMachine ? values.cardMachine : undefined,
            onlineScanToPay: enabled.onlineScanToPay
              ? values.onlineScanToPay
              : undefined,
            expiresAt: futureDate.getTime(),
          };

          // Update Firebase with temporary limits
          await updateTable(
            "users",
            (accountInfo?.id as any)?.toString() || "",
            {
              temporaryLimits: newTempLimits,
            },
          );

          // Update Redux state
          dispatch(
            setAccountInfo({
              ...accountInfo!,
              temporaryLimits: newTempLimits,
            } as any),
          );

          dispatch(setLoadingState({ isloading: false, type: "lock" }));

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
          Alert.alert(
            "Error",
            "Failed to update temporary limits. Please try again.",
          );
        }
      }, 3000);
    } catch (error) {
      dispatch(setLoadingState({ isloading: false, type: "spinner" }));
      Alert.alert("Error", "A network error occurred. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Set Temporary Limits",
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
          <Text style={styles.sectionTitle}>Debit daily limits</Text>

          <View style={styles.limitsCard}>
            {LIMITS.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.limitRow}>
                  {/* Top section with title, subtitle, and checkbox */}
                  <View style={styles.limitHeader}>
                    <View style={styles.limitTitles}>
                      <Text style={styles.limitTitle}>{item.label}</Text>
                      {enabled[item.key] && (
                        <Text style={styles.limitSubtitle}>{expiresText}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleCheckbox(item.key)}
                      style={[
                        styles.checkbox,
                        enabled[item.key] && styles.checkboxActive,
                      ]}
                    >
                      {enabled[item.key] && (
                        <Icon
                          name="check"
                          type="Feather"
                          size={14}
                          color="#fff"
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {enabled[item.key] && (
                    <>
                      <View style={styles.innerSeparator} />

                      {/* Value Section */}
                      <TouchableOpacity
                        style={styles.valueContainer}
                        activeOpacity={0.7}
                        onPress={() => handleStartEdit(item.key)}
                      >
                        <Text style={styles.amountLabel}>
                          Amount (max {item.maxLabel})
                        </Text>
                        {editing === item.key ? (
                          <TextInput
                            style={[
                              styles.limitInput,
                              limitErrors[item.key]
                                ? styles.limitInputError
                                : null,
                            ]}
                            value={editText}
                            onChangeText={(t) => {
                              setEditText(t);
                              const numVal = parseRand(t);
                              setValues((prev) => ({
                                ...prev,
                                [item.key]: numVal,
                              }));
                              const error = validateLimit(
                                item.key,
                                numVal,
                                item.max,
                              );
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
                    </>
                  )}
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.bottomBar}>
            <Text style={styles.footerText}>
              A temporary limit will replace a permanent limit until it
              automatically expires after 3 days.
            </Text>
            <TouchableOpacity
              style={styles.updateBtn}
              activeOpacity={0.85}
              onPress={handleSet}
            >
              <Text style={styles.updateBtnText}>Set</Text>
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

  /* ── Section Title ── */
  sectionTitle: {
    fontFamily: Fonts.fontBold,
    fontSize: 15,
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },

  /* ── Limits Card ── */
  limitsCard: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  limitRow: {
    paddingVertical: 16,
  },
  limitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  limitTitles: {
    flex: 1,
    paddingRight: 12,
  },
  limitTitle: {
    fontFamily: Fonts.fontRegular,
    fontSize: 15,
    color: "#111",
  },
  limitSubtitle: {
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  innerSeparator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  valueContainer: {
    paddingHorizontal: 16,
  },
  amountLabel: {
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  limitValue: {
    fontFamily: Fonts.fontBold,
    fontSize: 16,
    color: "#111",
  },
  limitValueDisabled: {
    color: "#999",
  },
  limitInput: {
    fontFamily: Fonts.fontBold,
    fontSize: 16,
    color: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
    minWidth: 100,
  },
  limitInputError: {
    borderBottomColor: "#BD1C1C",
    color: "#BD1C1C",
  },
  limitError: {
    color: "#BD1C1C",
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    marginTop: 6,
  },
  separator: {
    height: 8,
    backgroundColor: "#f5f7fa",
  },

  /* ── Bottom Bar ── */
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  footerText: {
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  updateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  updateBtnText: {
    color: "#fff",
    fontFamily: Fonts.fontBold,
    fontSize: 16,
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
    borderRadius: 4,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalTitle: {
    fontSize: 16,
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
    borderBottomColor: "#BD1C1C",
  },
  errorText: {
    color: "#BD1C1C",
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
    fontSize: 14,
    color: colors.primary,
  },
  modalActionConfirm: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 14,
    color: colors.primary,
  },
});
