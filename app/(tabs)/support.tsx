import Icon from "@/components/ui/Icon";
import { Fonts } from "@/constants/Fonts";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SupportItem = {
  title: string;
  iconName: string;
  iconType: any;
  isAvailable: boolean;
  statusText: string;
  statusDesc?: string;
  route?: string;
};

const supportItems: SupportItem[] = [
  {
    title: "General enquiries",
    iconName: "file-document-outline",
    iconType: "MaterialCommunityIcons",
    isAvailable: true,
    statusText: "Available",
    route: "/call",
  },
  {
    title: "Fraud or stopping a card",
    iconName: "file-cancel-outline",
    iconType: "MaterialCommunityIcons",
    isAvailable: true,
    statusText: "Available",
    route: "/call",
  },
  {
    title: "Repay loan",
    iconName: "cash-refund",
    iconType: "MaterialCommunityIcons",
    isAvailable: false,
    statusText: "Not available",
    statusDesc: " - You are not in arrears",
  },
  {
    title: "Applying for credit",
    iconName: "file-document-outline",
    iconType: "MaterialCommunityIcons",
    isAvailable: true,
    statusText: "Available",
    route: "/call",
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const handlePressCard = (item: SupportItem) => {
    if (item.isAvailable && item.route) {
      setSelectedTopic(item.title);
      setSelectedRoute(item.route);
      setModalVisible(true);
    }
  };

  const handleContinue = () => {
    setModalVisible(false);
    if (selectedRoute) {
      router.push({
        pathname: selectedRoute as any,
        params: { topic: selectedTopic },
      });
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {supportItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={item.isAvailable ? 0.7 : 1}
            onPress={() => handlePressCard(item)}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={item.iconName}
                type={item.iconType}
                size={44}
                color="#3dc1f5ff"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: item.isAvailable ? "#79A736" : "#4A5E6D",
                    },
                  ]}
                >
                  <View style={styles.statusInnerDot} />
                </View>
                <Text style={styles.statusTextWrapper}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.isAvailable ? "#79A736" : "#4A5E6D" },
                    ]}
                  >
                    {item.statusText}
                  </Text>
                  {item.statusDesc && (
                    <Text style={styles.statusDescText}>{item.statusDesc}</Text>
                  )}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Disclaimer Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require("@/assets/images/in-app-call.png")}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>
              You are about to make a free in-app call
            </Text>
            <Text style={styles.modalSub}>
              Would you like to continue with your call to a{" "}
              <Text style={{ fontFamily: Fonts.fontBold }}>
                Client Care agent?
              </Text>
            </Text>
            <Text style={styles.modalFinePrint}>
              You will not be charged for this call
            </Text>

            <View style={styles.modalDivider} />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleContinue}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingTop: 24,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.fontRegular,
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  statusInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  statusTextWrapper: {
    flex: 1,
    fontSize: 13,
  },
  statusText: {
    fontFamily: Fonts.fontBold,
  },
  statusDescText: {
    fontFamily: Fonts.fontRegular,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)", // Matching reference overlay darkness
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    paddingTop: 30,
    alignItems: "center",
  },
  modalImage: {
    width: 220,
    height: 160,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Fonts.fontBold,
    fontSize: 17,
    color: "#344555",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modalSub: {
    fontFamily: Fonts.fontRegular,
    fontSize: 15,
    color: "#4A5E6D",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  modalFinePrint: {
    fontFamily: Fonts.fontRegular,
    fontSize: 13,
    color: "#666",
    marginBottom: 25,
  },
  modalDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E5E5",
    opacity: 0.8,
  },
  modalButtonsRow: {
    flexDirection: "row",
    width: "100%",
    height: 60,
  },
  modalButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: Fonts.fontBold,
    fontSize: 16,
    color: "#0071CE",
    letterSpacing: 0.2,
  },
});
