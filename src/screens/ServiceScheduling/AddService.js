import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import CustomDropdown from '../../../components/assets/CustomDropdown';
import { getUserDataFromToken } from '../../api/getCompanyIdFromToken';
import { getAssetsForDropdown } from '../../api/assets';
import { eServiceStatus } from '../../../constants/Enums';
import { getUsers } from '../../api/user';
import { createUserService } from '../../api/services';

function AddService({ onSubmitSuccess, onTabChange }) {
    const [formData, setFormData] = useState({
        asset: '',
        serviceTask: '',
        serviceType: '',
        assignedTo: '',
        timeInterval: '',
        timeDueSoonThreshold: '',
        primaryMeterThreshold: '',
        primaryMeterDueSoonThreshold: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(0);
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // All service fields are required
        if (!formData.asset) newErrors.asset = 'Asset is required';
        if (!formData.serviceTask) newErrors.serviceTask = 'Service Task is required';
        if (!formData.serviceType) newErrors.serviceType = 'Service Type is required';
        if (!formData.assignedTo) newErrors.assignedTo = 'Assigned To is required';
        if (!formData.timeInterval) newErrors.timeInterval = 'Time Interval is required';
        if (!formData.timeDueSoonThreshold) newErrors.timeDueSoonThreshold = 'Time Due Soon Threshold is required';
        if (!formData.primaryMeterThreshold) newErrors.primaryMeterThreshold = 'Primary Meter Threshold is required';
        if (!formData.primaryMeterDueSoonThreshold) newErrors.primaryMeterDueSoonThreshold = 'Primary Meter Due Soon Threshold is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = () => {
        if (validate()) {
            setLoading(true);

            const data = {
                assetID: formData.asset,
                serviceTask: formData.serviceTask,
                status: formData.serviceType,
                timeInterval: formData.timeInterval,
                timeDueSoonThreshold: formData.timeDueSoonThreshold,
                primaryMeterInterval: formData.primaryMeterThreshold,
                primaryMeterDueSoonThreshold: formData.primaryMeterDueSoonThreshold,
                assignedToUserID: formData.assignedTo,
                "assets": [
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
                "userList": [
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
            };

            createUserService(userId, data)
                .then(res => {
                    console.log(res)
                    if(res.title == 'Duplicate Service Found') {
                        Alert.alert('Create Service', res.description);
                    }
                    else if (res.success) {
                        Alert.alert('Create Service', 'Service created successfully.');
                    }
                    else {
                        Alert.alert('Create Service', 'Some error occurred while creating a service.');
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
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

    const serviceStatusArray = Object.entries(eServiceStatus)
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

        getUsers()
            .then(users => {
                setUsers(users.content.$values);
                setLoading(false);
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
                    {/* Service Information Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="build" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Service Information</Text>
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
                                    setTouched(prev => ({ ...prev, status: true }));
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
                                data={serviceStatusArray}
                                placeholder="Service Status"
                                value={formData.serviceType}
                                onValueChange={val => {
                                    handleInputChange('serviceType', val);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                error={!!errors.serviceType && (touched.serviceType || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.serviceType && (touched.serviceType || touched.submit) && (
                                <HelperText type="error" visible={!!errors.serviceType}>
                                    {errors.serviceType}
                                </HelperText>
                            )}

                            <TextInput
                                label="Service Task"
                                mode="outlined"
                                value={formData.serviceTask}
                                onChangeText={text => {
                                    handleInputChange('serviceTask', text);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.serviceTask && (touched.serviceTask || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.serviceTask && (touched.serviceTask || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, serviceTask: true }))}
                            />
                            {!!errors.serviceTask && (touched.serviceTask || touched.submit) && (
                                <HelperText type="error" visible={!!errors.serviceTask}>
                                    {errors.serviceTask}
                                </HelperText>
                            )}

                            <CustomDropdown
                                data={users.map(user => ({
                                    label: user.username,
                                    value: user.id
                                }))}
                                placeholder="Assigned To"
                                value={formData.assignedTo}
                                onValueChange={val => {
                                    handleInputChange('assignedTo', val);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                error={!!errors.assignedTo && (touched.assignedTo || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.assignedTo && (touched.assignedTo || touched.submit) && (
                                <HelperText type="error" visible={!!errors.assignedTo}>
                                    {errors.assignedTo}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Service Intervals Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="schedule" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Service Intervals</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Time Interval"
                                mode="outlined"
                                keyboardType='numeric'
                                value={formData.timeInterval}
                                onChangeText={text => {
                                    handleInputChange('timeInterval', text);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.timeInterval && (touched.timeInterval || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.timeInterval && (touched.timeInterval || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, timeInterval: true }))}
                            />
                            <Text style={styles.helperText}>Enter the number of days between service intervals.</Text>
                            {!!errors.timeInterval && (touched.timeInterval || touched.submit) && (
                                <HelperText type="error" visible={!!errors.timeInterval}>
                                    {errors.timeInterval}
                                </HelperText>
                            )}

                            <TextInput
                                label="Primary Meter Interval"
                                mode="outlined"
                                keyboardType='numeric'
                                value={formData.primaryMeterThreshold}
                                onChangeText={text => {
                                    handleInputChange('primaryMeterThreshold', text);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.primaryMeterInterval && (touched.primaryMeterInterval || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.primaryMeterInterval && (touched.primaryMeterInterval || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, primaryMeterInterval: true }))}
                            />
                            <Text style={styles.helperText}>Enter the mileage/hours between service intervals (0 to disable).</Text>
                            {!!errors.primaryMeterInterval && (touched.primaryMeterInterval || touched.submit) && (
                                <HelperText type="error" visible={!!errors.primaryMeterInterval}>
                                    {errors.primaryMeterInterval}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Due Soon Thresholds Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="notification-important" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Due Soon Thresholds</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Time Due Soon Threshold (days)"
                                mode="outlined"
                                value={formData.timeDueSoonThreshold}
                                onChangeText={text => {
                                    handleInputChange('timeDueSoonThreshold', text);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                activeOutlineColor={!!errors.timeDueSoonThreshold && (touched.timeDueSoonThreshold || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.timeDueSoonThreshold && (touched.timeDueSoonThreshold || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, timeDueSoonThreshold: true }))}
                            />
                            <Text style={styles.helperText}>Enter the number of days before due date when the service should be marked as "Due Soon".</Text>
                            {!!errors.timeDueSoonThreshold && (touched.timeDueSoonThreshold || touched.submit) && (
                                <HelperText type="error" visible={!!errors.timeDueSoonThreshold}>
                                    {errors.timeDueSoonThreshold}
                                </HelperText>
                            )}

                            <TextInput
                                label="Primary Meter Due Soon Threshold"
                                mode="outlined"
                                value={formData.primaryMeterDueSoonThreshold}
                                onChangeText={text => {
                                    handleInputChange('primaryMeterDueSoonThreshold', text);
                                    setTouched(prev => ({ ...prev, status: true }));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                activeOutlineColor={!!errors.primaryMeterDueSoonThreshold && (touched.primaryMeterDueSoonThreshold || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.primaryMeterDueSoonThreshold && (touched.primaryMeterDueSoonThreshold || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, primaryMeterDueSoonThreshold: true }))}
                            />
                            <Text style={styles.helperText}>Enter the mileage/hours before interval when service should be marked as "Due Soon" (0 to disable).</Text>
                            {!!errors.primaryMeterDueSoonThreshold && (touched.primaryMeterDueSoonThreshold || touched.submit) && (
                                <HelperText type="error" visible={!!errors.primaryMeterDueSoonThreshold}>
                                    {errors.primaryMeterDueSoonThreshold}
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
                        Save Service
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
    )
}

export default AddService;

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
    helperText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        marginTop: -2,
        paddingHorizontal: 4,
    },
});