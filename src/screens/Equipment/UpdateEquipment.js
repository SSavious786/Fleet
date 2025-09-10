import React, { useEffect, useState } from 'react';
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
} from 'react-native';
import {
    TextInput,
    Button,
    HelperText,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import CustomDropdown from '../../../components/assets/CustomDropdown';
import { getAssets } from '../../api/assets';
import { eEquipmentStatus, eEquipmentType } from '../../../constants/Enums'
import { getUserDataFromToken } from '../../api/getCompanyIdFromToken';
import { createEquipment, updateEquipment } from '../../api/equipment';
import { useRoute } from '@react-navigation/native';

const UpdateEquipment = ({ onSubmitSuccess }) => {
    const route = useRoute();
    const equipmentId = route.params.id;
    console.log(route.params)
    // Date states
    const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
    const [showWarantyExpirationDatePicker, setShowWarantyExpirationDatePicker] = useState(false);
    const [showInServiceDatePicker, setShowInServiceDatePicker] = useState(false);
    const [showOutOfServiceDatePicker, setShowOutOfServiceDatePicker] = useState(false);
    const [datePickerType, setDatePickerType] = useState('');

    // Basic Information states
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(0);
    const [asset, setAsset] = useState(route.params.assetID);
    const [name, setName] = useState(route.params.name);
    const [serialNumber, setSerialNumber] = useState(route.params.serialNumber);
    const [model, setModel] = useState(route.params.model);
    const [brand, setBrand] = useState(route.params.brand);
    const [currentAssignee, setCurrentAssignee] = useState(route.params.currentAssignee);
    const [equipmentLocation, setEquipmentLocation] = useState(route.params.location);

    // Additional Details states
    const [type, setType] = useState(route.params.type);
    const [status, setStatus] = useState(route.params.status);
    const [purchaseVendor, setPurchaseVendor] = useState(route.params.purchaseVendor);
    const [purchaseDate, setPurchaseDate] = useState(new Date(route.params.purchaseDate));
    const [purchasePrice, setPurchasePrice] = useState(route.params.purchasePrice.toString());
    const [warrantyExpiration, setWarrantyExpiration] = useState(new Date(route.params.warrantyExpirationDate));

    // Lifecycle Details states
    const [inServiceDate, setInServiceDate] = useState(new Date(route.params.inServiceDate));
    const [serviceLifeMonths, setServiceLifeMonths] = useState(route.params.estimatedServiceLifeInMonths.toString());
    const [estResaleValue, setEstResaleValue] = useState(route.params.estimatedResaleValue.toString());
    const [outOfServiceDate, setOutOfServiceDate] = useState(new Date(route.params.outOfServiceDate));

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const onChangeDate = (event, selectedDate) => {
        setShowPurchaseDatePicker(false);
        setShowWarantyExpirationDatePicker(false);
        setShowInServiceDatePicker(false);
        setShowOutOfServiceDatePicker(false);
        if (selectedDate) {
            switch (datePickerType) {
                case 'purchase':
                    setPurchaseDate(selectedDate);
                    break;
                case 'warranty':
                    setWarrantyExpiration(selectedDate);
                    break;
                case 'inService':
                    setInServiceDate(selectedDate);
                    break;
                case 'outOfService':
                    setOutOfServiceDate(selectedDate);
                    break;
                default:
                    setPurchaseDate(selectedDate);
            }
        }
    };

    const openDatePicker = (type) => {
        setDatePickerType(type);

        switch (type) {
            case 'purchase':
                setShowPurchaseDatePicker(true);
                break;
            case 'warranty':
                setShowWarantyExpirationDatePicker(true);
                break;
            case 'inService':
                setShowInServiceDatePicker(true);
                break;
            case 'outOfService':
                setShowOutOfServiceDatePicker(true);
                break;
            default:
                setShowPurchaseDatePicker(true);
        }
    };

    const validate = () => {
        const newErrors = {};

        // Basic Information - all required
        if (!asset) newErrors.Asset = 'Asset is required';
        if (!type) newErrors.Type = 'Type is required';
        if (!status) newErrors.Status = 'Status is required';
        if (!name) newErrors.name = 'Name is required';
        if (!serialNumber) newErrors.serialNumber = 'Serial Number is required';
        if (!model) newErrors.model = 'Model is required';
        if (!brand) newErrors.brand = 'Brand is required';
        if (!currentAssignee) newErrors.currentAssignee = 'Current Assignee is required';
        if (!equipmentLocation) newErrors.equipmentLocation = 'Location is required';

        // Additional Details - required fields
        if (!purchaseVendor) newErrors.purchaseVendor = 'Purchase Vendor is required';
        if (!purchasePrice) newErrors.purchasePrice = 'Purchase Price is required';
        if (!warrantyExpiration) newErrors.warrantyExpiration = 'Warranty Expiration is required';

        // Lifecycle Details - required fields
        if (!serviceLifeMonths) newErrors.serviceLifeMonths = 'Service Life is required';
        if (!estResaleValue) newErrors.estResaleValue = 'Est. Resale Value is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = () => {
        if (validate()) {
            setLoading(true);

            const data = {
                "name": name,
                "brand": brand,
                "model": model,
                "serialNumber": serialNumber,
                "currentAssignee": currentAssignee,
                "location": equipmentLocation,
                "status": status.toString(),
                "type": type.toString(),
                "purchaseVendor": purchaseVendor,
                "purchasePrice": parseInt(purchasePrice),
                "purchaseDate": purchaseDate.toISOString(),
                "warrantyExpirationDate": warrantyExpiration.toISOString(),
                "comments": "",
                "inServiceDate": inServiceDate.toISOString(),
                "estimatedServiceLifeInMonths": parseInt(serviceLifeMonths),
                "estimatedResaleValue": parseInt(estResaleValue),
                "outOfServiceDate": outOfServiceDate.toISOString(),
                "assetID": asset,
                "equipmentTypeList": [
                    {
                        "disabled": true,
                        "group": {
                            "disabled": true,
                            "name": "string"
                        },
                        "selected": true,
                        "text": "string",
                        "value": "string"
                    }
                ],
                "statusList": [
                    {
                        "disabled": true,
                        "group": {
                            "disabled": true,
                            "name": "string"
                        },
                        "selected": true,
                        "text": "string",
                        "value": "string"
                    }
                ],
                "assetList": [
                    {
                        "disabled": true,
                        "group": {
                            "disabled": true,
                            "name": "string"
                        },
                        "selected": true,
                        "text": "string",
                        "value": "string"
                    }
                ]
            }

            updateEquipment(equipmentId, userId, data)
                .then(eqp => {
                   if (eqp.success) {
                        Alert.alert('Update Equipment', 'Equipment updated successfully.');
                    }
                    else {
                        Alert.alert('Update Equipment', 'Some error occurred while updating a equipment.');
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        } else {
            setTouched({
                Asset: true,
                Type: true,
                Status: true,
                name: true,
                serialNumber: true,
                model: true,
                brand: true,
                currentAssignee: true,
                equipmentLocation: true,
                purchaseVendor: true,
                purchasePrice: true,
                serviceLifeMonths: true,
                estResaleValue: true
            });
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

    async function getAssetData() {
        setLoading(true);
        const data = await getAssets();
        const transformed = data.map(asset => ({
            label: asset.assetName,
            value: asset.id
        }));
        setAssets(transformed);
        setLoading(false);
    }


    const equipmentTypeArray = Object.entries(eEquipmentType)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    const equipmentStatusArray = Object.entries(eEquipmentStatus)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));


    useEffect(() => {
        getAssetData();
        getUserDataFromToken()
            .then(data => {
                setUserId(data.sub);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);


    return (
        loading
            ?
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff'
            }}>
                <ActivityIndicator size={'large'} />
            </View>
            :
            <KeyboardAvoidingView style={{ flex: 1 }} contentContainerStyle={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS == 'ios' ? 80 : 0}>
                <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }} style={{ flex: 1, backgroundColor: '#fff' }}>
                    {/* Basic Information Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="info" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <CustomDropdown
                                data={assets}
                                placeholder="Asset"
                                value={asset}
                                onValueChange={val => {
                                    console.log(val)
                                    setAsset(val);
                                    if (val) setErrors(errors => ({ ...errors, Asset: undefined }));
                                }}
                                error={!!errors.Asset && (touched.Asset || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.Asset && (touched.Asset || touched.submit) && (
                                <HelperText type="error" visible={!!errors.Asset}>
                                    {errors.Asset}
                                </HelperText>
                            )}

                            <TextInput
                                label="Name"
                                mode="outlined"
                                value={name}
                                onChangeText={text => {
                                    setName(text);
                                    if (text) setErrors(errors => ({ ...errors, name: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.name && (touched.name || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.name && (touched.name || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, name: true }))}
                            />
                            {!!errors.name && (touched.name || touched.submit) && (
                                <HelperText type="error" visible={!!errors.name}>
                                    {errors.name}
                                </HelperText>
                            )}

                            <TextInput
                                label="Serial Number"
                                mode="outlined"
                                value={serialNumber}
                                onChangeText={text => {
                                    setSerialNumber(text);
                                    if (text) setErrors(errors => ({ ...errors, serialNumber: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.serialNumber && (touched.serialNumber || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.serialNumber && (touched.serialNumber || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, serialNumber: true }))}
                            />
                            {!!errors.serialNumber && (touched.serialNumber || touched.submit) && (
                                <HelperText type="error" visible={!!errors.serialNumber}>
                                    {errors.serialNumber}
                                </HelperText>
                            )}

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

                            <TextInput
                                label="Brand"
                                mode="outlined"
                                value={brand}
                                onChangeText={text => {
                                    setBrand(text);
                                    if (text) setErrors(errors => ({ ...errors, brand: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.brand && (touched.brand || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.brand && (touched.brand || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, brand: true }))}
                            />
                            {!!errors.brand && (touched.brand || touched.submit) && (
                                <HelperText type="error" visible={!!errors.brand}>
                                    {errors.brand}
                                </HelperText>
                            )}

                            <TextInput
                                label="Current Assignee"
                                mode="outlined"
                                value={currentAssignee}
                                onChangeText={text => {
                                    setCurrentAssignee(text);
                                    if (text) setErrors(errors => ({ ...errors, currentAssignee: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.currentAssignee && (touched.currentAssignee || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.currentAssignee && (touched.currentAssignee || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, currentAssignee: true }))}
                            />
                            {!!errors.currentAssignee && (touched.currentAssignee || touched.submit) && (
                                <HelperText type="error" visible={!!errors.currentAssignee}>
                                    {errors.currentAssignee}
                                </HelperText>
                            )}

                            <TextInput
                                label="Location"
                                mode="outlined"
                                value={equipmentLocation}
                                onChangeText={text => {
                                    setEquipmentLocation(text);
                                    if (text) setErrors(errors => ({ ...errors, equipmentLocation: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.equipmentLocation && (touched.equipmentLocation || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.equipmentLocation && (touched.equipmentLocation || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, equipmentLocation: true }))}
                            />
                            {!!errors.equipmentLocation && (touched.equipmentLocation || touched.submit) && (
                                <HelperText type="error" visible={!!errors.equipmentLocation}>
                                    {errors.equipmentLocation}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Additional Details Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="description" size={20} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Additional Details</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <CustomDropdown
                                data={equipmentTypeArray}
                                placeholder="Type"
                                value={type}
                                onValueChange={val => {
                                    setType(val);
                                    if (val) setErrors(errors => ({ ...errors, Type: undefined }));
                                }}
                                error={!!errors.Type && (touched.Type || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.Type && (touched.Type || touched.submit) && (
                                <HelperText type="error" visible={!!errors.Type}>
                                    {errors.Type}
                                </HelperText>
                            )}

                            <CustomDropdown
                                data={equipmentStatusArray}
                                placeholder="Status"
                                value={status}
                                onValueChange={val => {
                                    setStatus(val);
                                    if (val) setErrors(errors => ({ ...errors, Status: undefined }));
                                }}
                                error={!!errors.Status && (touched.Status || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.Status && (touched.Status || touched.submit) && (
                                <HelperText type="error" visible={!!errors.Status}>
                                    {errors.Status}
                                </HelperText>
                            )}

                            <TextInput
                                label="Purchase Vendor"
                                mode="outlined"
                                value={purchaseVendor}
                                onChangeText={text => {
                                    setPurchaseVendor(text);
                                    if (text) setErrors(errors => ({ ...errors, purchaseVendor: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.purchaseVendor && (touched.purchaseVendor || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.purchaseVendor && (touched.purchaseVendor || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, purchaseVendor: true }))}
                            />
                            {!!errors.purchaseVendor && (touched.purchaseVendor || touched.submit) && (
                                <HelperText type="error" visible={!!errors.purchaseVendor}>
                                    {errors.purchaseVendor}
                                </HelperText>
                            )}

                            <TextInput
                                label="Purchase Date"
                                value={purchaseDate.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                right={<TextInput.Icon icon="calendar" onPress={() => openDatePicker('purchase')} forceTextInputFocus={false} />}
                            />
                            {showPurchaseDatePicker && (
                                <RNDateTimePicker
                                    value={new Date(purchaseDate)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeDate}
                                />
                            )}

                            <TextInput
                                label="Purchase Price"
                                mode="outlined"
                                value={purchasePrice}
                                onChangeText={text => {
                                    setPurchasePrice(text);
                                    if (text) setErrors(errors => ({ ...errors, purchasePrice: undefined }));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                activeOutlineColor={!!errors.purchasePrice && (touched.purchasePrice || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.purchasePrice && (touched.purchasePrice || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, purchasePrice: true }))}
                            />
                            {!!errors.purchasePrice && (touched.purchasePrice || touched.submit) && (
                                <HelperText type="error" visible={!!errors.purchasePrice}>
                                    {errors.purchasePrice}
                                </HelperText>
                            )}

                            <TextInput
                                label="Warranty Expiration Date"
                                value={warrantyExpiration.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                right={<TextInput.Icon icon="calendar" onPress={() => openDatePicker('warranty')} forceTextInputFocus={false} />}
                            />
                            {showWarantyExpirationDatePicker && (
                                <RNDateTimePicker
                                    value={new Date(warrantyExpiration)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeDate}
                                />
                            )}
                        </View>
                    </View>

                    {/* Lifecycle Details Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="history" size={20} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Lifecycle Details</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="In Service Date"
                                value={inServiceDate.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                right={<TextInput.Icon icon="calendar" onPress={() => openDatePicker('inService')} forceTextInputFocus={false} />}
                            />
                            {showInServiceDatePicker && (
                                <RNDateTimePicker
                                    value={new Date(inServiceDate)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeDate}
                                />
                            )}

                            <TextInput
                                label="Service Life (months)"
                                mode="outlined"
                                value={serviceLifeMonths}
                                onChangeText={text => {
                                    setServiceLifeMonths(text);
                                    if (text) setErrors(errors => ({ ...errors, serviceLifeMonths: undefined }));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                activeOutlineColor={!!errors.serviceLifeMonths && (touched.serviceLifeMonths || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.serviceLifeMonths && (touched.serviceLifeMonths || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, serviceLifeMonths: true }))}
                            />
                            {!!errors.serviceLifeMonths && (touched.serviceLifeMonths || touched.submit) && (
                                <HelperText type="error" visible={!!errors.serviceLifeMonths}>
                                    {errors.serviceLifeMonths}
                                </HelperText>
                            )}

                            <TextInput
                                label="Est. Resale Value"
                                mode="outlined"
                                value={estResaleValue}
                                onChangeText={text => {
                                    setEstResaleValue(text);
                                    if (text) setErrors(errors => ({ ...errors, estResaleValue: undefined }));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                activeOutlineColor={!!errors.estResaleValue && (touched.estResaleValue || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.estResaleValue && (touched.estResaleValue || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, estResaleValue: true }))}
                            />
                            {!!errors.estResaleValue && (touched.estResaleValue || touched.submit) && (
                                <HelperText type="error" visible={!!errors.estResaleValue}>
                                    {errors.estResaleValue}
                                </HelperText>
                            )}

                            <TextInput
                                label="Out of Service Date"
                                value={outOfServiceDate.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                right={<TextInput.Icon icon="calendar" onPress={() => openDatePicker('outOfService')} forceTextInputFocus={false} />}
                            />
                            {showOutOfServiceDatePicker && (
                                <RNDateTimePicker
                                    value={new Date(outOfServiceDate)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeDate}
                                />
                            )}
                        </View>
                    </View>

                    {/* Date Picker */}


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
                        Update Equipment
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
    );
};

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
});

export default UpdateEquipment;