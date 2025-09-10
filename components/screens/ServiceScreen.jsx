import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { TextInput, Button, Card, Searchbar, HelperText, Switch } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import * as ServiceApi from '../../src/api/servicesApi';
import { getAssetsForDropdown } from '../../src/api/assets';
import { getUsers } from '../../src/api/user';
import { getUserDataFromToken } from '../../src/api/getCompanyIdFromToken';
import { eServiceStatus } from '../../constants/Enums';
import colors from '../../src/constants/colors';
import CustomDropdown from '../assets/CustomDropdown';

/**
 * ServiceScreen - Complete service management interface
 * Features: List, Create, Edit, Delete services with full form validation
 * Handles nested objects and proper type conversion for API calls
 */
export default function ServiceScreen() {
  // Core state
  const [services, setServices] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]); // Placeholder for equipment
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Form state - matches API schema exactly
  const [formData, setFormData] = useState({
    assetID: '',
    equipmentId: '',
    serviceTask: '',
    status: '',
    serviceType: '',
    timeInterval: '',
    timeDueSoonThreshold: '',
    primaryMeterInterval: '',
    primaryMeterDueSoonThreshold: '',
    assignedToUserID: '',
    scheduledDate: new Date(),
    assets: [],
    equipmentList: [],
    userList: []
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Service status and type options
  const serviceStatusOptions = Object.entries(eServiceStatus)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({ label, value }));

  const serviceTypeOptions = [
    { label: 'Preventive', value: 1 },
    { label: 'Corrective', value: 2 },
    { label: 'Emergency', value: 3 },
    { label: 'Inspection', value: 4 }
  ];

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
        fetchServices(),
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
   * Fetch services list
   */
  const fetchServices = useCallback(async () => {
    try {
      const response = await ServiceApi.getAllServices();
      setServices(response.content?.$values || response || []);
    } catch (err) {
      setError('Failed to fetch services: ' + err.message);
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
    
    if (!formData.assetID) errors.assetID = 'Asset is required';
    if (!formData.serviceTask.trim()) errors.serviceTask = 'Service task is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.serviceType) errors.serviceType = 'Service type is required';
    if (!formData.assignedToUserID) errors.assignedToUserID = 'Assigned user is required';

    // Validate numeric fields
    const numericFields = ['timeInterval', 'timeDueSoonThreshold', 'primaryMeterInterval', 'primaryMeterDueSoonThreshold'];
    numericFields.forEach(field => {
      if (formData[field] && isNaN(Number(formData[field]))) {
        errors[field] = `${field} must be a number`;
      }
    });

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
      setFormData(prev => ({ ...prev, scheduledDate: selectedDate }));
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      assetID: '',
      equipmentId: '',
      serviceTask: '',
      status: '',
      serviceType: '',
      timeInterval: '',
      timeDueSoonThreshold: '',
      primaryMeterInterval: '',
      primaryMeterDueSoonThreshold: '',
      assignedToUserID: '',
      scheduledDate: new Date(),
      assets: [],
      equipmentList: [],
      userList: []
    });
    setFormErrors({});
    setTouched({});
    setEditingService(null);
  };

  /**
   * Handle form submission (create/update)
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      setTouched({
        assetID: true,
        serviceTask: true,
        status: true,
        serviceType: true,
        assignedToUserID: true
      });
      return;
    }

    setFormLoading(true);
    try {
      // Prepare data for API - convert strings to numbers where needed
      const apiData = {
        ...formData,
        assetID: Number(formData.assetID),
        equipmentId: Number(formData.equipmentId) || 0,
        status: Number(formData.status),
        serviceType: Number(formData.serviceType),
        timeInterval: Number(formData.timeInterval) || 0,
        timeDueSoonThreshold: Number(formData.timeDueSoonThreshold) || 0,
        primaryMeterInterval: Number(formData.primaryMeterInterval) || 0,
        primaryMeterDueSoonThreshold: Number(formData.primaryMeterDueSoonThreshold) || 0,
        assignedToUserID: Number(formData.assignedToUserID),
        scheduledDate: formData.scheduledDate.toISOString(),
        // Include required nested arrays
        assets: [{ disabled: false, selected: true, text: "Selected Asset", value: formData.assetID.toString() }],
        equipmentList: [],
        userList: [{ disabled: false, selected: true, text: "Assigned User", value: formData.assignedToUserID.toString() }]
      };

      if (editingService) {
        await ServiceApi.updateService(editingService.id, apiData);
        Alert.alert('Success', 'Service updated successfully');
      } else {
        await ServiceApi.createService(apiData);
        Alert.alert('Success', 'Service created successfully');
      }

      await fetchServices();
      setShowForm(false);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle edit service
   */
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      assetID: service.assetID?.toString() || '',
      equipmentId: service.equipmentId?.toString() || '',
      serviceTask: service.serviceTask || '',
      status: service.status?.toString() || '',
      serviceType: service.serviceType?.toString() || '',
      timeInterval: service.timeInterval?.toString() || '',
      timeDueSoonThreshold: service.timeDueSoonThreshold?.toString() || '',
      primaryMeterInterval: service.primaryMeterInterval?.toString() || '',
      primaryMeterDueSoonThreshold: service.primaryMeterDueSoonThreshold?.toString() || '',
      assignedToUserID: service.assignedToUserID?.toString() || '',
      scheduledDate: service.scheduledDate ? new Date(service.scheduledDate) : new Date(),
      assets: service.assets || [],
      equipmentList: service.equipmentList || [],
      userList: service.userList || []
    });
    setShowForm(true);
  };

  /**
   * Handle delete service
   */
  const handleDelete = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.serviceTask}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await ServiceApi.deleteService(service.id);
              Alert.alert('Success', 'Service deleted successfully');
              await fetchServices();
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

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.serviceTask?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.asset?.assetName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputTheme = {
    colors: {
      text: '#000',
      placeholder: 'silver',
      background: '#fff',
    },
    roundness: 8,
  };

  if (loading && services.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Service Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Service</Text>
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
        placeholder="Search services..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
        iconColor={colors.primary}
      />

      {/* Services List */}
      <ScrollView style={styles.listContainer}>
        {filteredServices.map((service, index) => (
          <Card key={service.id || index} style={styles.serviceCard}>
            <Card.Content>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceTask}>{service.serviceTask}</Text>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(service)}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(service)}
                  >
                    <MaterialIcons name="delete" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceDetail}>
                  Asset: {service.asset?.assetName || 'N/A'}
                </Text>
                <Text style={styles.serviceDetail}>
                  Status: {serviceStatusOptions.find(s => s.value === service.status)?.label || 'Unknown'}
                </Text>
                <Text style={styles.serviceDetail}>
                  Type: {serviceTypeOptions.find(t => t.value === service.serviceType)?.label || 'Unknown'}
                </Text>
                <Text style={styles.serviceDetail}>
                  Assigned: {service.assignedUser?.username || 'Unassigned'}
                </Text>
                <Text style={styles.serviceDetail}>
                  Scheduled: {service.scheduledDate ? new Date(service.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredServices.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="build" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        )}
      </ScrollView>

      {/* Service Form Modal */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {editingService ? 'Edit Service' : 'Create Service'}
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

              {/* Service Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Information</Text>
                
                <CustomDropdown
                  data={assets.map(asset => ({
                    label: asset.assetName,
                    value: asset.id
                  }))}
                  placeholder="Select Asset"
                  value={formData.assetID}
                  onValueChange={(value) => handleInputChange('assetID', value)}
                  error={!!formErrors.assetID && touched.assetID}
                />
                {formErrors.assetID && touched.assetID && (
                  <HelperText type="error">{formErrors.assetID}</HelperText>
                )}

                <TextInput
                  label="Service Task"
                  value={formData.serviceTask}
                  onChangeText={(text) => handleInputChange('serviceTask', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.serviceTask && touched.serviceTask}
                  onBlur={() => setTouched(prev => ({ ...prev, serviceTask: true }))}
                />
                {formErrors.serviceTask && touched.serviceTask && (
                  <HelperText type="error">{formErrors.serviceTask}</HelperText>
                )}

                <CustomDropdown
                  data={serviceStatusOptions}
                  placeholder="Select Status"
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  error={!!formErrors.status && touched.status}
                />
                {formErrors.status && touched.status && (
                  <HelperText type="error">{formErrors.status}</HelperText>
                )}

                <CustomDropdown
                  data={serviceTypeOptions}
                  placeholder="Select Service Type"
                  value={formData.serviceType}
                  onValueChange={(value) => handleInputChange('serviceType', value)}
                  error={!!formErrors.serviceType && touched.serviceType}
                />
                {formErrors.serviceType && touched.serviceType && (
                  <HelperText type="error">{formErrors.serviceType}</HelperText>
                )}

                <CustomDropdown
                  data={users.map(user => ({
                    label: user.username,
                    value: user.id
                  }))}
                  placeholder="Assign to User"
                  value={formData.assignedToUserID}
                  onValueChange={(value) => handleInputChange('assignedToUserID', value)}
                  error={!!formErrors.assignedToUserID && touched.assignedToUserID}
                />
                {formErrors.assignedToUserID && touched.assignedToUserID && (
                  <HelperText type="error">{formErrors.assignedToUserID}</HelperText>
                )}
              </View>

              {/* Scheduling Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scheduling</Text>
                
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateLabel}>Scheduled Date</Text>
                  <Text style={styles.dateValue}>
                    {formData.scheduledDate.toLocaleDateString()}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showDatePicker && (
                  <RNDateTimePicker
                    value={formData.scheduledDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Intervals Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Intervals</Text>
                
                <TextInput
                  label="Time Interval (days)"
                  value={formData.timeInterval}
                  onChangeText={(text) => handleInputChange('timeInterval', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.timeInterval && touched.timeInterval}
                />
                {formErrors.timeInterval && touched.timeInterval && (
                  <HelperText type="error">{formErrors.timeInterval}</HelperText>
                )}

                <TextInput
                  label="Time Due Soon Threshold (days)"
                  value={formData.timeDueSoonThreshold}
                  onChangeText={(text) => handleInputChange('timeDueSoonThreshold', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.timeDueSoonThreshold && touched.timeDueSoonThreshold}
                />

                <TextInput
                  label="Primary Meter Interval"
                  value={formData.primaryMeterInterval}
                  onChangeText={(text) => handleInputChange('primaryMeterInterval', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.primaryMeterInterval && touched.primaryMeterInterval}
                />

                <TextInput
                  label="Primary Meter Due Soon Threshold"
                  value={formData.primaryMeterDueSoonThreshold}
                  onChangeText={(text) => handleInputChange('primaryMeterDueSoonThreshold', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.primaryMeterDueSoonThreshold && touched.primaryMeterDueSoonThreshold}
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
                  {editingService ? 'Update Service' : 'Create Service'}
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
  serviceCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.white,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTask: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  serviceDetails: {
    gap: 4,
  },
  serviceDetail: {
    fontSize: 14,
    color: colors.gray,
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