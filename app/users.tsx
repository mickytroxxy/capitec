import Icon from "@/components/ui/Icon";
import { colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import {
    deleteUser,
    getAllUsers,
    getPaymentsForAccount,
    updateTable,
} from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { setLoadingState } from "@/state/slices/loader";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    Modal,
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

export default function UsersScreen() {
  const { accountInfo } = useAuth();
  const dispatch = useDispatch();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load account modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loadAmount, setLoadAmount] = useState("");

  // Edit user modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBalance, setEditBalance] = useState("");

  // Transaction modal state
  const [transactionsVisible, setTransactionsVisible] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);

  const handleViewTransactions = async (user: any) => {
    setSelectedUser(user);
    dispatch(setLoadingState({ isloading: true, type: "spinner" }));
    if (user.accountNumber) {
      const payments = await getPaymentsForAccount(user.accountNumber);
      // Sort payments newest first
      payments.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
      const filteredPayments = payments?.filter(
        (p) => !p.statementDescription?.toLowerCase().includes("fee"),
      );
      setUserTransactions(filteredPayments);
    } else {
      setUserTransactions([]);
    }
    dispatch(setLoadingState({ isloading: false, type: "spinner" }));
    setTransactionsVisible(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    // Exclude the current admin from the list
    setUsers(data.filter((u) => u.id != accountInfo?.id));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleDeactivate = async (user: any) => {
    const action = user.active ? "Deactivate" : "Activate";
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.firstName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: user.active ? "destructive" : "default",
          onPress: async () => {
            dispatch(setLoadingState({ isloading: true, type: "spinner" }));
            await updateTable("users", user.id.toString(), {
              active: !user.active,
            });
            await fetchUsers();
            dispatch(setLoadingState({ isloading: false, type: "spinner" }));
          },
        },
      ],
    );
  };

  const handleDelete = async (user: any) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${user.firstName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            dispatch(setLoadingState({ isloading: true, type: "spinner" }));
            await deleteUser(user.id.toString());
            await fetchUsers();
            dispatch(setLoadingState({ isloading: false, type: "spinner" }));
          },
        },
      ],
    );
  };

  const handleLoadAccount = async () => {
    if (!selectedUser || !loadAmount) return;
    const amountNum = parseFloat(loadAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    setModalVisible(false);
    dispatch(setLoadingState({ isloading: true, type: "spinner" }));
    const newBalance = parseFloat(selectedUser.balance || 0) + amountNum;

    await updateTable("users", selectedUser.id.toString(), {
      balance: newBalance,
    });

    setLoadAmount("");
    setSelectedUser(null);
    await fetchUsers();
    dispatch(setLoadingState({ isloading: false, type: "spinner" }));
    Alert.alert(
      "Success",
      `R${amountNum.toFixed(2)} loaded to ${selectedUser.firstName}'s account.`,
    );
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    const balanceNum = parseFloat(editBalance);
    if (isNaN(balanceNum)) {
      Alert.alert("Invalid Balance", "Please enter a valid balance amount.");
      return;
    }

    setEditModalVisible(false);
    dispatch(setLoadingState({ isloading: true, type: "spinner" }));

    await updateTable("users", selectedUser.id.toString(), {
      firstName: editFirstName,
      lastName: editLastName,
      balance: balanceNum,
    });

    setSelectedUser(null);
    await fetchUsers();
    dispatch(setLoadingState({ isloading: false, type: "spinner" }));
    Alert.alert(
      "Success",
      `User details updated successfully.`,
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <Stack.Screen
        options={{
          title: "Manage Users",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingRight: 10 }}
            >
              <Icon name="arrow-left" type="Feather" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontFamily: Fonts.fontMedium, fontSize: 18 },
        }}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>All Users</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading users...</Text>
        ) : users.length === 0 ? (
          <Text style={styles.loadingText}>No users found.</Text>
        ) : (
          users.map((user, index) => (
            <View key={user.id || index} style={styles.userCard}>
              <View style={styles.userInfoRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.firstName?.charAt(0) || "U"}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={styles.userAcc}>
                    Acc: {user.accountNumber || "N/A"}
                  </Text>
                  <Text style={styles.userBalance}>
                    Balance: R{parseFloat(user.balance || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: user.active ? "#4caf50" : "#f44336" },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {user.active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleViewTransactions(user)}
                >
                  <Icon
                    name="clock"
                    type="Feather"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setSelectedUser(user);
                    setEditFirstName(user.firstName || "");
                    setEditLastName(user.lastName || "");
                    setEditBalance(user.balance?.toString() || "0");
                    setEditModalVisible(true);
                  }}
                >
                  <Icon
                    name="edit-2"
                    type="Feather"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setSelectedUser(user);
                    setLoadAmount("");
                    setModalVisible(true);
                  }}
                >
                  <Icon
                    name="plus-circle"
                    type="Feather"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleToggleDeactivate(user)}
                >
                  <Icon
                    name={user.active ? "user-x" : "user-check"}
                    type="Feather"
                    size={16}
                    color={user.active ? "#f57c00" : "#4caf50"}
                  />
                </TouchableOpacity>
                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(user)}
                >
                  <Icon
                    name="trash-2"
                    type="Feather"
                    size={16}
                    color="#d32f2f"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Transactions Modal */}
      <Modal
        visible={transactionsVisible}
        animationType="slide"
        onRequestClose={() => setTransactionsVisible(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f3f5f7" }}
          edges={["top", "bottom"]}
        >
          <View style={styles.transHeader}>
            <TouchableOpacity
              onPress={() => setTransactionsVisible(false)}
              style={{ padding: 10 }}
            >
              <Icon name="x" type="Feather" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.transTitle}>
              {selectedUser?.firstName}'s History
            </Text>
            <View style={{ width: 44 }} />
          </View>
          {userTransactions.length === 0 ? (
            <Text style={styles.loadingText}>No transactions found.</Text>
          ) : (
            <FlatList
              data={userTransactions}
              keyExtractor={(item, index) => index.toString()}
              style={{ flex: 1, padding: 16 }}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item: tx }) => (
                <View style={styles.transCard}>
                  <Text style={styles.transDesc}>
                    {tx.statementDescription || "Payment"}
                  </Text>
                  <Text
                    style={[
                      styles.transAmt,
                      {
                        color:
                          tx.senderAccount === selectedUser?.accountNumber
                            ? "#111"
                            : "#2e7d32",
                      },
                    ]}
                  >
                    {tx.senderAccount === selectedUser?.accountNumber
                      ? "-"
                      : ""}
                    R{parseFloat(tx.amount || 0).toFixed(2)}
                  </Text>
                  <Text style={styles.transDate}>
                    {new Date(tx.transactionDate).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {tx.notificationType && tx.notificationType !== "none" && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eee" }}>
                      <Text style={{ fontSize: 13, color: "#666", fontFamily: Fonts.fontMedium }}>
                        Notification: {tx.notificationType.toUpperCase()}
                      </Text>
                      {tx.notificationType === "email" && (
                        <Text style={{ fontSize: 13, color: "#111", marginTop: 4 }}>
                          {tx.notificationValue}
                        </Text>
                      )}
                      {tx.notificationType === "sms" && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 12 }}>
                          <Text style={{ fontSize: 13, color: "#111" }}>{tx.notificationValue}</Text>
                          <TouchableOpacity onPress={() => Linking.openURL(`tel:${tx.notificationValue}`)}>
                            <Icon name="phone" type="Feather" size={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${tx.notificationValue}`)}>
                            <Icon name="message-circle" type="Feather" size={16} color="#25D366" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setEditModalVisible(false)}
        />
        <View style={styles.modalCentered}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <Text style={styles.modalSubtitle}>
              Update details for {selectedUser?.firstName}.
            </Text>

            <TextInput
              style={[styles.modalInput, { marginBottom: 12 }]}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={editFirstName}
              onChangeText={setEditFirstName}
            />
            <TextInput
              style={[styles.modalInput, { marginBottom: 12 }]}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={editLastName}
              onChangeText={setEditLastName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Balance (R)"
              placeholderTextColor="#999"
              value={editBalance}
              onChangeText={setEditBalance}
              keyboardType="number-pad"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalActionCancel}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalActionCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionConfirm}
                onPress={handleEditUser}
              >
                <Text style={styles.modalActionConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Load Account Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.modalCentered}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Load Account</Text>
            <Text style={styles.modalSubtitle}>
              Enter amount to add to {selectedUser?.firstName}'s account.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Amount (R)"
              placeholderTextColor="#999"
              value={loadAmount}
              onChangeText={setLoadAmount}
              keyboardType="number-pad"
              autoFocus
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalActionCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalActionCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionConfirm}
                onPress={handleLoadAccount}
              >
                <Text style={styles.modalActionConfirmText}>Load</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7" },
  scroll: { padding: 16 },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.fontBold,
    color: colors.primary,
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: Fonts.fontRegular,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: Fonts.fontMedium,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
    color: "#111",
  },
  userAcc: {
    fontSize: 13,
    fontFamily: Fonts.fontRegular,
    color: "#666",
    marginTop: 2,
  },
  userBalance: {
    fontSize: 14,
    fontFamily: Fonts.fontMedium,
    color: "#111",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.fontMedium,
    color: "#555",
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontFamily: Fonts.fontMedium,
    color: colors.primary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: "#eee",
  },

  /* Modal Styles */
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.fontBold,
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
    color: "#111",
    marginBottom: 24,
    textAlign: "center",
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalActionCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  modalActionCancelText: {
    fontSize: 15,
    fontFamily: Fonts.fontMedium,
    color: "#555",
  },
  modalActionConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  modalActionConfirmText: {
    fontSize: 15,
    fontFamily: Fonts.fontMedium,
    color: "#fff",
  },

  /* Transaction Modal Styles */
  transHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transTitle: {
    fontSize: 18,
    fontFamily: Fonts.fontBold,
    color: "#111",
  },
  transCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  transDesc: {
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
    color: "#111",
  },
  transAmt: {
    fontSize: 16,
    fontFamily: Fonts.fontBold,
    marginTop: 4,
  },
  transDate: {
    fontSize: 12,
    fontFamily: Fonts.fontRegular,
    color: "#666",
    marginTop: 8,
  },
});
