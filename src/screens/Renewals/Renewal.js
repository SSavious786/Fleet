import { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Breadcrumbs from '../../../components/assets/Breadcrumbs';
import CustomDropdown from '../../../components/assets/CustomDropdown';

const Renewal = () => {
    const navigation = useNavigation();

    // State for dropdown values
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedRenewalType, setSelectedRenewalType] = useState('');
    const [selectedAsset, setSelectedAsset] = useState('');

    // Asset Type dropdown options
    const statusData = [
        { label: 'Status', value: 'Status' },
    ];

    // Asset Location dropdown options
    const renewalTypeData = [
        { label: 'Registration', value: 'Registration' },
    ];

    // Status dropdown options
    const assetData = [
        { label: 'Asset', value: 'Asset' },
    ];

    return (
        <View style={{ padding: 20 }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Breadcrumbs title={'Renewal'} crumb={'Index'} />

                <TouchableOpacity onPress={() => navigation.navigate('AddRenewal')} style={{
                    backgroundColor: '#0acf97',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8
                }}>
                    <Text style={{
                        color: '#fff',
                    }}>Add Renewal</Text>
                </TouchableOpacity>
            </View>
{/* 
            <CustomDropdown
                data={statusData}
                placeholder={'Status'}
                value={selectedStatus}
                onValueChange={setSelectedStatus}
            />

            <CustomDropdown
                data={renewalTypeData}
                placeholder={'Renewal Type'}
                value={selectedRenewalType}
                onValueChange={setSelectedRenewalType}
            />

            <CustomDropdown
                data={assetData}
                placeholder={'Asset'}
                value={selectedAsset}
                onValueChange={setSelectedAsset}
            /> */}

        </View>
    );
};


export default Renewal;