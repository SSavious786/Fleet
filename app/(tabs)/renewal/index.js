import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity, Text } from 'react-native';
import { Card, Searchbar, Avatar } from 'react-native-paper';
import { getUserDataFromToken } from '../../../src/api/getCompanyIdFromToken';
import { deleteRenewalById, getUserRenewals } from '../../../src/api/renewal';
import colors from '../../../src/constants/colors';
import Renewal from '../../../src/screens/Renewals/Renewal';
import { useNavigation } from 'expo-router';
import { RenewalStatus } from '../../../constants/Enums';

export default function RenewalListScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredRenewals = renewals.filter(renewal =>
    renewal.comments.toLowerCase().includes(search.toLowerCase())
  );

  function getAllUserRenewals() {
    getUserDataFromToken()
      .then(data => {
        getUserRenewals(data.sub)
          .then((data) => {
            setRenewals(data.content.$values);
          })
          .catch((error) => {
            console.log(error);
          })
      })
      .catch(error => {
        console.log(error);
      });
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserDataFromToken()
      .then(data => {
        getUserRenewals(data.sub)
          .then((data) => {
            setRenewals(data.content.$values);
          })
          .catch((error) => {
            console.log(error);
          })
      })
      .catch(error => {
        console.log(error);
      });
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    getUserDataFromToken()
      .then(data => {
        getUserRenewals(data.sub)
          .then((data) => {
            setRenewals(data.content.$values);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          })
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const renewalStatusOptions = Object.entries(RenewalStatus)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({
      label,
      value,
    }));

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
      <View style={styles.container}>
        <Renewal navigation={navigation} />
        <Searchbar
          placeholder="Search Renewal..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          iconColor={colors.primary}
          inputStyle={{ color: colors.dark }}
        />
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={filteredRenewals}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const statusBg = renewalStatusOptions.find(x => x.value == item.status).label == 'Upcoming' ? '#3498db' : renewalStatusOptions.find(x => x.value == item.status).label == 'DueSoon' ? '#f39c12' : '#e74c3c';

            return (
              // <Card style={styles.card}>
              //   <Card.Title
              //     titleNumberOfLines={2}
              //     subtitleNumberOfLines={2}
              //     title={item.comments}
              //     subtitle={`${item.asset.assetName} • Due: ${new Date(item.dueDate).toDateString()} • ${item.status}`}
              //     left={props => <Avatar.Icon {...props} icon="wrench" color={colors.white} style={{ backgroundColor: colors.primary }} />}
              //     right={props =>
              //       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              //         <TouchableOpacity onPress={() => { navigation.navigate('UpdateRenewal', item) }}><Avatar.Icon {...props} icon="pen" color={colors.white} style={{ backgroundColor: colors.info, marginRight: 16 }} /></TouchableOpacity>
              //         <TouchableOpacity onPress={() => {
              //           Alert.alert('Delete Renewal', 'Are you sure you want to delete this Renewal?', [
              //             {
              //               text: 'No',
              //               onPress: () => { }
              //             },
              //             {
              //               text: 'Yes',
              //               onPress: () => {
              //                 setLoading(true);
              //                 deleteRenewalById(item.id)
              //                   .then((data) => {
              //                     if (data.success) {
              //                       getAllUserRenewals();
              //                       Alert.alert('Delete Renewal', 'Renewal deleted successfully.');
              //                       setLoading(false);
              //                     }
              //                   })
              //                   .catch(error => {
              //                     console.log(error);
              //                     setLoading(false);
              //                   })
              //               }
              //             }
              //           ]);

              //         }}><Avatar.Icon {...props} icon="delete" color={colors.white} style={{ backgroundColor: colors.danger, marginRight: 16 }} /></TouchableOpacity>
              //       </View>
              //     }
              //   />
              // </Card>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingVertical: 20,
                paddingHorizontal: 20,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                marginTop: index == 0 ? 0 : 10
              }}>
                <Avatar.Icon size={40} icon="wrench" color={colors.white} style={{ backgroundColor: colors.primary }} />

                <View style={{
                  flex: 1,
                  marginHorizontal: 10
                }}>
                  <Text style={{ color: '#000', fontWeight: '700', fontSize: 22 }}>{item.asset.assetName}</Text>
                  <Text style={{ color: 'grey', fontSize: 16, marginTop: 5 }}>{item.comments}</Text>
                  {/* <Text style={{ color: 'grey', fontWeight: '500', fontSize: 16, marginTop: 5 }}>{`Type: ${equipmentTypeOptions.find(x => x.value == item.type).label}`}</Text> */}
                </View>

                <View>
                  <Text style={{ alignSelf: 'flex-end', textAlignVertical: 'top', paddingHorizontal: 10, backgroundColor: statusBg, textAlign: 'center', color: '#fff', marginBottom: 5, paddingVertical: 3, borderRadius: 5 }}>{renewalStatusOptions.find(x => x.value == item.status).label}</Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity style={{ marginRight: 10 }} onPress={() => { navigation.navigate('UpdateRenewal', item) }}><Avatar.Icon icon="pen" size={30} color={colors.white} style={{ backgroundColor: colors.info }} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      Alert.alert('Delete Renewal', 'Are you sure you want to delete this Renewal?', [
                        {
                          text: 'No',
                          onPress: () => { }
                        },
                        {
                          text: 'Yes',
                          onPress: () => {
                            setLoading(true);
                            deleteRenewalById(item.id)
                              .then((data) => {
                                if (data.success) {
                                  getAllUserRenewals();
                                  Alert.alert('Delete Renewal', 'Renewal deleted successfully.');
                                  setLoading(false);
                                }
                              })
                              .catch(error => {
                                console.log(error);
                                setLoading(false);
                              })
                          }
                        }
                      ]);
                    }}><Avatar.Icon icon="delete" size={30} color={colors.white} style={{ backgroundColor: colors.danger }} /></TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          }}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20, paddingTop: 5 }}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    paddingTop: 16
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    elevation: 1,
    marginHorizontal: 20
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: colors.white,
  },
}); 