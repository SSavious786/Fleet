import { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Breadcrumbs from '../../../components/assets/Breadcrumbs';
import CustomDropdown from '../../../components/assets/CustomDropdown';

const Service = () => {
    const navigation = useNavigation();
    
    // State for dropdown values
    const [selectedAssetType, setSelectedAssetType] = useState('');
    const [selectedAssetLocation, setSelectedAssetLocation] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    
    // Asset Type dropdown options
    const assetTypeData = [
        { label: 'SUV', value: 'SUV' },
        { label: 'Sedan', value: 'Sedan' },
        { label: 'PickupTruck', value: 'PickupTruck' },
        { label: 'Van', value: 'Van' },
        { label: 'Motorcycle', value: 'Motorcycle' },
        { label: 'ElectricCar', value: 'ElectricCar' },
        { label: 'HybridCar', value: 'HybridCar' },
        { label: 'Bus', value: 'Bus' },
        { label: 'Truck', value: 'Truck' },
        { label: 'Convertible', value: 'Convertible' },
        { label: 'Coupe', value: 'Coupe' }
    ];

    // Asset Location dropdown options
    const assetLocationData = [
        { label: 'Asset Location', value: 'AssetLocation' },
        { label: 'Warehouse A', value: 'WarehouseA' },
        { label: 'Warehouse B', value: 'WarehouseB' },
        { label: 'Main Office', value: 'MainOffice' },
        { label: 'Field Location', value: 'FieldLocation' }
    ];

    return (
        <View style={{ padding: 20 }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Breadcrumbs title={'Service'} crumb={'Index'} />

                <TouchableOpacity onPress={() => navigation.navigate('AddService')} style={{
                    backgroundColor: '#0acf97',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8
                }}>
                    <Text style={{
                        color: '#fff',
                    }}>Add Service</Text>
                </TouchableOpacity>
            </View>

            {/* <CustomDropdown 
                data={assetTypeData} 
                placeholder={'Asset Type'} 
                value={selectedAssetType}
                onValueChange={setSelectedAssetType}
            />
            <CustomDropdown 
                data={assetLocationData} 
                placeholder={'Asset Location'} 
                value={selectedAssetLocation}
                onValueChange={setSelectedAssetLocation}
            /> */}
        </View>
    );
};


export default Service;