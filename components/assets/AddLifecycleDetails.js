import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, Platform, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';

function AddLifecycleDetails({ onSubmitSuccess, onBack, initialData = {} }) {
    const [serviceDate, setServiceDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [displayDate, setDisplayDate] = useState('');

    const [serviceOdometer, setServiceOdometer] = useState('');
    const [serviceLifeMonths, setServiceLifeMonths] = useState('');
    const [serviceLifeMeters, setServiceLifeMeters] = useState('');
    const [resaleValue, setResaleValue] = useState('');

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize form with initial data if provided
    useEffect(() => {
        // Only initialize if we have actual initial data (for edit mode) and haven't initialized yet
        if (initialData && Object.keys(initialData).length > 0 && !isInitialized) {
            if (initialData.inServiceDate) {
                const date = new Date(initialData.inServiceDate);
                setServiceDate(date);
                setDisplayDate(date.toDateString());
            }
            setServiceOdometer(initialData.inServiceOdometer || '');
            setServiceLifeMonths(initialData.estimatedServiceLifeInMonths || '');
            setServiceLifeMeters(initialData.estimatedServiceLifeInMeters || '');
            setResaleValue(initialData.estimatedResaleValue || '');
            setIsInitialized(true);
        }
    }, [initialData, isInitialized]); // Re-run when initialData changes or initialization status changes

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false); // Always close after picking
        if (selectedDate) {
            setServiceDate(selectedDate);
            setDisplayDate(selectedDate.toDateString());
            setErrors(errors => ({ ...errors, displayDate: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!displayDate) newErrors.displayDate = 'In-Service Date is required';
        if (!serviceOdometer) newErrors.serviceOdometer = 'Odometer is required';
        if (!serviceLifeMonths) newErrors.serviceLifeMonths = 'Service life (months) is required';
        if (!serviceLifeMeters) newErrors.serviceLifeMeters = 'Service life (meters) is required';
        if (!resaleValue) newErrors.resaleValue = 'Resale value is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = () => {
        if (validate()) {
            const data = {
                inServiceDate: serviceDate ? serviceDate.toISOString() : new Date().toISOString(),
                inServiceOdometer: serviceOdometer,
                estimatedServiceLifeInMonths: serviceLifeMonths,
                estimatedServiceLifeInMeters: serviceLifeMeters,
                estimatedResaleValue: resaleValue
            };
            if (onSubmitSuccess) {
                onSubmitSuccess(data); // Send data to parent
            }
        } else {
            setTouched({
                displayDate: true,
                serviceOdometer: true,
                serviceLifeMonths: true,
                serviceLifeMeters: true,
                resaleValue: true,
                submit: true
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

    return (
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }} style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* In-Service Details Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="schedule" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>In-Service Details</Text>
                </View>
                <View style={styles.sectionContent}>
                    <TextInput
                        label="In-Service Date"
                        value={displayDate}
                        editable={false}
                        mode="outlined"
                        theme={inputTheme}
                        style={styles.input}
                        outlineColor={!!errors.displayDate && (touched.displayDate || touched.submit) ? 'red' : '#000'}
                        activeOutlineColor={!!errors.displayDate && (touched.displayDate || touched.submit) ? 'red' : '#0acf97'}
                        onBlur={() => setTouched(t => ({ ...t, displayDate: true }))}
                        right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} forceTextInputFocus={false} />}
                    />
                    {showDatePicker && (
                        <RNDateTimePicker
                            value={serviceDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeDate}
                        />
                    )}
                    {!!errors.displayDate && (touched.displayDate || touched.submit) && (
                        <HelperText type="error" visible={!!errors.displayDate}>
                            {errors.displayDate}
                        </HelperText>
                    )}

                    <TextInput
                        label="In-Service Odometer"
                        mode="outlined"
                        value={serviceOdometer}
                        onChangeText={text => {
                            setServiceOdometer(text);
                            if (text) setErrors(errors => ({ ...errors, serviceOdometer: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.serviceOdometer && (touched.serviceOdometer || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.serviceOdometer && (touched.serviceOdometer || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, serviceOdometer: true }))}
                    />
                    {!!errors.serviceOdometer && (touched.serviceOdometer || touched.submit) && (
                        <HelperText type="error" visible={!!errors.serviceOdometer}>
                            {errors.serviceOdometer}
                        </HelperText>
                    )}
                </View>
            </View>

            {/* Vehicle Life Estimates Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="timeline" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Vehicle Life Estimates</Text>
                </View>
                <View style={styles.sectionContent}>
                    <TextInput
                        label="Estimated Service Life (Months)"
                        mode="outlined"
                        keyboardType="numeric"
                        value={serviceLifeMonths}
                        onChangeText={text => {
                            setServiceLifeMonths(text);
                            if (text) setErrors(errors => ({ ...errors, serviceLifeMonths: undefined }));
                        }}
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
                        label="Estimated Service Life (Meters)"
                        mode="outlined"
                        keyboardType="numeric"
                        value={serviceLifeMeters}
                        onChangeText={text => {
                            setServiceLifeMeters(text);
                            if (text) setErrors(errors => ({ ...errors, serviceLifeMeters: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.serviceLifeMeters && (touched.serviceLifeMeters || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.serviceLifeMeters && (touched.serviceLifeMeters || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, serviceLifeMeters: true }))}
                    />
                    {!!errors.serviceLifeMeters && (touched.serviceLifeMeters || touched.submit) && (
                        <HelperText type="error" visible={!!errors.serviceLifeMeters}>
                            {errors.serviceLifeMeters}
                        </HelperText>
                    )}

                    <TextInput
                        label="Estimated Resale Value"
                        mode="outlined"
                        keyboardType="numeric"
                        value={resaleValue}
                        onChangeText={text => {
                            setResaleValue(text);
                            if (text) setErrors(errors => ({ ...errors, resaleValue: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.resaleValue && (touched.resaleValue || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.resaleValue && (touched.resaleValue || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, resaleValue: true }))}
                    />
                    {!!errors.resaleValue && (touched.resaleValue || touched.submit) && (
                        <HelperText type="error" visible={!!errors.resaleValue}>
                            {errors.resaleValue}
                        </HelperText>
                    )}
                </View>
            </View>

            {/* Navigation Buttons */}
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

export default AddLifecycleDetails;

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