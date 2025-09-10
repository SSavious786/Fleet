import { useEffect, useState } from 'react';
import {
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AddAssetDetails from '../../../components/assets/AddAssetDetails';
import AddLifecycleDetails from '../../../components/assets/AddLifecycleDetails';
import AddFinancialDetails from '../../../components/assets/AddFinancialDetails';
import { getCompanyIdFromToken } from '../../api/getCompanyIdFromToken';
import { eAssetStatus, eExpenseType, eFuelType } from '../../../constants/Enums';
import { createAsset, getLocations } from '../../api/assets';

const AddAsset = ({ navigation }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(1);
    const [assetData, setAssetData] = useState({});
    const [lifecycleData, setLifecycleData] = useState({});
    const [financialData, setFinancialData] = useState({});
    const [loading, setLoading] = useState(false);

    const handleDetailsSubmit = (data) => {
        setAssetData(data);
        setActiveTab(2); // Move to Lifecycle tab
    };

    const handleLifecycleSubmit = (data) => {
        setLifecycleData(data);
        setActiveTab(3); // Move to Financial tab
    };

    const handleFinancialSubmit = async (data) => {
        setFinancialData(data);
        // if (JSON.stringify(assetData) == '{}') {
        //     setActiveTab(1);
        // }
        // else if (JSON.stringify(lifecycleData) == '{}') {
        //     setActiveTab(2);
        // }
        // else if (JSON.stringify(financialData) == '{}') {
        //     setActiveTab(3);
        // }
        // else {
        // }
        submitCompleteAsset();
    };

    const submitCompleteAsset = async () => {
        try {
            setLoading(true);

            // Get company ID
            const companyId = await getCompanyIdFromToken();
            if (!companyId) {
                throw new Error('Unable to determine company ID. Please log in again.');
            }

            const getVehicleTypeEnum = (type) => {
                const types = Object.entries(eExpenseType)
                    .filter(([key, value]) => typeof value === 'number')
                    .map(([label, value]) => ({
                        label,
                        value,
                    }));
                return types[type] || 10;
            };

            const getFuelTypeEnum = (type) => {
                const types = Object.entries(eFuelType)
                    .filter(([key, value]) => typeof value === 'number')
                    .map(([label, value]) => ({
                        label,
                        value,
                    }));
                return types[type] || 10;
            };

            const getStatusEnum = (status) => {
                const statuses = Object.entries(eAssetStatus)
                    .filter(([key, value]) => typeof value === 'number')
                    .map(([label, value]) => ({
                        label,
                        value,
                    }));
                return statuses[status] || 10;
            };

            //Prepare complete asset object (camelCase field names matching Swagger exactly)
            const completeAssetData = {
                // Asset Details (backend expects camelCase field names)
                assetName: assetData.assetName || '',
                vin: assetData.vin || '',
                licensePlate: assetData.licensePlate || '',
                locationId: parseInt(assetData.locationId) || 0, // Set to null as requested
                vehicleType: getVehicleTypeEnum(assetData.vehicleType),
                year: parseInt(assetData.year) || 0,
                make: assetData.make || '',
                model: assetData.model || '',
                trim: assetData.trim || '',
                fuelType: getFuelTypeEnum(assetData.fuelType),
                registrationState: assetData.registrationState || '',
                status: getStatusEnum(assetData.status),
                operator: assetData.operator || '',
                owner: assetData.owner || '',

                // Lifecycle Details
                inServiceDate: lifecycleData.inServiceDate || new Date().toISOString(),
                inServiceOdometer: parseInt(lifecycleData.inServiceOdometer) || 200,
                estimatedServiceLifeInMonths: parseInt(lifecycleData.estimatedServiceLifeInMonths) || 0,
                estimatedServiceLifeInMeters: parseInt(lifecycleData.estimatedServiceLifeInMeters) || 0,
                estimatedResaleValue: parseFloat(lifecycleData.estimatedResaleValue) || 0,

                // Company ID
                companyID: parseInt(companyId),

                // Financial Details
                financialDetail: financialData,

                // Asset Images (empty array as backend expects string array)
                assetImages: []
            };
            //console.log('Complete Asset Data:', completeAssetData);

            // Submit to API
            //console.log(completeAssetData)
            createAsset(completeAssetData)
                .then((data) => {
                    if (data.title == "Duplicate LicensePlate or VIN") {
                        Alert.alert('Create Asset', data.description);
                    }
                    else if (data.success) {
                        Alert.alert('Create Asset', `Asset created successfully!`);
                    }
                    else {
                        Alert.alert(
                            'Success!',
                            `Asset "${completeAssetData.assetName}" created successfully!`
                        );
                    }
                    console.log(data)
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });



        } catch (error) {
            // Check if it's an asset limit error (business rule, not technical error)
            if (error.message && error.message.includes('maximum allowed assets')) {
                Alert.alert(
                    'Asset Limit Reached',
                    'Your company has reached the maximum allowed assets. Please contact your administrator to increase the limit.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate back to assets list
                                if (router && router.back) {
                                    router.back();
                                } else if (navigation && navigation.goBack) {
                                    navigation.goBack();
                                }
                            }
                        }
                    ]
                );
                return; // Don't treat this as an error
            }

            // Handle other errors normally (but don't log to console to avoid UI errors)
            let errorMessage = 'Failed to create asset. Please try again.';

            if (error.response && error.response.data) {
                // Try to extract more specific error message from backend
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.description) {
                    errorMessage = error.response.data.description;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }

            Alert.alert(
                'Create Asset',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 105 : 0}
        >
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab(1)} style={{ width: '33%' }}>
                    <Text style={styles.tabText}>Details</Text>
                    {activeTab === 1 && <View style={styles.activeLine} />}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveTab(2)} style={{ width: '34%' }}>
                    <Text style={styles.tabText}>Lifecycle</Text>
                    {activeTab === 2 && <View style={styles.activeLine} />}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveTab(3)} style={{ width: '33%' }}>
                    <Text style={styles.tabText}>Financial</Text>
                    {activeTab === 3 && <View style={styles.activeLine} />}
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={{ flex: 1 }}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0acf97" />
                        <Text style={styles.loadingText}>Creating asset...</Text>
                    </View>
                )}

                {activeTab === 1 ? (
                    <AddAssetDetails onSubmitSuccess={handleDetailsSubmit} />
                ) : activeTab === 2 ? (
                    <AddLifecycleDetails
                        assetData={assetData}
                        onSubmitSuccess={handleLifecycleSubmit}
                    />
                ) : (
                    <AddFinancialDetails
                        assetData={assetData}
                        lifecycleData={lifecycleData}
                        onSubmitSuccess={handleFinancialSubmit}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'silver',
        paddingTop: 15,
        backgroundColor: '#fff',
        height: 50
    },
    tabText: {
        color: '#000',
        fontWeight: '500',
        fontSize: 18,
        textAlign: 'center',
        paddingBottom: 15
    },
    activeLine: {
        width: '100%',
        height: 3,
        backgroundColor: '#0acf97',
        position: 'absolute',
        bottom: 0
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#0acf97',
        fontWeight: '500',
    },
});

export default AddAsset;