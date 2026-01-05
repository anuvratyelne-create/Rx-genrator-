import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Input } from '../components';
import { getPrescriptions } from '../database/repositories';
import type { Prescription } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = prescriptions.filter(
        (rx) =>
          rx.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPrescriptions(filtered);
    } else {
      setFilteredPrescriptions(prescriptions);
    }
  }, [searchQuery, prescriptions]);

  const loadPrescriptions = async () => {
    try {
      const data = await getPrescriptions(100);
      setPrescriptions(data);
      setFilteredPrescriptions(data);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrescriptions();
    setRefreshing(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Prescription }) => (
    <Card
      variant="outlined"
      style={styles.prescriptionCard}
      onPress={() => navigation.navigate('PrescriptionPreview', { prescriptionId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.patient?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.patientName}>{item.patient?.name}</Text>
            <Text style={styles.patientMeta}>
              {item.patient?.gender === 'M' ? 'Male' : 'Female'}
              {item.patient?.age && `, ${item.patient.age} yrs`}
            </Text>
          </View>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>

      {item.diagnosis && (
        <View style={styles.diagnosisBadge}>
          <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Ionicons name="medical-outline" size={16} color="#6b7280" />
        <Text style={styles.medicineCount}>
          {item.items?.length || 0} medicine(s)
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No prescriptions yet</Text>
      <Text style={styles.emptySubtitle}>
        Your prescription history will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by patient or diagnosis"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={20} color="#9ca3af" />}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPrescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  prescriptionCard: {
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  patientMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 1,
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  diagnosisBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  diagnosisText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  medicineCount: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
