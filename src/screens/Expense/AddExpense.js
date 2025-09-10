import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    TextInput,
    Button,
    HelperText,
    RadioButton,
} from 'react-native-paper';
import CustomDropdown from '../../../components/assets/CustomDropdown';
import { getUserDataFromToken } from '../../api/getCompanyIdFromToken';
import { getAssetsForDropdown } from '../../api/assets';
import { eExpenseType } from '../../../constants/Enums';
import { createExpense } from '../../api/expense';

const AddExpense = ({ onBack, onCreateExpense, onCancel }) => {
    const [formData, setFormData] = useState({
        asset: '',
        expenseType: '',
        date: new Date(),
        frequency: 'SingleExpense',
        amount: '',
        notes: '',
    });

    const [userId, setUserId] = useState(0);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateDisplay, setDateDisplay] = useState('');

    const expenseTypeOptions = Object.entries(eExpenseType)
        .filter(([key, value]) => typeof value === 'number')
        .map(([label, value]) => ({
            label,
            value,
        }));

    const validateForm = () => {
        const newErrors = {};

        // Required field validations
        if (!formData.asset) {
            newErrors.asset = 'Please select an asset';
        }

        if (!formData.expenseType) {
            newErrors.expenseType = 'Please select an expense type';
        }

        if (!formData.amount.trim()) {
            newErrors.amount = 'Please enter a valid amount greater than zero';
        } else if (parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount greater than zero';
        }

        if (!dateDisplay.trim()) {
            newErrors.date = 'Please select a date';
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
            setFormData(prev => ({ ...prev, date: selectedDate }));
            setDateDisplay(selectedDate.toDateString());
            setErrors(prev => ({ ...prev, date: undefined }));
        }
    };

    const handleCreateExpense = () => {
        if (validateForm()) {
            setLoading(true);

            const data = {
                "assetID": formData.asset,
                "expenseType": formData.expenseType,
                "amount": formData.amount,
                "date": formData.date,
                "frequency": parseInt(formData.frequency),
                "notes": formData.notes,
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
                "vendors": [
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

            createExpense(userId, data)
                .then(exp => {
                    if (exp.title == 'Duplicate Expense Found') {
                        Alert.alert('Create Expense', exp.description);
                    }
                    else if (exp.success) {
                        setFormData({
                            asset: '',
                            expenseType: '',
                            date: new Date(),
                            frequency: 'SingleExpense',
                            amount: '',
                            notes: '',
                        })
                        Alert.alert('Create Expense', 'Expense created successfully.');
                    }
                    else {
                        Alert.alert('Create Expense', 'Some error occurred while creating a expense.');
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
                expenseType: true,
                date: true,
                amount: true
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

    useEffect(() => {
        setLoading(true);

        getUserDataFromToken()
            .then(data => {
                setUserId(data.sub);
            })
            .catch(error => {
                console.log(error);
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
                    {/* Expense Information Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="receipt" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Expense Information</Text>
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
                                data={expenseTypeOptions}
                                placeholder="Expense Type"
                                value={formData.expenseType}
                                onValueChange={val => {
                                    handleInputChange('expenseType', val);
                                    setTouched(prev => ({ ...prev, expenseType: true }));
                                }}
                                error={!!errors.expenseType && (touched.expenseType || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.expenseType && (touched.expenseType || touched.submit) && (
                                <HelperText type="error" visible={!!errors.expenseType}>
                                    {errors.expenseType}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Date & Frequency Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="date-range" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Date & Frequency</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Date"
                                value={dateDisplay}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.date && (touched.date || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.date && (touched.date || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, date: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showDatePicker && (
                                <RNDateTimePicker
                                    value={formData.date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}
                            {!!errors.date && (touched.date || touched.submit) && (
                                <HelperText type="error" visible={!!errors.date}>
                                    {errors.date}
                                </HelperText>
                            )}

                            <View style={styles.radioContainer}>
                                <Text style={styles.radioLabel}>Frequency</Text>
                                <RadioButton.Group
                                    onValueChange={value => handleInputChange('frequency', value)}
                                    value={formData.frequency}
                                >
                                    <View style={styles.radioOption}>
                                        <View style={{
                                            borderWidth: 1,
                                            borderColor: 'grey',
                                            borderRadius: 99
                                        }}>
                                            <RadioButton value="1" color="#0acf97" />
                                        </View>
                                        <Text style={styles.radioText}>Single Expense</Text>
                                    </View>
                                    <View style={styles.radioOption}>
                                        <View style={{
                                            borderWidth: 1,
                                            borderColor: 'grey',
                                            borderRadius: 99
                                        }}>
                                            <RadioButton value="2" color="#0acf97" />
                                        </View>
                                        <Text style={styles.radioText}>Recurring Expense</Text>
                                    </View>
                                </RadioButton.Group>
                            </View>
                        </View>
                    </View>

                    {/* Expense Details Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="attach-money" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Expense Details</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Amount"
                                mode="outlined"
                                value={formData.amount}
                                onChangeText={text => {
                                    handleInputChange('amount', text);
                                    if (text) setErrors(errors => ({ ...errors, amount: undefined }));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                activeOutlineColor={!!errors.amount && (touched.amount || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.amount && (touched.amount || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, amount: true }))}
                            />
                            {!!errors.amount && (touched.amount || touched.submit) && (
                                <HelperText type="error" visible={!!errors.amount}>
                                    {errors.amount}
                                </HelperText>
                            )}

                            <TextInput
                                label="Notes (optional)"
                                mode="outlined"
                                value={formData.notes}
                                onChangeText={text => {
                                    if (text.length <= 50) {
                                        handleInputChange('notes', text);
                                    }
                                }}
                                style={[styles.input, { minHeight: 100 }]}
                                multiline
                                numberOfLines={4}
                                theme={inputTheme}
                                maxLength={50}
                            />
                            <HelperText type="info" visible={true}>
                                {formData.notes.length}/50 characters
                            </HelperText>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <Button
                        rippleColor={'green'}
                        mode="contained"
                        buttonColor='#0acf97'
                        onPress={() => {
                            setTouched(t => ({ ...t, submit: true }));
                            handleCreateExpense();
                        }}
                        style={styles.button}
                        contentStyle={{ borderRadius: 8, paddingVertical: 6 }}
                    >
                        Create Expense
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
    radioContainer: {
        marginTop: 8,
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    radioText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 8,
    },
});

export default AddExpense;