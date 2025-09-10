import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getUsers } from '../../api/user';
import { getAssetsForDropdown } from '../../api/assets';
import { ePriority, eTicketStatus } from '../../../constants/Enums';
import { getUserDataFromToken } from '../../api/getCompanyIdFromToken';
import { updateTicket } from '../../api/tickets';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import CustomDropdown from '../../../components/assets/CustomDropdown';

const UpdateTicket = () => {
    const route = useRoute();
    console.log(route.params.assetID)
    const ticketId = route.params.id;
    const [formData, setFormData] = useState({
        asset: route.params.assetID,
        assignedTo: route.params.assignedToUserID,
        priority: route.params.priority,
        status: route.params.status,
        reportedDate: new Date(route.params.reportedDate),
        dueDate: new Date(route.params.dueDate),
        summary: route.params.summary,
        description: route.params.description,
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showReportedDatePicker, setShowReportedDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [reportedDateDisplay, setReportedDateDisplay] = useState(new Date(route.params.reportedDate).toDateString());
    const [dueDateDisplay, setDueDateDisplay] = useState(new Date(route.params.dueDate).toDateString());
    const [userId, setUserId] = useState(0);
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Required field validations
        if (!formData.asset) {
            newErrors.asset = 'Please select an asset';
        }

        if (!formData.assignedTo) {
            newErrors.assignedTo = 'Please select a user';
        }

        if (!formData.priority) {
            newErrors.priority = 'Please select a priority';
        }

        if (!formData.status) {
            newErrors.status = 'Please select a status';
        }

        if (!formData.summary.trim()) {
            newErrors.summary = 'Please enter a summary';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Please enter a description';
        }

        if (!reportedDateDisplay.trim()) {
            newErrors.reportedDate = 'Please select a reported date';
        }

        if (!dueDateDisplay.trim()) {
            newErrors.dueDate = 'Please select a due date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDateChange = (field, event, selectedDate) => {
        if (field === 'reportedDate') {
            setShowReportedDatePicker(false);
            if (selectedDate) {
                setFormData(prev => ({ ...prev, reportedDate: selectedDate }));
                setReportedDateDisplay(selectedDate.toDateString());
                setErrors(prev => ({ ...prev, reportedDate: undefined }));
            }
        } else if (field === 'dueDate') {
            setShowDueDatePicker(false);
            if (selectedDate) {
                setFormData(prev => ({ ...prev, dueDate: selectedDate }));
                setDueDateDisplay(selectedDate.toDateString());
                setErrors(prev => ({ ...prev, dueDate: undefined }));
            }
        }
    };

    const handleCreateTicket = () => {
        if (validateForm()) {
            setLoading(true);
            const selectedAsset = assets.find(x => x.id == formData.asset);
            const selectedUser = users.find(x => x.id == formData.assignedTo);

            const data = {
                assetID: formData.asset,
                assignedToUserID: formData.assignedTo,
                priority: formData.priority,
                reportedDate: formData.reportedDate,
                dueDate: formData.dueDate,
                summary: formData.summary,
                description: formData.description,
                status: formData.status,
                assets: [
                    {
                        disabled: true,
                        group: {
                            disabled: true,
                            name: "string"
                        },
                        selected: true,
                        text: "string",
                        value: "string"
                    }
                ],
                userList: [
                    {
                        disabled: true,
                        group: {
                            disabled: true,
                            name: "string"
                        },
                        selected: true,
                        text: "string",
                        value: "string"
                    }
                ]
            }

            updateTicket(ticketId, userId, data)
                .then(data => {
                    if (data.success) {
                        Alert.alert('Update Ticket', 'Ticket updated successfully.');
                    }
                    else {
                        Alert.alert('Update Ticket', 'Some error occurred while updating the ticket.');
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
                assignedTo: true,
                priority: true,
                status: true,
                summary: true,
                description: true,
                reportedDate: true,
                dueDate: true
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

    const ticketPriorityArray = Object.entries(ePriority)
        .filter(([key, value]) => typeof value === 'number')
        .map(([key, value]) => ({
            label: `${key}`,
            value: key,
        }));

    const ticketStatusArray = Object.entries(eTicketStatus)
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
            });

        getAssetsForDropdown()
            .then(assets => {
                setAssets(assets);
            })
            .catch(error => {
                console.log(error);
            });

        getUsers()
            .then(users => {
                setUsers(users.content.$values);
            })
            .catch(error => {
                console.log(error);
            });
        setLoading(false);
    }, [])

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
                    {/* Ticket Information Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="info" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Ticket Information</Text>
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
                                data={users.map(user => ({
                                    label: user.username,
                                    value: user.id
                                }))}
                                placeholder="Assigned To"
                                value={formData.assignedTo}
                                onValueChange={val => {
                                    handleInputChange('assignedTo', val);
                                    setTouched(prev => ({ ...prev, assignedTo: true }));
                                }}
                                error={!!errors.assignedTo && (touched.assignedTo || touched.submit)}
                                {...dropdownProps}
                            />

                            {!!errors.assignedTo && (touched.assignedTo || touched.submit) && (
                                <HelperText type="error" visible={!!errors.assignedTo}>
                                    {errors.assignedTo}
                                </HelperText>
                            )}

                            <CustomDropdown
                                data={ticketPriorityArray}
                                placeholder="Priority"
                                value={formData.priority}
                                onValueChange={val => {
                                    handleInputChange('priority', val);
                                    setTouched(prev => ({ ...prev, priority: true }));
                                }}
                                error={!!errors.priority && (touched.priority || touched.submit)}
                                {...dropdownProps}
                            />
                            {!!errors.priority && (touched.priority || touched.submit) && (
                                <HelperText type="error" visible={!!errors.priority}>
                                    {errors.priority}
                                </HelperText>
                            )}

                            <CustomDropdown
                                data={ticketStatusArray}
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

                    {/* Dates Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="date-range" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Dates</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Reported Date"
                                value={reportedDateDisplay}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.reportedDate && (touched.reportedDate || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.reportedDate && (touched.reportedDate || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, reportedDate: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowReportedDatePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showReportedDatePicker && (
                                <RNDateTimePicker
                                    value={formData.reportedDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => handleDateChange('reportedDate', event, selectedDate)}
                                />
                            )}
                            {!!errors.reportedDate && (touched.reportedDate || touched.submit) && (
                                <HelperText type="error" visible={!!errors.reportedDate}>
                                    {errors.reportedDate}
                                </HelperText>
                            )}

                            <TextInput
                                label="Due Date"
                                value={dueDateDisplay}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.dueDate && (touched.dueDate || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.dueDate && (touched.dueDate || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, dueDate: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowDueDatePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showDueDatePicker && (
                                <RNDateTimePicker
                                    value={formData.dueDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => handleDateChange('dueDate', event, selectedDate)}
                                />
                            )}
                            {!!errors.dueDate && (touched.dueDate || touched.submit) && (
                                <HelperText type="error" visible={!!errors.dueDate}>
                                    {errors.dueDate}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Ticket Details Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="description" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Ticket Details</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Summary"
                                mode="outlined"
                                value={formData.summary}
                                onChangeText={text => {
                                    handleInputChange('summary', text);
                                    if (text) setErrors(errors => ({ ...errors, summary: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.summary && (touched.summary || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.summary && (touched.summary || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, summary: true }))}
                            />
                            {!!errors.summary && (touched.summary || touched.submit) && (
                                <HelperText type="error" visible={!!errors.summary}>
                                    {errors.summary}
                                </HelperText>
                            )}

                            <TextInput
                                label="Description"
                                mode="outlined"
                                value={formData.description}
                                onChangeText={text => {
                                    handleInputChange('description', text);
                                    if (text) setErrors(errors => ({ ...errors, description: undefined }));
                                }}
                                style={[styles.input, { minHeight: 100 }]}
                                multiline
                                numberOfLines={4}
                                activeOutlineColor={!!errors.description && (touched.description || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.description && (touched.description || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, description: true }))}
                            />
                            {!!errors.description && (touched.description || touched.submit) && (
                                <HelperText type="error" visible={!!errors.description}>
                                    {errors.description}
                                </HelperText>
                            )}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <Button
                        rippleColor={'green'}
                        mode="contained"
                        buttonColor='#0acf97'
                        onPress={() => {
                            setTouched(t => ({ ...t, submit: true }));
                            handleCreateTicket();
                        }}
                        style={styles.button}
                        contentStyle={{ borderRadius: 8, paddingVertical: 6 }}
                    >
                        Update Ticket
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
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

export default UpdateTicket;