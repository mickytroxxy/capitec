import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Bell, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';

const dummyMessages = [
  {
    id: 1,
    title: 'Payment Successful',
    message: 'Your payment of R250.00 to John Doe was successful.',
    time: '2 min ago',
    type: 'success',
    read: false
  },
  {
    id: 2,
    title: 'Low Balance Alert',
    message: 'Your Global One account balance is below R100.00',
    time: '1 hour ago',
    type: 'warning',
    read: false
  },
  {
    id: 3,
    title: 'New Feature Available',
    message: 'Scan to Pay is now available! Try it out today.',
    time: '2 days ago',
    type: 'info',
    read: true
  },
  {
    id: 4,
    title: 'Monthly Statement',
    message: 'Your January statement is ready for download.',
    time: '3 days ago',
    type: 'info',
    read: true
  },
];

export default function MessagesScreen() {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'warning':
        return <AlertCircle size={20} color="#FF9800" />;
      case 'info':
      default:
        return <Info size={20} color="#007ACC" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#E8F5E8';
      case 'warning':
        return '#FFF3E0';
      case 'info':
      default:
        return '#E3F2FD';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Notification Settings */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Bell size={20} color="#007ACC" />
            <Text style={styles.notificationTitle}>Notification Settings</Text>
          </View>
          <Text style={styles.notificationSubtitle}>
            Manage how you receive notifications
          </Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Manage Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>Recent Messages</Text>
          
          {dummyMessages.map((message) => (
            <TouchableOpacity 
              key={message.id} 
              style={[
                styles.messageCard,
                { backgroundColor: message.read ? '#fff' : getMessageColor(message.type) }
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageLeft}>
                  {getMessageIcon(message.type)}
                  <View style={styles.messageContent}>
                    <Text style={[
                      styles.messageTitle,
                      { fontWeight: message.read ? '500' : '600' }
                    ]}>
                      {message.title}
                    </Text>
                    <Text style={styles.messageText}>{message.message}</Text>
                  </View>
                </View>
                {!message.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.messageTime}>{message.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Message Categories</Text>
          
          <TouchableOpacity style={styles.categoryCard}>
            <CheckCircle size={20} color="#4CAF50" />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Transaction Confirmations</Text>
              <Text style={styles.categoryCount}>12 messages</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard}>
            <AlertCircle size={20} color="#FF9800" />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Account Alerts</Text>
              <Text style={styles.categoryCount}>3 messages</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard}>
            <Info size={20} color="#007ACC" />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Product Updates</Text>
              <Text style={styles.categoryCount}>7 messages</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007ACC',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  settingsButton: {
    backgroundColor: '#E60000',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E60000',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryContent: {
    marginLeft: 15,
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});