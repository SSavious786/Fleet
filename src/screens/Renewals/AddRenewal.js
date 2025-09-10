import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import {
    TextInput,
    Button,
    HelperText,
} from 'react-native-paper';
import CustomDropdown from '../../../components/assets/CustomDropdown';
import { getUserDataFromToken } from '../../api/getCompanyIdFromToken';
import { getAssetsForDropdown } from '../../api/assets';
import { eRenewalType, RenewalStatus } from '../../../constants/Enums';
import { createRenewal } from '../../api/renewal';

const AddRenewal = ({ onBack, onSaveRenewal, onCancel }) => {
    const [formData, setFormData] = useState({
        asset: '',
        renewalType: '',
        dueDate: new Date(),
        status: '',
        dueSoonThreshold: '2',
        comments: '',
    });
    const [userId, setUserId] = useState(0);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateDisplay, setDateDisplay] = useState('');

    const assetOptions = [
        { label: 'Office Equipment', value: 'office_equipment' },
        { label: 'Vehicle', value: 'vehicle' },
        { label: 'Server', value: 'server' },
        { label: 'Network Equipment', value: 'network_equipment' },
        { label: 'Software License', value: 'software_license' },
    ];

    const renewalTypeOptions = [
        { label: 'License Renewal', value: 'license_renewal' },
        { label: 'Warranty Renewal', value: 'warranty_renewal' },
        { label: 'Insurance Renewal', value: 'insurance_renewal' },
        { label: 'Maintenance Contract', value: 'maintenance_contract' },
        { label: 'Subscription Renewal', value: 'subscription_renewal' },
    ];

    const statusOptions = [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    const validateForm = () => {
        const newErrors = {};

        // Required field validations
        if (!formData.asset) {
            newErrors.asset = 'Please select an asset';
        }

        if (!formData.renewalType) {
            newErrors.renewalType = 'Please select a renewal type';
        }

        if (!formData.status) {
            newErrors.status = 'Please select a status';
        }

        if (!formData.dueSoonThreshold.trim()) {
            newErrors.dueSoonThreshold = 'Please enter due soon threshold';
        } else if (parseFloat(formData.dueSoonThreshold) <= 0) {
            newErrors.dueSoonThreshold = 'Please enter a valid number greater than zero';
        }

        if (!dateDisplay.trim()) {
            newErrors.dueDate = 'Please select a due date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData(prev => ({ ...prev, dueDate: selectedDate }));
            setDateDisplay(selectedDate.toDateString());
            setErrors(prev => ({ ...prev, dueDate: undefined }));
        }
    };

    const handleSaveRenewal = () => {
        if (validateForm()) {
            setLoading(true);

            const data = {
                assetID: formData.asset,
                renewalType: formData.renewalType,
                dueDate: formData.dueDate,
                status: formData.status,
                dueSoonThreshold: parseInt(formData.dueSoonThreshold),
                comments: formData.comments,
                assets: [
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
            }

            createRenewal(userId, data)
                .then(data => {
                    if (data.title == 'Duplicate Renewal Found') {
                        Alert.alert('Create Ticket', 'A renewal with the same details already exists.');
                    }
                    else if (data.success) {
                        setFormData({
                            asset: '',
                            renewalType: '',
                            dueDate: new Date(),
                            status: '',
                            dueSoonThreshold: '2',
                            comments: '',
                        })
                        Alert.alert('Create Ticket', 'Ticket created successfully.');
                    }
                    else {
                        Alert.alert('Create Ticket', 'Some error occurred while creating a ticket.');
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        } else {
            setTouched({
                asset: true,
                renewalType: true,
                status: true,
                dueDate: true,
                dueSoonThreshold: true
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

    const renewalTypeArray = Object.entries(eRenewalType)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    const renewalStatusArray = Object.entries(RenewalStatus)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    useEffect(() => {
        setLoading(true);

        getUserDataFromToken()
            .then(data => {
                setUserId(data.sub);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });

        getAssetsForDropdown()
            .then(assets => {
                setAssets(assets);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });

        setLoading(false);
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
                    {/* Renewal Information Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="refresh" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Renewal Information</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <CustomDropdown
                                data={assets.map(asset => ({
                                    label: asset.assetName,
                                    value: asset.id
                                }))}
                                placeholder="Asset"
                                value={formData.asset}
                                onValueChange={val => {
                                    handleInputChange('asset', val);
                                    setTouched(prev => ({ ...prev, asset: true }));
                                }}
                                error={!!errors.asset && (touched.asset || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.asset && (touched.asset || touched.submit) && (
                                <HelperText type="error" visible={!!errors.asset}>
                                    {errors.asset}
                                </HelperText>
                            )}

                            <CustomDropdown
                                data={renewalTypeArray}
                                placeholder="Renewal Type"
                                value={formData.renewalType}
                                onValueChange={val => {
                                    handleInputChange('renewalType', val);
                                    setTouched(prev => ({ ...prev, renewalType: true }));
                                }}
                                error={!!errors.renewalType && (touched.renewalType || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.renewalType && (touched.renewalType || touched.submit) && (
                                <HelperText type="error" visible={!!errors.renewalType}>
                                    {errors.renewalType}
                                </HelperText>
                            )}

                            <TextInput
                                label="Due Date"
                                value={dateDisplay}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.dueDate && (touched.dueDate || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.dueDate && (touched.dueDate || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, dueDate: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showDatePicker && (
                                <RNDateTimePicker
                                    value={formData.dueDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}
                            {!!errors.dueDate && (touched.dueDate || touched.submit) && (
                                <HelperText type="error" visible={!!errors.dueDate}>
                                    {errors.dueDate}
                                </HelperText>
                            )}

                            <CustomDropdown
                                data={renewalStatusArray}
                                placeholder="Status"
                                value={formData.status}
                                onValueChange={val => {
                                    handleInputChange('status', val);
                                    setTouched(prev => ({ ...prev, status: true }));
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

                    {/* Threshold Settings Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="notification-important" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Threshold Settings</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.dueSoonContainer}>
                                <TextInput
                                    label="Due Soon Threshold"
                                    mode="outlined"
                                    value={formData.dueSoonThreshold}
                                    onChangeText={text => {
                                        handleInputChange('dueSoonThreshold', text);
                                        if (text) setErrors(errors => ({ ...errors, dueSoonThreshold: undefined }));
                                    }}
                                    keyboardType="numeric"
                                    style={[styles.input, styles.dueSoonInput]}
                                    activeOutlineColor={!!errors.dueSoonThreshold && (touched.dueSoonThreshold || touched.submit) ? 'red' : '#0acf97'}
                                    outlineColor={!!errors.dueSoonThreshold && (touched.dueSoonThreshold || touched.submit) ? 'red' : '#000'}
                                    theme={inputTheme}
                                    onBlur={() => setTouched(t => ({ ...t, dueSoonThreshold: true }))}
                                    right={<TextInput.Affix text="weeks" />}
                                />
                            </View>
                            <HelperText type="info" visible={true}>
                                Enter the number of weeks before due date when the renewal should be marked as "Due Soon".
                            </HelperText>
                            {!!errors.dueSoonThreshold && (touched.dueSoonThreshold || touched.submit) && (
                                <HelperText type="error" visible={!!errors.dueSoonThreshold}>
                                    {errors.dueSoonThreshold}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="comment" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Comments</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Comments (optional)"
                                mode="outlined"
                                activeOutlineColor='#0acf97'
                                value={formData.comments}
                                onChangeText={text => handleInputChange('comments', text)}
                                style={[styles.input, { minHeight: 100 }]}
                                multiline
                                numberOfLines={4}
                                theme={inputTheme}
                                placeholder="Add any additional notes or comments about this renewal"
                            />
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <Button
                        rippleColor={'green'}
                        mode="contained"
                        buttonColor='#0acf97'
                        onPress={() => {
                            setTouched(t => ({ ...t, submit: true }));
                            handleSaveRenewal();
                        }}
                        style={styles.button}
                        contentStyle={{ borderRadius: 8, paddingVertical: 6 }}
                    >
                        Save Renewal
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={onCancel}
                        style={[styles.button, { marginTop: 12 }]}
                        contentStyle={{ borderRadius: 8, paddingVertical: 6 }}
                        textColor="#666666"
                    >
                        Cancel
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
    dueSoonContainer: {
        marginBottom: 8,
    },
    dueSoonInput: {
        flex: 1,
    },
});

export default AddRenewal;