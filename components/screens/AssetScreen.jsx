import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { TextInput, Button, Card, Searchbar, HelperText, Switch } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as AssetApi from '../../src/api/assetsApi';
import { getLocations } from '../../src/api/assets';
import { getUserDataFromToken, getCompanyIdFromToken } from '../../src/api/getCompanyIdFromToken';
import { eAssetStatus, eVehicleType, eFuelType, FinancialType } from '../../constants/Enums';
import colors from '../../src/constants/colors';
import CustomDropdown from '../assets/CustomDropdown';

/**
 * AssetScreen - Complete asset management interface
 * Features: List, Create, Edit, Delete assets with nested financial details
 * Handles image upload, complex nested objects, and proper type conversion
 */
export default function AssetScreen() {
  // Core state
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  // Form state - matches API schema with nested objects
  const [formData, setFormData] = useState({
    // Basic asset fields
    assetName: '',
    vin: '',
    licensePlate: '',
    locationId: '',
    vehicleType: '',
    companyAssetTypeId: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    fuelType: '',
    registrationState: '',
    status: '',
    inServiceDate: new Date(),
    inServiceOdometer: '',
    estimatedServiceLifeInMonths: '',
    estimatedServiceLifeInMeters: '',
    estimatedResaleValue: '',
    companyID: '',
    userId: '',
    assetImages: [],
    
    // Nested financial detail object
    financialDetail: {
      purchaseVendor: '',
      purchasePrice: '',
      purchaseDate: new Date(),
      odometer: '',
      notes: '',
      financialType: '',
      
      // Nested loan detail
      loanDetail: {
        lender: '',
        amountOfLoan: '',
        interestRate: '',
        loanTerm: '',
        monthlyPayment: '',
        startDate: new Date(),
        endDate: new Date(),
        remainingBalance: ''
      },
      
      // Nested lease detail
      leaseDetail: {
        lessor: '',
        leaseAmount: '',
        leaseTerm: '',
        monthlyPayment: '',
        startDate: new Date(),
        endDate: new Date(),
        residualValue: '',
        mileageLimit: ''
      }
    }
  });

  // Form validation and UI state
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showDatePickers, setShowDatePickers] = useState({
    inService: false,
    purchase: false,
    loanStart: false,
    loanEnd: false,
    leaseStart: false,
    leaseEnd: false
  });

  // Enum options
  const assetStatusOptions = Object.entries(eAssetStatus)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({ label, value }));

  const vehicleTypeOptions = Object.entries(eVehicleType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({ label, value }));

  const fuelTypeOptions = Object.entries(eFuelType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({ label, value }));

  const financialTypeOptions = Object.entries(FinancialType)
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
      const companyData = await getCompanyIdFromToken();
      setUserId(userData.sub);
      setCompanyId(companyData);

      await Promise.all([
        fetchAssets(),
        fetchLocations()
      ]);
    } catch (err) {
      setError('Failed to initialize: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch assets list
   */
  const fetchAssets = useCallback(async () => {
    try {
      const response = await AssetApi.getAllAssets();
      setAssets(response.content?.$values || response || []);
    } catch (err) {
      setError('Failed to fetch assets: ' + err.message);
    }
  }, []);

  /**
   * Fetch locations for dropdown
   */
  const fetchLocations = useCallback(async () => {
    try {
      const locationsData = await getLocations();
      setLocations(locationsData || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  }, []);

  /**
   * Form validation with nested object support
   */
  const validateForm = () => {
    const errors = {};
    
    // Basic required fields
    if (!formData.assetName.trim()) errors.assetName = 'Asset name is required';
    if (!formData.vin.trim()) errors.vin = 'VIN is required';
    if (!formData.licensePlate.trim()) errors.licensePlate = 'License plate is required';
    if (!formData.locationId) errors.locationId = 'Location is required';
    if (!formData.vehicleType) errors.vehicleType = 'Vehicle type is required';
    if (!formData.year) errors.year = 'Year is required';
    if (!formData.make.trim()) errors.make = 'Make is required';
    if (!formData.model.trim()) errors.model = 'Model is required';
    if (!formData.status) errors.status = 'Status is required';

    // Validate numeric fields
    if (formData.year && (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1)) {
      errors.year = 'Please enter a valid year';
    }

    // Validate financial detail numeric fields
    if (formData.financialDetail.purchasePrice && isNaN(Number(formData.financialDetail.purchasePrice))) {
      errors['financialDetail.purchasePrice'] = 'Purchase price must be a number';
    }

    // Validate loan detail if financial type is loan
    if (formData.financialDetail.financialType === FinancialType.Loan) {
      if (!formData.financialDetail.loanDetail.lender.trim()) {
        errors['financialDetail.loanDetail.lender'] = 'Lender is required for loan';
      }
      if (!formData.financialDetail.loanDetail.amountOfLoan) {
        errors['financialDetail.loanDetail.amountOfLoan'] = 'Loan amount is required';
      }
    }

    // Validate lease detail if financial type is lease
    if (formData.financialDetail.financialType === FinancialType.Lease) {
      if (!formData.financialDetail.leaseDetail.lessor.trim()) {
        errors['financialDetail.leaseDetail.lessor'] = 'Lessor is required for lease';
      }
      if (!formData.financialDetail.leaseDetail.leaseAmount) {
        errors['financialDetail.leaseDetail.leaseAmount'] = 'Lease amount is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form input changes with nested object support
   */
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested object updates using dot notation
      const keys = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        // Navigate to the nested object
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handle date changes for multiple date fields
   */
  const handleDateChange = (dateType, event, selectedDate) => {
    setShowDatePickers(prev => ({ ...prev, [dateType]: false }));
    
    if (selectedDate) {
      switch (dateType) {
        case 'inService':
          setFormData(prev => ({ ...prev, inServiceDate: selectedDate }));
          break;
        case 'purchase':
          handleInputChange('financialDetail.purchaseDate', selectedDate);
          break;
        case 'loanStart':
          handleInputChange('financialDetail.loanDetail.startDate', selectedDate);
          break;
        case 'loanEnd':
          handleInputChange('financialDetail.loanDetail.endDate', selectedDate);
          break;
        case 'leaseStart':
          handleInputChange('financialDetail.leaseDetail.startDate', selectedDate);
          break;
        case 'leaseEnd':
          handleInputChange('financialDetail.leaseDetail.endDate', selectedDate);
          break;
      }
    }
  };

  /**
   * Handle image selection
   */
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    });

    if (!result.canceled && result.assets) {
      setFormData(prev => ({
        ...prev,
        assetImages: [...prev.assetImages, ...result.assets.map(asset => asset.uri)]
      }));
    }
  };

  /**
   * Remove image from selection
   */
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      assetImages: prev.assetImages.filter((_, i) => i !== index)
    }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      assetName: '',
      vin: '',
      licensePlate: '',
      locationId: '',
      vehicleType: '',
      companyAssetTypeId: '',
      year: '',
      make: '',
      model: '',
      trim: '',
      fuelType: '',
      registrationState: '',
      status: '',
      inServiceDate: new Date(),
      inServiceOdometer: '',
      estimatedServiceLifeInMonths: '',
      estimatedServiceLifeInMeters: '',
      estimatedResaleValue: '',
      companyID: companyId || '',
      userId: userId || '',
      assetImages: [],
      financialDetail: {
        purchaseVendor: '',
        purchasePrice: '',
        purchaseDate: new Date(),
        odometer: '',
        notes: '',
        financialType: '',
        loanDetail: {
          lender: '',
          amountOfLoan: '',
          interestRate: '',
          loanTerm: '',
          monthlyPayment: '',
          startDate: new Date(),
          endDate: new Date(),
          remainingBalance: ''
        },
        leaseDetail: {
          lessor: '',
          leaseAmount: '',
          leaseTerm: '',
          monthlyPayment: '',
          startDate: new Date(),
          endDate: new Date(),
          residualValue: '',
          mileageLimit: ''
        }
      }
    });
    setFormErrors({});
    setTouched({});
    setEditingAsset(null);
  };

  /**
   * Handle form submission (create/update)
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      setTouched({
        assetName: true,
        vin: true,
        licensePlate: true,
        locationId: true,
        vehicleType: true,
        year: true,
        make: true,
        model: true,
        status: true
      });
      return;
    }

    setFormLoading(true);
    try {
      // Prepare data for API - convert strings to numbers and dates to ISO strings
      const apiData = {
        ...formData,
        locationId: Number(formData.locationId),
        vehicleType: Number(formData.vehicleType),
        companyAssetTypeId: Number(formData.companyAssetTypeId) || 0,
        year: Number(formData.year),
        fuelType: Number(formData.fuelType) || 10,
        status: Number(formData.status),
        inServiceDate: formData.inServiceDate.toISOString(),
        inServiceOdometer: Number(formData.inServiceOdometer) || 0,
        estimatedServiceLifeInMonths: Number(formData.estimatedServiceLifeInMonths) || 0,
        estimatedServiceLifeInMeters: Number(formData.estimatedServiceLifeInMeters) || 0,
        estimatedResaleValue: Number(formData.estimatedResaleValue) || 0,
        companyID: Number(companyId),
        userId: Number(userId),
        
        // Process financial detail with nested objects
        financialDetail: {
          ...formData.financialDetail,
          purchasePrice: Number(formData.financialDetail.purchasePrice) || 0,
          purchaseDate: formData.financialDetail.purchaseDate.toISOString(),
          odometer: Number(formData.financialDetail.odometer) || 0,
          financialType: Number(formData.financialDetail.financialType) || 10,
          
          loanDetail: {
            ...formData.financialDetail.loanDetail,
            amountOfLoan: Number(formData.financialDetail.loanDetail.amountOfLoan) || 0,
            interestRate: Number(formData.financialDetail.loanDetail.interestRate) || 0,
            loanTerm: Number(formData.financialDetail.loanDetail.loanTerm) || 0,
            monthlyPayment: Number(formData.financialDetail.loanDetail.monthlyPayment) || 0,
            startDate: formData.financialDetail.loanDetail.startDate.toISOString(),
            endDate: formData.financialDetail.loanDetail.endDate.toISOString(),
            remainingBalance: Number(formData.financialDetail.loanDetail.remainingBalance) || 0
          },
          
          leaseDetail: {
            ...formData.financialDetail.leaseDetail,
            leaseAmount: Number(formData.financialDetail.leaseDetail.leaseAmount) || 0,
            leaseTerm: Number(formData.financialDetail.leaseDetail.leaseTerm) || 0,
            monthlyPayment: Number(formData.financialDetail.leaseDetail.monthlyPayment) || 0,
            startDate: formData.financialDetail.leaseDetail.startDate.toISOString(),
            endDate: formData.financialDetail.leaseDetail.endDate.toISOString(),
            residualValue: Number(formData.financialDetail.leaseDetail.residualValue) || 0,
            mileageLimit: Number(formData.financialDetail.leaseDetail.mileageLimit) || 0
          }
        }
      };

      if (editingAsset) {
        await AssetApi.updateAsset(editingAsset.id, apiData);
        Alert.alert('Success', 'Asset updated successfully');
      } else {
        await AssetApi.createAsset(apiData);
        Alert.alert('Success', 'Asset created successfully');
      }

      await fetchAssets();
      setShowForm(false);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle edit asset
   */
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetName: asset.assetName || '',
      vin: asset.vin || '',
      licensePlate: asset.licensePlate || '',
      locationId: asset.locationId?.toString() || '',
      vehicleType: asset.vehicleType?.toString() || '',
      companyAssetTypeId: asset.companyAssetTypeId?.toString() || '',
      year: asset.year?.toString() || '',
      make: asset.make || '',
      model: asset.model || '',
      trim: asset.trim || '',
      fuelType: asset.fuelType?.toString() || '',
      registrationState: asset.registrationState || '',
      status: asset.status?.toString() || '',
      inServiceDate: asset.inServiceDate ? new Date(asset.inServiceDate) : new Date(),
      inServiceOdometer: asset.inServiceOdometer?.toString() || '',
      estimatedServiceLifeInMonths: asset.estimatedServiceLifeInMonths?.toString() || '',
      estimatedServiceLifeInMeters: asset.estimatedServiceLifeInMeters?.toString() || '',
      estimatedResaleValue: asset.estimatedResaleValue?.toString() || '',
      companyID: asset.companyID?.toString() || companyId?.toString() || '',
      userId: asset.userId?.toString() || userId?.toString() || '',
      assetImages: asset.assetImages || [],
      
      financialDetail: {
        purchaseVendor: asset.financialDetail?.purchaseVendor || '',
        purchasePrice: asset.financialDetail?.purchasePrice?.toString() || '',
        purchaseDate: asset.financialDetail?.purchaseDate ? new Date(asset.financialDetail.purchaseDate) : new Date(),
        odometer: asset.financialDetail?.odometer?.toString() || '',
        notes: asset.financialDetail?.notes || '',
        financialType: asset.financialDetail?.financialType?.toString() || '',
        
        loanDetail: {
          lender: asset.financialDetail?.loanDetail?.lender || '',
          amountOfLoan: asset.financialDetail?.loanDetail?.amountOfLoan?.toString() || '',
          interestRate: asset.financialDetail?.loanDetail?.interestRate?.toString() || '',
          loanTerm: asset.financialDetail?.loanDetail?.loanTerm?.toString() || '',
          monthlyPayment: asset.financialDetail?.loanDetail?.monthlyPayment?.toString() || '',
          startDate: asset.financialDetail?.loanDetail?.startDate ? new Date(asset.financialDetail.loanDetail.startDate) : new Date(),
          endDate: asset.financialDetail?.loanDetail?.endDate ? new Date(asset.financialDetail.loanDetail.endDate) : new Date(),
          remainingBalance: asset.financialDetail?.loanDetail?.remainingBalance?.toString() || ''
        },
        
        leaseDetail: {
          lessor: asset.financialDetail?.leaseDetail?.lessor || '',
          leaseAmount: asset.financialDetail?.leaseDetail?.leaseAmount?.toString() || '',
          leaseTerm: asset.financialDetail?.leaseDetail?.leaseTerm?.toString() || '',
          monthlyPayment: asset.financialDetail?.leaseDetail?.monthlyPayment?.toString() || '',
          startDate: asset.financialDetail?.leaseDetail?.startDate ? new Date(asset.financialDetail.leaseDetail.startDate) : new Date(),
          endDate: asset.financialDetail?.leaseDetail?.endDate ? new Date(asset.financialDetail.leaseDetail.endDate) : new Date(),
          residualValue: asset.financialDetail?.leaseDetail?.residualValue?.toString() || '',
          mileageLimit: asset.financialDetail?.leaseDetail?.mileageLimit?.toString() || ''
        }
      }
    });
    setShowForm(true);
  };

  /**
   * Handle delete asset
   */
  const handleDelete = (asset) => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete "${asset.assetName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await AssetApi.deleteAsset(asset.id);
              Alert.alert('Success', 'Asset deleted successfully');
              await fetchAssets();
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

  // Filter assets based on search
  const filteredAssets = assets.filter(asset =>
    asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputTheme = {
    colors: {
      text: '#000',
      placeholder: 'silver',
      background: '#fff',
    },
    roundness: 8,
  };

  if (loading && assets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading assets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Asset Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Asset</Text>
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
        placeholder="Search assets..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
        iconColor={colors.primary}
      />

      {/* Assets List */}
      <ScrollView style={styles.listContainer}>
        {filteredAssets.map((asset, index) => (
          <Card key={asset.id || index} style={styles.assetCard}>
            <Card.Content>
              <View style={styles.assetHeader}>
                <Text style={styles.assetName}>{asset.assetName}</Text>
                <View style={styles.assetActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(asset)}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(asset)}
                  >
                    <MaterialIcons name="delete" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.assetDetails}>
                <Text style={styles.assetDetail}>
                  {asset.year} {asset.make} {asset.model}
                </Text>
                <Text style={styles.assetDetail}>
                  VIN: {asset.vin}
                </Text>
                <Text style={styles.assetDetail}>
                  License: {asset.licensePlate}
                </Text>
                <Text style={styles.assetDetail}>
                  Status: {assetStatusOptions.find(s => s.value === asset.status)?.label || 'Unknown'}
                </Text>
                <Text style={styles.assetDetail}>
                  Location: {asset.location?.locationName || 'N/A'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredAssets.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="directions-car" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        )}
      </ScrollView>

      {/* Asset Form Modal */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {editingAsset ? 'Edit Asset' : 'Create Asset'}
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
                
                <TextInput
                  label="Asset Name"
                  value={formData.assetName}
                  onChangeText={(text) => handleInputChange('assetName', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.assetName && touched.assetName}
                  onBlur={() => setTouched(prev => ({ ...prev, assetName: true }))}
                />
                {formErrors.assetName && touched.assetName && (
                  <HelperText type="error">{formErrors.assetName}</HelperText>
                )}

                <TextInput
                  label="VIN"
                  value={formData.vin}
                  onChangeText={(text) => handleInputChange('vin', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.vin && touched.vin}
                  onBlur={() => setTouched(prev => ({ ...prev, vin: true }))}
                />
                {formErrors.vin && touched.vin && (
                  <HelperText type="error">{formErrors.vin}</HelperText>
                )}

                <TextInput
                  label="License Plate"
                  value={formData.licensePlate}
                  onChangeText={(text) => handleInputChange('licensePlate', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.licensePlate && touched.licensePlate}
                  onBlur={() => setTouched(prev => ({ ...prev, licensePlate: true }))}
                />
                {formErrors.licensePlate && touched.licensePlate && (
                  <HelperText type="error">{formErrors.licensePlate}</HelperText>
                )}

                <CustomDropdown
                  data={locations.map(location => ({
                    label: location.locationName,
                    value: location.id
                  }))}
                  placeholder="Select Location"
                  value={formData.locationId}
                  onValueChange={(value) => handleInputChange('locationId', value)}
                  error={!!formErrors.locationId && touched.locationId}
                />
                {formErrors.locationId && touched.locationId && (
                  <HelperText type="error">{formErrors.locationId}</HelperText>
                )}
              </View>

              {/* Vehicle Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
                
                <CustomDropdown
                  data={vehicleTypeOptions}
                  placeholder="Select Vehicle Type"
                  value={formData.vehicleType}
                  onValueChange={(value) => handleInputChange('vehicleType', value)}
                  error={!!formErrors.vehicleType && touched.vehicleType}
                />
                {formErrors.vehicleType && touched.vehicleType && (
                  <HelperText type="error">{formErrors.vehicleType}</HelperText>
                )}

                <TextInput
                  label="Year"
                  value={formData.year}
                  onChangeText={(text) => handleInputChange('year', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.year && touched.year}
                  onBlur={() => setTouched(prev => ({ ...prev, year: true }))}
                />
                {formErrors.year && touched.year && (
                  <HelperText type="error">{formErrors.year}</HelperText>
                )}

                <TextInput
                  label="Make"
                  value={formData.make}
                  onChangeText={(text) => handleInputChange('make', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.make && touched.make}
                  onBlur={() => setTouched(prev => ({ ...prev, make: true }))}
                />
                {formErrors.make && touched.make && (
                  <HelperText type="error">{formErrors.make}</HelperText>
                )}

                <TextInput
                  label="Model"
                  value={formData.model}
                  onChangeText={(text) => handleInputChange('model', text)}
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors.model && touched.model}
                  onBlur={() => setTouched(prev => ({ ...prev, model: true }))}
                />
                {formErrors.model && touched.model && (
                  <HelperText type="error">{formErrors.model}</HelperText>
                )}

                <TextInput
                  label="Trim"
                  value={formData.trim}
                  onChangeText={(text) => handleInputChange('trim', text)}
                  style={styles.input}
                  theme={inputTheme}
                />

                <CustomDropdown
                  data={fuelTypeOptions}
                  placeholder="Select Fuel Type"
                  value={formData.fuelType}
                  onValueChange={(value) => handleInputChange('fuelType', value)}
                />

                <TextInput
                  label="Registration State"
                  value={formData.registrationState}
                  onChangeText={(text) => handleInputChange('registrationState', text)}
                  style={styles.input}
                  theme={inputTheme}
                />

                <CustomDropdown
                  data={assetStatusOptions}
                  placeholder="Select Status"
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  error={!!formErrors.status && touched.status}
                />
                {formErrors.status && touched.status && (
                  <HelperText type="error">{formErrors.status}</HelperText>
                )}
              </View>

              {/* Service Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Information</Text>
                
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePickers(prev => ({ ...prev, inService: true }))}
                >
                  <Text style={styles.dateLabel}>In-Service Date</Text>
                  <Text style={styles.dateValue}>
                    {formData.inServiceDate.toLocaleDateString()}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showDatePickers.inService && (
                  <RNDateTimePicker
                    value={formData.inServiceDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleDateChange('inService', event, date)}
                  />
                )}

                <TextInput
                  label="In-Service Odometer"
                  value={formData.inServiceOdometer}
                  onChangeText={(text) => handleInputChange('inServiceOdometer', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                />

                <TextInput
                  label="Estimated Service Life (Months)"
                  value={formData.estimatedServiceLifeInMonths}
                  onChangeText={(text) => handleInputChange('estimatedServiceLifeInMonths', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                />

                <TextInput
                  label="Estimated Service Life (Meters)"
                  value={formData.estimatedServiceLifeInMeters}
                  onChangeText={(text) => handleInputChange('estimatedServiceLifeInMeters', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                />

                <TextInput
                  label="Estimated Resale Value"
                  value={formData.estimatedResaleValue}
                  onChangeText={(text) => handleInputChange('estimatedResaleValue', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                />
              </View>

              {/* Financial Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Financial Details</Text>
                
                <TextInput
                  label="Purchase Vendor"
                  value={formData.financialDetail.purchaseVendor}
                  onChangeText={(text) => handleInputChange('financialDetail.purchaseVendor', text)}
                  style={styles.input}
                  theme={inputTheme}
                />

                <TextInput
                  label="Purchase Price"
                  value={formData.financialDetail.purchasePrice}
                  onChangeText={(text) => handleInputChange('financialDetail.purchasePrice', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!formErrors['financialDetail.purchasePrice']}
                />
                {formErrors['financialDetail.purchasePrice'] && (
                  <HelperText type="error">{formErrors['financialDetail.purchasePrice']}</HelperText>
                )}

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePickers(prev => ({ ...prev, purchase: true }))}
                >
                  <Text style={styles.dateLabel}>Purchase Date</Text>
                  <Text style={styles.dateValue}>
                    {formData.financialDetail.purchaseDate.toLocaleDateString()}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showDatePickers.purchase && (
                  <RNDateTimePicker
                    value={formData.financialDetail.purchaseDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleDateChange('purchase', event, date)}
                  />
                )}

                <CustomDropdown
                  data={financialTypeOptions}
                  placeholder="Select Financial Type"
                  value={formData.financialDetail.financialType}
                  onValueChange={(value) => handleInputChange('financialDetail.financialType', value)}
                />

                <TextInput
                  label="Notes"
                  value={formData.financialDetail.notes}
                  onChangeText={(text) => handleInputChange('financialDetail.notes', text)}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { minHeight: 80 }]}
                  theme={inputTheme}
                />
              </View>

              {/* Loan Details Section - Show only if financial type is Loan */}
              {formData.financialDetail.financialType === FinancialType.Loan.toString() && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Loan Details</Text>
                  
                  <TextInput
                    label="Lender"
                    value={formData.financialDetail.loanDetail.lender}
                    onChangeText={(text) => handleInputChange('financialDetail.loanDetail.lender', text)}
                    style={styles.input}
                    theme={inputTheme}
                    error={!!formErrors['financialDetail.loanDetail.lender']}
                  />
                  {formErrors['financialDetail.loanDetail.lender'] && (
                    <HelperText type="error">{formErrors['financialDetail.loanDetail.lender']}</HelperText>
                  )}

                  <TextInput
                    label="Loan Amount"
                    value={formData.financialDetail.loanDetail.amountOfLoan}
                    onChangeText={(text) => handleInputChange('financialDetail.loanDetail.amountOfLoan', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                    error={!!formErrors['financialDetail.loanDetail.amountOfLoan']}
                  />
                  {formErrors['financialDetail.loanDetail.amountOfLoan'] && (
                    <HelperText type="error">{formErrors['financialDetail.loanDetail.amountOfLoan']}</HelperText>
                  )}

                  <TextInput
                    label="Interest Rate (%)"
                    value={formData.financialDetail.loanDetail.interestRate}
                    onChangeText={(text) => handleInputChange('financialDetail.loanDetail.interestRate', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="Loan Term (months)"
                    value={formData.financialDetail.loanDetail.loanTerm}
                    onChangeText={(text) => handleInputChange('financialDetail.loanDetail.loanTerm', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="Monthly Payment"
                    value={formData.financialDetail.loanDetail.monthlyPayment}
                    onChangeText={(text) => handleInputChange('financialDetail.loanDetail.monthlyPayment', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                  />
                </View>
              )}

              {/* Lease Details Section - Show only if financial type is Lease */}
              {formData.financialDetail.financialType === FinancialType.Lease.toString() && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Lease Details</Text>
                  
                  <TextInput
                    label="Lessor"
                    value={formData.financialDetail.leaseDetail.lessor}
                    onChangeText={(text) => handleInputChange('financialDetail.leaseDetail.lessor', text)}
                    style={styles.input}
                    theme={inputTheme}
                    error={!!formErrors['financialDetail.leaseDetail.lessor']}
                  />
                  {formErrors['financialDetail.leaseDetail.lessor'] && (
                    <HelperText type="error">{formErrors['financialDetail.leaseDetail.lessor']}</HelperText>
                  )}

                  <TextInput
                    label="Lease Amount"
                    value={formData.financialDetail.leaseDetail.leaseAmount}
                    onChangeText={(text) => handleInputChange('financialDetail.leaseDetail.leaseAmount', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                    error={!!formErrors['financialDetail.leaseDetail.leaseAmount']}
                  />
                  {formErrors['financialDetail.leaseDetail.leaseAmount'] && (
                    <HelperText type="error">{formErrors['financialDetail.leaseDetail.leaseAmount']}</HelperText>
                  )}

                  <TextInput
                    label="Lease Term (months)"
                    value={formData.financialDetail.leaseDetail.leaseTerm}
                    onChangeText={(text) => handleInputChange('financialDetail.leaseDetail.leaseTerm', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="Monthly Payment"
                    value={formData.financialDetail.leaseDetail.monthlyPayment}
                    onChangeText={(text) => handleInputChange('financialDetail.leaseDetail.monthlyPayment', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="Mileage Limit"
                    value={formData.financialDetail.leaseDetail.mileageLimit}
                    onChangeText={(text) => handleInputChange('financialDetail.leaseDetail.mileageLimit', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    theme={inputTheme}
                  />
                </View>
              )}

              {/* Images Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Images</Text>
                
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={handleImagePicker}
                >
                  <MaterialIcons name="add-a-photo" size={24} color={colors.primary} />
                  <Text style={styles.imageUploadText}>Add Images</Text>
                </TouchableOpacity>

                {formData.assetImages.length > 0 && (
                  <View style={styles.imagePreviewContainer}>
                    {formData.assetImages.map((imageUri, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <MaterialIcons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
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
                  {editingAsset ? 'Update Asset' : 'Create Asset'}
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
  assetCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.white,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  assetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  assetDetails: {
    gap: 4,
  },
  assetDetail: {
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
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 12,
  },
  imageUploadText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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