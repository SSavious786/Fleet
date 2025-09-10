import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { TextInput, Button, Card, Searchbar, HelperText, Switch } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import * as RenewalApi from '../../src/api/renewalsApi';
import { getAssetsForDropdown } from '../../src/api/assets';
import { getUsers } from '../../src/api/user';
import { getUserDataFromToken } from '../../src/api/getCompanyIdFromToken';
import { eRenewalType, RenewalStatus } from '../../constants/Enums';
import colors from '../../src/constants/colors';
import CustomDropdown from '../assets/CustomDropdown';

/**
 * RenewalScreen - Complete renewal management interface
 * Features: List, Create, Edit, Delete renewals with full form validation
 * Handles nested objects, boolean fields, and proper type conversion
 */
export default function RenewalScreen() {
  // Core state
  const [renewals, setRenewals] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]); // Placeholder
  const [renewalTypes, setRenewalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Form state - matches API schema exactly
  const [formData, setFormData] = useState({
    assetId: '',
    equipmentId: '',
    assignedToUserId: '',
    renewalTypeId: '',
    renewalTypeName: '',
    dueDate: new Date(),
    status: '',
    dueSoonThreshold: '',
    comments: '',
    isRecurring: false,
    recurringMonths: '',
    assets: [],
    equipmentList: [],
    users: [],
    renewalTypeList: []
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Renewal status and type options
  const renewalStatusOptions = Object.entries(RenewalStatus)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({ label, value }));

  const renewalTypeOptions = Object.entries(eRenewalType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({ label, value }));

  /**
   * Initialize component data
   */
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const userData = await getUserDataFromToken();
      setUserId(userData.sub);

      await Promise.all([
        fetchRenewals(),
        fetchAssets(),
        fetchUsers()
      ]);
    } catch (err) {
      setError('Failed to initialize: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch renewals list
   */
  const fetchRenewals = useCallback(async () => {
    try {
      const response = await RenewalApi.getAllRenewals();
      setRenewals(response.content?.$values || response || []);
    } catch (err) {
      setError('Failed to fetch renewals: ' + err.message);
    }
  }, []);

  /**
   * Fetch assets for dropdown
   */
  const fetchAssets = useCallback(async () => {
    try {
      const assetsData = await getAssetsForDropdown();
      setAssets(assetsData || []);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  }, []);

  /**
   * Fetch users for dropdown
   */
  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData.content?.$values || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  /**
   * Form validation
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.assetId) errors.assetId = 'Asset is required';
    if (!formData.renewalTypeId) errors.renewalTypeId = 'Renewal type is required';
    if (!formData.renewalTypeName.trim()) errors.renewalTypeName = 'Renewal type name is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.dueSoonThreshold) errors.dueSoonThreshold = 'Due soon threshold is required';

    // Validate numeric fields
    if (formData.dueSoonThreshold && isNaN(Number(formData.dueSoonThreshold))) {
      errors.dueSoonThreshold = 'Due soon threshold must be a number';
    }
    if (formData.recurringMonths && isNaN(Number(formData.recurringMonths))) {
      errors.recurringMonths = 'Recurring months must be a number';
    }

    // Validate recurring logic
    if (formData.isRecurring && !formData.recurringMonths) {
      errors.recurringMonths = 'Recurring months is required when renewal is recurring';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handle date changes
   */
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dueDate: selectedDate }));
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      assetId: '',
      equipmentId: '',
      assignedToUserId: '',
      renewalTypeId: '',
      renewalTypeName: '',
      dueDate: new Date(),
      status: '',
      dueSoonThreshold: '',
      comments: '',
      isRecurring: false,
      recurringMonths: '',
      assets: [],
      equipmentList: [],
      users: [],
      renewalTypeList: []
    });
    setFormErrors({});
    setTouched({});
    setEditingRenewal(null);
  };

  /**
   * Handle form submission (create/update)
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      setTouched({
        assetId: true,
        renewalTypeId: true,
        renewalTypeName: true,
        status: true,
        dueSoonThreshold: true
      });
      return;
    }

    setFormLoading(true);
    try {
      // Prepare data for API - convert strings to numbers where needed
      const apiData = {
        ...formData,
        assetId: Number(formData.assetId),
        equipmentId: Number(formData.equipmentId) || 0,
        assignedToUserId: Number(formData.assignedToUserId) || 0,
        renewalTypeId: Number(formData.renewalTypeId),
        status: Number(formData.status),
        dueSoonThreshold: Number(formData.dueSoonThreshold),
        recurringMonths: Number(formData.recurringMonths) || 0,
        dueDate: formData.dueDate.toISOString(),
        // Include required nested arrays
        assets: [{ disabled: false, selected: true, text: "Selected Asset", value: formData.assetId.toString() }],
        equipmentList: [],
        users: formData.assignedToUserId ? [{ disabled: false, selected: true, text: "Assigned User", value: formData.assignedToUserId.toString() }] : [],
        renewalTypeList: [{ disabled: false, selected: true, text: formData.renewalTypeName, value: formData.renewalTypeId.toString() }]
      };

      if (editingRenewal) {
        await RenewalApi.updateRenewal(editingRenewal.id, apiData);
        Alert.alert('Success', 'Renewal updated successfully');
      } else {
        await RenewalApi.createRenewal(apiData);
        Alert.alert('Success', 'Renewal created successfully');
      }

      await fetchRenewals();
      setShowForm(false);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle edit renewal
   */
  const handleEdit = (renewal) => {
    setEditingRenewal(renewal);
    setFormData({
      assetId: renewal.assetId?.toString() || '',
      equipmentId: renewal.equipmentId?.toString() || '',
      assignedToUserId: renewal.assignedToUserId?.toString() || '',
      renewalTypeId: renewal.renewalTypeId?.toString() || '',
      renewalTypeName: renewal.renewalTypeName || '',
      dueDate: renewal.dueDate ? new Date(renewal.dueDate) : new Date(),
      status: renewal.status?.toString() || '',
      dueSoonThreshold: renewal.dueSoonThreshold?.toString() || '',
      comments: renewal.comments || '',
      isRecurring: renewal.isRecurring || false,
      recurringMonths: renewal.recurringMonths?.toString() || '',
      assets: renewal.assets || [],
      equipmentList: renewal.equipmentList || [],
      users: renewal.users || [],
      renewalTypeList: renewal.renewalTypeList || []
    });
    setShowForm(true);
  };

  /**
   * Handle delete renewal
   */
  const handleDelete = (renewal) => {
    Alert.alert(
      'Delete Renewal',
      `Are you sure you want to delete "${renewal.renewalTypeName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await RenewalApi.deleteRenewal(renewal.id);
              Alert.alert('Success', 'Renewal deleted successfully');
              await fetchRenewals();
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Filter renewals based on search
  const filteredRenewals = renewals.filter(renewal =>
    renewal.renewalTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    renewal.asset?.assetName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputTheme = {
    colors: {
      text: '#000',
      placeholder: 'silver',
      background: '#fff',
    },
    roundness: 8,
  };

  if (loading && renewals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading renewals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Renewal Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Renewal</Text>
        </TouchableOpacity>
      </View>

      {/* Error display */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}>
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Search */}
      <Searchbar
        placeholder="Search renewals..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
        iconColor={colors.primary}
      />

      {/* Renewals List */}
      <ScrollView style={styles.listContainer}>
        {filteredRenewals.map((renewal, index) => (
          <Card key={renewal.id || index} style={styles.renewalCard}>
            <Card.Content>
              <View style={styles.renewalHeader}>
                <Text style={styles.renewalType}>{renewal.renewalTypeName}</Text>
                <View style={styles.renewalActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(renewal)}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(renewal)}
                  >
                    <MaterialIcons name="delete" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.renewalDetails}>
                <Text style={styles.renewalDetail}>
                  Asset: {renewal.asset?.assetName || 'N/A'}
                </Text>
                <Text style={styles.renewalDetail}>
                  Due Date: {renewal.dueDate ? new Date(renewal.dueDate).toLocaleDateString() : 'Not set'}
                </Text>
                <Text style={styles.renewalDetail}>
                  Status: {renewalStatusOptions.find(s => s.value === renewal.status)?.label || 'Unknown'}
                </Text>
                <Text style={styles.renewalDetail}>
                  Assigned: {renewal.assignedUser?.username || 'Unassigned'}
                </Text>
                <View style={styles.renewalBadges}>
                  {renewal.isRecurring && (
                    <View style={styles.recurringBadge}>
                      <Text style={styles.badgeText}>Recurring</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredRenewals.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="refresh" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>No renewals found</Text>
          </View>
        )}
      </ScrollView>

      {/* Renewal Form Modal */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {editingRenewal ? 'Edit Renewal' : 'Create Renewal'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <MaterialIcons name="close" size={24} color={colors.gray} />
                </TouchableOpacity>
              </View>

              {/* Basic Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <CustomDropdown
                  data={assets.map(asset => ({
                    label: asset.assetName,
                    value: asset.id
                  }))}
                  placeholder="Select Asset"
                  value={formData.assetId}
                  onValueChange={(value) => handleInputChange('assetId', value)}
                  error={!!formErrors.assetId && touched.assetId}
                />
                {formErrors.assetId && touched.assetId && (
                  <HelperText type="error">{formErrors.assetId}</HelperText>
                )}

                <CustomDropdown
                  data={renewalTypeOptions}
                  placeholder="Select Renewal Type"
                  value={formData.renewalTypeId}
                  onValueChange={(value) => {
                    handleInputChange('renewalTypeId', value);
                    const selectedType = renewalTypeOptions.find(t => t.value === value);
                    if (selectedType) {
                      handleInputChange('renewalTypeName', selectedType.label);
                    }
                  }}
                  error={!!formErrors.renewalTypeId && touched.renewalTypeId}
                />
                {formErrors.renewalTypeId && touched.renewalTypeId && (
                  <HelperText type="error">{formErrors.renewalTypeId}</HelperText>
                )}

                <TextInput
                  label="Renewal Type Name"
                  value={formData.renewalTypeName}
                  onChangeText={(text) => handleInputChange('renewalTypeName', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.renewalTypeName && touched.renewalTypeName}
                  onBlur={() => setTouched(prev => ({ ...prev, renewalTypeName: true }))}
                />
                {formErrors.renewalTypeName && touched.renewalTypeName && (
                  <HelperText type="error">{formErrors.renewalTypeName}</HelperText>
                )}

                <CustomDropdown
                  data={renewalStatusOptions}
                  placeholder="Select Status"
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  error={!!formErrors.status && touched.status}
                />
                {formErrors.status && touched.status && (
                  <HelperText type="error">{formErrors.status}</HelperText>
                )}

                <CustomDropdown
                  data={users.map(user => ({
                    label: user.username,
                    value: user.id
                  }))}
                  placeholder="Assign to User (Optional)"
                  value={formData.assignedToUserId}
                  onValueChange={(value) => handleInputChange('assignedToUserId', value)}
                />
              </View>

              {/* Due Date and Thresholds Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Due Date & Thresholds</Text>
                
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateLabel}>Due Date</Text>
                  <Text style={styles.dateValue}>
                    {formData.dueDate.toLocaleDateString()}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showDatePicker && (
                  <RNDateTimePicker
                    value={formData.dueDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}

                <TextInput
                  label="Due Soon Threshold (days)"
                  value={formData.dueSoonThreshold}
                  onChangeText={(text) => handleInputChange('dueSoonThreshold', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.dueSoonThreshold && touched.dueSoonThreshold}
                  onBlur={() => setTouched(prev => ({ ...prev, dueSoonThreshold: true }))}
                />
                {formErrors.dueSoonThreshold && touched.dueSoonThreshold && (
                  <HelperText type="error">{formErrors.dueSoonThreshold}</HelperText>
                )}
              </View>

              {/* Recurring Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recurring Settings</Text>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Is Recurring</Text>
                  <Switch
                    value={formData.isRecurring}
                    onValueChange={(value) => handleInputChange('isRecurring', value)}
                    color={colors.primary}
                  />
                </View>

                {formData.isRecurring && (
                  <TextInput
                    label="Recurring Months"
                    value={formData.recurringMonths}
                    onChangeText={(text) => handleInputChange('recurringMonths', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                    error={!!formErrors.recurringMonths && touched.recurringMonths}
                    onBlur={() => setTouched(prev => ({ ...prev, recurringMonths: true }))}
                  />
                )}
                {formErrors.recurringMonths && touched.recurringMonths && (
                  <HelperText type="error">{formErrors.recurringMonths}</HelperText>
                )}
              </View>

              {/* Comments Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comments</Text>
                
                <TextInput
                  label="Comments (Optional)"
                  value={formData.comments}
                  onChangeText={(text) => handleInputChange('comments', text)}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { minHeight: 80 }]}
                  theme={inputTheme}
                />
              </View>

              {/* Form Actions */}
              <View style={styles.formActions}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={formLoading}
                  disabled={formLoading}
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                >
                  {editingRenewal ? 'Update Renewal' : 'Create Renewal'}
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.danger,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    flex: 1,
  },
  searchbar: {
    margin: 16,
    backgroundColor: colors.white,
    elevation: 2,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  renewalCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.white,
  },
  renewalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  renewalType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  renewalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  renewalDetails: {
    gap: 4,
  },
  renewalDetail: {
    fontSize: 14,
    color: colors.gray,
  },
  renewalBadges: {
    flexDirection: 'row',
    marginTop: 8,
  },
  recurringBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
  },
  formContainer: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 16,
    color: colors.gray,
  },
  dateValue: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.dark,
  },
  formActions: {
    gap: 12,
    marginTop: 20,
  },
  submitButton: {
    paddingVertical: 4,
  },
  cancelButton: {
    paddingVertical: 4,
  },
});