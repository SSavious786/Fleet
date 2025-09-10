import { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Breadcrumbs from '../../../components/assets/Breadcrumbs';
import CustomDropdown from '../../../components/assets/CustomDropdown';

const Expense = () => {
    const navigation = useNavigation();

    // State for dropdown values
    const [selectedExpenseType, setSelectedExpenseType] = useState('');
    const [selectedAllAssets, setSelectedAllAssets] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState('');


    // Asset Location dropdown options
    const selectedExpenseTypeData = [
        { label: 'Fuel', value: 'Fuel' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Insurance', value: 'Insurance' },
        { label: 'Registration', value: 'Registration' },
        { label: 'Depreciation', value: 'Depreciation' },
        { label: 'Loan Payments', value: 'LoanPayments' },
        { label: 'Taxes', value: 'Taxes' },
        { label: 'Licensing', value: 'Licensing' },
        { label: 'Repairs', value: 'Repairs' },
        { label: 'Tolls', value: 'Tolls' },
        { label: 'Leasing', value: 'Leasing' },
        { label: 'Fines or Penalties', value: 'FinesOrPenalties' }
    ];

       // Status dropdown options
    const selectedAllAssetsData = [
        { label: 'All Assets', value: 'All Assets' },
    ];
        // Asset Type dropdown options
    const selectedFrequencyData = [
        { label: 'Frequency', value: 'Frequency' },
        { label: 'SingleExpense', value: 'SingleExpense' },
        { label: 'RecurringExpense', value: 'RecurringExpense' },
    ];

 

    return (
        <View style={{ padding: 20 }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Breadcrumbs title={'Expense'} crumb={'Index'} />

                <TouchableOpacity onPress={() => navigation.navigate('AddExpense')} style={{
                    backgroundColor: '#0acf97',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8
                }}>
                    <Text style={{
                        color: '#fff',
                    }}>Add Expense</Text>
                </TouchableOpacity>
            </View>

            {/* <CustomDropdown
                data={selectedExpenseTypeData}
                placeholder={'Expense Type'}
                value={selectedExpenseType}
                onValueChange={setSelectedExpenseType}
            />
            <CustomDropdown
                data={selectedAllAssetsData}
                placeholder={'All Assets'}
                value={selectedAllAssets}
                onValueChange={setSelectedAllAssets}
            />
            <CustomDropdown
                data={selectedFrequencyData}
                placeholder={'Frequency'}
                value={selectedFrequency}
                onValueChange={setSelectedFrequency}
            /> */}
        </View>
    );
};


export default Expense;