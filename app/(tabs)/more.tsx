import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { User, Settings, Bell, CircleHelp as HelpCircle, Info, LogOut, ChevronRight, Shield, FileText, Phone } from 'lucide-react-native';

const menuItems = [
  { id: 1, title: 'Profile Settings', icon: User, color: '#E60000' },
  { id: 2, title: 'Notification Settings', icon: Bell, color: '#007ACC' },
  { id: 3, title: 'Security Settings', icon: Shield, color: '#4CAF50' },
  { id: 4, title: 'Statements', icon: FileText, color: '#FF9800' },
  { id: 5, title: 'Help Centre', icon: HelpCircle, color: '#9C27B0' },
  { id: 6, title: 'Contact Us', icon: Phone, color: '#FF5722' },
  { id: 7, title: 'About Capitec', icon: Info, color: '#607D8B' },
];

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150' }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>GlobalDne</Text>
                <Text style={styles.profileEmail}>globaldne@example.com</Text>
                <Text style={styles.profilePhone}>+27 82 123 4567</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <User size={16} color="#E60000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.membershipSection}>
              <Text style={styles.membershipTitle}>Membership Level</Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>Gold Member</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <item.icon size={18} color="#fff" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appInfoCard}>
            <Text style={styles.appVersion}>App Version 12.5.1</Text>
            <Text style={styles.lastUpdate}>Last updated: Jan 20, 2025</Text>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton}>
            <LogOut size={18} color="#E60000" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Security Policy</Text>
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
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipTitle: {
    fontSize: 14,
    color: '#666',
  },
  membershipBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 35,
    height: 35,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  appInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  appInfoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  lastUpdate: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  signOutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E60000',
  },
  signOutText: {
    color: '#E60000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  legalSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  legalLink: {
    paddingVertical: 8,
  },
  legalText: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});