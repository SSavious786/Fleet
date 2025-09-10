import { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Breadcrumbs from '../../../components/assets/Breadcrumbs';
import CustomDropdown from '../../../components/assets/CustomDropdown';
import { getUserTickets } from '../../api/tickets';
import { getUsers } from '../../api/user';

const Ticket = ({ setLoading, setTickets }) => {
    const navigation = useNavigation();
    // State for dropdown values
    // const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
    // const [selectedAsset, setSelectedAsset] = useState('');
    // const [selectedStatus, setSelectedStatus] = useState('');
    // const [users, setUsers] = useState('');


    // const statusData = [
    //     { label: 'Open', value: 'Open' },
    //     { label: 'InProgress', value: 'InProgress' },
    //     { label: 'OnHold', value: 'OnHold' },
    // ];

    // const assetData = [
    //     { label: 'Asset', value: 'Asset' },
    // ];

    useEffect(() => {
        setLoading(true);
        // getUsers()
        //     .then(users => {
        //         // const transformed = users.content.$values.map(user => ({
        //         //     label: user.username,
        //         //     value: user.id
        //         // }));
        //         setUsers(users.content.$values);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     });

        getUserTickets()
            .then(tickets => {
                if (tickets.success) {
                    setTickets(tickets.content.$values);
                    setLoading(false);
                }
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Breadcrumbs title={'Tickets'} crumb={'Index'} />

                <TouchableOpacity onPress={() => navigation.navigate('AddTicket')} style={{
                    backgroundColor: '#0acf97',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8
                }}>
                    <Text style={{
                        color: '#fff',
                    }}>Add Ticket</Text>
                </TouchableOpacity>
            </View>

            {/* <CustomDropdown
                data={users.content.$values.map(user => ({
                    label: user.username,
                    value: user.id
                }))}
                placeholder={'Assigned To'}
                value={selectedAssignedTo}
                onValueChange={setSelectedAssignedTo}
            />

            <CustomDropdown
                data={assetData}
                placeholder={'Asset'}
                value={selectedAsset}
                onValueChange={setSelectedAsset}
            />

            <CustomDropdown
                data={statusData}
                placeholder={'Status'}
                value={selectedStatus}
                onValueChange={setSelectedStatus}
            /> */}
        </View>
    );
};


export default Ticket;