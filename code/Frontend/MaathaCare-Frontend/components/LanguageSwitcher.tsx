import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageSwitcher({ color = '#FF69B4' }) { // Default pink
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'සිංහල', value: 'si' },
    { label: 'தமிழ்', value: 'ta' }
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
        <Ionicons name="language" size={26} color={color} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.languageOption,
                  // DYNAMIC: Use color prop with 20% opacity for background
                  i18n.language === lang.value && { backgroundColor: `${color}20`, borderRadius: 8, borderBottomWidth: 0 }
                ]}
                onPress={() => changeLanguage(lang.value)}
              >
                <Text style={[
                  styles.languageText,
                  // DYNAMIC: Apply color prop directly to selected text
                  i18n.language === lang.value && { color: color, fontWeight: 'bold' }
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  languageOption: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  languageText: {
    fontSize: 16,
    color: '#495057',
  },
});