import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
} from 'react-native-paper';
import CustomDropdown from '../assets/CustomDropdown';
import Feather from '@expo/vector-icons/Feather';
import { MaterialIcons } from '@expo/vector-icons';
import { getLocations } from '../../src/api/assets';
import { eAssetStatus, eAssetType, eFuelType } from '../../constants/Enums';

function AddAssetDetails({ onSubmitSuccess, onTabChange, initialData = {} }) {
    const [assetName, setAssetName] = useState('');
    const [vin, setVin] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [locations, setLocations] = useState([]);
    const [location, setLocation] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [trim, setTrim] = useState('');
    const [registrationState, setRegistraionState] = useState('');
    const [status, setStatus] = useState('');
    // Assignment section defaults
    const [operator, setOperator] = useState('Active');
    const [owner, setOwner] = useState('Active');
    const [images, setImages] = useState([]);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Re-run when initialData changes or initialization status changes

    const validate = () => {
        const newErrors = {};
        if (!assetName) newErrors.assetName = 'Asset Name is required';
        if (!vin) newErrors.vin = 'VIN is required';
        if (!licensePlate) newErrors.licensePlate = 'License Plate is required';
        if (!location) newErrors.location = 'Location is required';
        // Location validation removed as requested
        if (!vehicleType) newErrors.vehicleType = 'Vehicle Type is required';
        if (!fuelType) newErrors.fuelType = 'Fuel Type is required';
        if (!year) newErrors.year = 'Year is required';
        else if (isNaN(year)) newErrors.year = 'Year must be a number';
        if (!make) newErrors.make = 'Make is required';
        if (!model) newErrors.model = 'Model is required';
        if (!trim) newErrors.trim = 'Trim is required';
        if (!registrationState) newErrors.registrationState = 'Registration State is required';
        if (!status) newErrors.status = 'Status is required';
        if (images.length == 0) newErrors.images = 'Please upload at least one image';
        // Image validation removed to allow empty images
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = () => {
        if (validate()) {
            const data = {
                assetName,
                vin,
                licensePlate,
                locationId: location, // Backend expects locationId
                vehicleType, // This should map to assetType in the backend
                fuelType,
                year: year ? parseInt(year) : null,
                make,
                model,
                trim,
                registrationState,
                status,
                operator,
                owner,
                assetImages: images // Backend expects assetImages
            };

            if (onSubmitSuccess) {
                onSubmitSuccess(data); // Send data to parent
            }
        }
    };

    const inputTheme = {
        colors: {
            text: '#000',
            placeholder: 'silver',
            background: '#fff',
        },
        roundness: 8,
    };

    const dropdownProps = {
        theme: inputTheme,
    };


    // Image picker handler
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access gallery is required!');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
            selectionLimit: 6,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages(result.assets);
        }
    };

    const assetTypeArray = Object.entries(eAssetType)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    const fuelTypeArray = Object.entries(eFuelType)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    const assetStatusArray = Object.entries(eAssetStatus)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    // Initialize form with initial data if provided
    useEffect(() => {
        getLocations()
            .then((loc) => {
                const transformed = loc.map(loc => ({
                    label: loc.locationName,
                    value: loc.id
                }));
                setLocations(transformed);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    return (
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }} style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Identification Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="info" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Identification</Text>
                </View>
                <View style={styles.sectionContent}>
                    {/* Asset Name */}
                    <TextInput
                        label="Asset Name"
                        mode="outlined"
                        value={assetName}
                        onChangeText={text => {
                            setAssetName(text);
                            if (text) setErrors(errors => ({ ...errors, assetName: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.assetName && (touched.assetName || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.assetName && (touched.assetName || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, assetName: true }))}
                    />
                    {!!errors.assetName && (touched.assetName || touched.submit) && (
                        <HelperText type="error" visible={!!errors.assetName}>
                            {errors.assetName}
                        </HelperText>
                    )}

                    {/* VIN */}
                    <TextInput
                        label="VIN"
                        mode="outlined"
                        value={vin}
                        onChangeText={text => {
                            setVin(text);
                            if (text) setErrors(errors => ({ ...errors, vin: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.vin && (touched.vin || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.vin && (touched.vin || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, vin: true }))}
                    />
                    {!!errors.vin && (touched.vin || touched.submit) && (
                        <HelperText type="error" visible={!!errors.vin}>
                            {errors.vin}
                        </HelperText>
                    )}

                    {/* License Plate */}
                    <TextInput
                        label="License Plate"
                        mode="outlined"
                        value={licensePlate}
                        onChangeText={text => {
                            setLicensePlate(text);
                            if (text) setErrors(errors => ({ ...errors, licensePlate: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.licensePlate && (touched.licensePlate || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.licensePlate && (touched.licensePlate || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, licensePlate: true }))}
                    />
                    {!!errors.licensePlate && (touched.licensePlate || touched.submit) && (
                        <HelperText type="error" visible={!!errors.licensePlate}>
                            {errors.licensePlate}
                        </HelperText>
                    )}

                    {/* Location */}
                    <CustomDropdown
                        data={locations}
                        placeholder="Location"
                        value={location}
                        onValueChange={val => {
                            setLocation(val);
                            if (val) setErrors(errors => ({ ...errors, location: undefined }));
                        }}
                        error={!!errors.location && (touched.location || touched.submit)}
                        {...dropdownProps}
                    />
                    {!!errors.location && (touched.location || touched.submit) && (
                        <HelperText type="error" visible={!!errors.location}>
                            {errors.location}
                        </HelperText>
                    )}
                </View>
            </View>

            {/* Vehicle Details Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="directions-car" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Vehicle Details</Text>
                </View>
                <View style={styles.sectionContent}>
                    {/* Vehicle Type */}
                    <CustomDropdown
                        data={assetTypeArray}
                        placeholder="Vehicle Type"
                        value={vehicleType}
                        onValueChange={val => {
                            setVehicleType(val);
                            if (val) setErrors(errors => ({ ...errors, vehicleType: undefined }));
                        }}
                        error={!!errors.vehicleType && (touched.vehicleType || touched.submit)}
                        {...dropdownProps}
                    />
                    {!!errors.vehicleType && (touched.vehicleType || touched.submit) && (
                        <HelperText type="error" visible={!!errors.vehicleType}>
                            {errors.vehicleType}
                        </HelperText>
                    )}

                    {/* Fuel Type */}
                    <CustomDropdown
                        data={fuelTypeArray}
                        placeholder="Fuel Type"
                        value={fuelType}
                        onValueChange={val => {
                            setFuelType(val);
                            if (val) setErrors(errors => ({ ...errors, fuelType: undefined }));
                        }}
                        error={!!errors.fuelType && (touched.fuelType || touched.submit)}
                        {...dropdownProps}
                    />
                    {!!errors.fuelType && (touched.fuelType || touched.submit) && (
                        <HelperText type="error" visible={!!errors.fuelType}>
                            {errors.fuelType}
                        </HelperText>
                    )}

                    {/* Year */}
                    <TextInput
                        label="Year"
                        mode="outlined"
                        value={year}
                        onChangeText={text => {
                            setYear(text);
                            if (text && !isNaN(text)) setErrors(errors => ({ ...errors, year: undefined }));
                        }}
                        keyboardType="number-pad"
                        style={styles.input}
                        activeOutlineColor={!!errors.year && (touched.year || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.year && (touched.year || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, year: true }))}
                    />
                    {!!errors.year && (touched.year || touched.submit) && (
                        <HelperText type="error" visible={!!errors.year}>
                            {errors.year}
                        </HelperText>
                    )}

                    {/* Make */}
                    <TextInput
                        label="Make"
                        mode="outlined"
                        value={make}
                        onChangeText={text => {
                            setMake(text);
                            if (text) setErrors(errors => ({ ...errors, make: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.make && (touched.make || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.make && (touched.make || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, make: true }))}
                    />
                    {!!errors.make && (touched.make || touched.submit) && (
                        <HelperText type="error" visible={!!errors.make}>
                            {errors.make}
                        </HelperText>
                    )}

                    {/* Model */}
                    <TextInput
                        label="Model"
                        mode="outlined"
                        value={model}
                        onChangeText={text => {
                            setModel(text);
                            if (text) setErrors(errors => ({ ...errors, model: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.model && (touched.model || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.model && (touched.model || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, model: true }))}
                    />
                    {!!errors.model && (touched.model || touched.submit) && (
                        <HelperText type="error" visible={!!errors.model}>
                            {errors.model}
                        </HelperText>
                    )}

                    {/* Trim */}
                    <TextInput
                        label="Trim"
                        mode="outlined"
                        value={trim}
                        onChangeText={text => {
                            setTrim(text);
                            if (text) setErrors(errors => ({ ...errors, trim: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.trim && (touched.trim || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.trim && (touched.trim || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, trim: true }))}
                    />
                    {!!errors.trim && (touched.trim || touched.submit) && (
                        <HelperText type="error" visible={!!errors.trim}>
                            {errors.trim}
                        </HelperText>
                    )}

                    <TextInput
                        label="Registration State/Province"
                        mode="outlined"
                        value={registrationState}
                        onChangeText={text => {
                            setRegistraionState(text);
                            if (text) setErrors(errors => ({ ...errors, registrationState: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.registrationState && (touched.registrationState || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.registrationState && (touched.registrationState || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, registrationState: true }))}
                    />
                    {!!errors.registrationState && (touched.registrationState || touched.submit) && (
                        <HelperText type="error" visible={!!errors.registrationState}>
                            {errors.registrationState}
                        </HelperText>
                    )}

                    {/* Status */}
                    <CustomDropdown
                        data={assetStatusArray}
                        placeholder="Status"
                        value={status}
                        onValueChange={val => {
                            setStatus(val);
                            if (val) setErrors(errors => ({ ...errors, status: undefined }));
                        }}
                        error={!!errors.status && (touched.status || touched.submit)}
                        {...dropdownProps}
                    />
                    {!!errors.status && (touched.status || touched.submit) && (
                        <HelperText type="error" visible={!!errors.status}>
                            {errors.status}
                        </HelperText>
                    )}
                </View>
            </View>

            {/* Assignment Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="assignment" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Assignment</Text>
                </View>
                <View style={styles.sectionContent}>
                    <CustomDropdown
                        data={[
                            { label: 'Active', value: 'Active' },
                            { label: 'InMaintenance', value: 'InMaintenance' },
                            { label: 'Inactive', value: 'Inactive' },
                        ]}
                        placeholder="Operator"
                        value={operator}
                        onValueChange={setOperator}
                        {...dropdownProps}
                    />

                    <CustomDropdown
                        data={[
                            { label: 'Active', value: 'Active' },
                            { label: 'InMaintenance', value: 'InMaintenance' },
                            { label: 'Inactive', value: 'Inactive' },
                        ]}
                        placeholder="Owner"
                        value={owner}
                        onValueChange={setOwner}
                        {...dropdownProps}
                    />
                </View>
            </View>

            {/* Images Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="image" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Images</Text>
                </View>
                <View style={styles.sectionContent}>
                    <TouchableOpacity
                        style={styles.uploadContainer}
                        onPress={() => {
                            setTouched(t => ({ ...t, images: true }));
                            handlePickImage();
                        }}
                    >
                        <Feather name="upload-cloud" size={24} color="black" />
                        <Text style={styles.uploadText}>
                            Drag & drop files here or click to browse (max 6 images)
                        </Text>
                    </TouchableOpacity>

                    {/* Show selected images preview */}
                    {Array.isArray(images) && images.length > 0 && (
                        <View style={styles.imagePreviewContainer}>
                            {images.map((img, idx) => (
                                <View key={idx} style={styles.imagePreview}>
                                    <Image source={{ uri: img.uri }} style={styles.previewImage} />
                                </View>
                            ))}
                        </View>
                    )}

                    {!!errors.images && (touched.images || touched.submit) && (
                        <HelperText type="error" visible={!!errors.images}>
                            {errors.images}
                        </HelperText>
                    )}
                </View>
            </View>

            {/* Submit Button */}
            <Button
                rippleColor={'green'}
                mode="contained"
                buttonColor='#0acf97'
                onPress={() => {
                    setTouched(t => ({ ...t, submit: true }));
                    onSubmit();
                }}
                style={styles.button}
                contentStyle={{ borderRadius: 8, paddingVertical: 6 }}
            >
                Next
            </Button>
        </ScrollView>
    )
}

export default AddAssetDetails;

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 16,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#0acf97',
    },
    sectionIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    sectionContent: {
        paddingVertical: 16,
        paddingHorizontal: 15,
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 4,
        borderRadius: 8,
    },
    button: {
        marginTop: 20,
        marginHorizontal: 23,
        borderRadius: 8,
    },
    uploadContainer: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'silver',
        borderStyle: 'dashed',
        borderRadius: 8,
    },
    uploadText: {
        color: '#000',
        marginTop: 10,
        width: '80%',
        textAlign: 'center',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    imagePreview: {
        marginRight: 8,
        marginBottom: 8,
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
});