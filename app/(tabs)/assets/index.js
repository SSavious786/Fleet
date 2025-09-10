import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Text } from 'react-native';
import { Card, Searchbar, Avatar } from 'react-native-paper';
import { deleteCompanyAsset, getAllAssets, getAssets, getCompanyAssets } from '../../../src/api/assets';
import colors from '../../../src/constants/colors';
import Asset from '../../../src/screens/Assets/Asset';
import { getCompanyIdFromToken } from '../../../src/api/getCompanyIdFromToken';
import { useNavigation } from 'expo-router';
import { eAssetStatus, eAssetType, eVehicleType } from '../../../constants/Enums';

export default function AssetListScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // const filteredAssets = assets.filter(a =>
  //   a.assetName.toLowerCase().includes(search.toLowerCase())
  // );

  function getAllCompanyAssets() {
    getCompanyIdFromToken()
      .then((data) => {
        getCompanyAssets(data)
          .then((asset) => {
            setAssets(asset.content.$values)
          })
          .catch(error => {
            console.log(error)
          })
      })
      .catch(error => {
        console.log(error)
      })
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // getCompanyIdFromToken()
    //   .then((data) => {
    //     getCompanyAssets(data)
    //       .then((asset) => {
    //         setAssets(asset.content.$values)
    //       })
    //       .catch(error => {
    //         console.log(error)
    //       })
    //   })
    //   .catch(error => {
    //     console.log(error)
    //   })
    // getCompanyIdFromToken()
    //   .then((data) => {
    //     getCompanyAssets(data)
    //       .then((asset) => {
    //         setAssets(asset.content.$values)
    //         setLoading(false);
    //       })
    //       .catch(error => {
    //         setLoading(false);
    //         console.log(error)
    //       })
    //   })
    //   .catch(error => {
    //     setLoading(false);
    //     console.log(error)
    //   })
    getAllAssets()
      .then((asset) => {
        setAssets(asset.content.$values)
      })
      .catch(error => {
        console.log(error)
      })
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    // getCompanyIdFromToken()
    //   .then((data) => {
    //     getCompanyAssets(data)
    //       .then((asset) => {
    //         setAssets(asset.content.$values)
    //         setLoading(false);
    //       })
    //       .catch(error => {
    //         setLoading(false);
    //         console.log(error)
    //       })
    //   })
    //   .catch(error => {
    //     setLoading(false);
    //     console.log(error)
    //   })
    getAllAssets()
      .then((asset) => {
        setAssets(asset.content.$values)
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.log(error)
      })
  }, []);

  const assetTypeOptions = Object.entries(eVehicleType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([label, value]) => ({
      label,
      value,
    }));

  const assetStatusOptions = Object.entries(eAssetStatus)
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
        backgroundColor: colors.light
      }}>
        <ActivityIndicator size={'large'} />
      </View>
      :
      <View style={styles.container}>
        <Asset navigation={navigation} />
        <Searchbar
          placeholder="Search assets..."
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
          data={assets}
          keyExtractor={(item, key) => key}
          renderItem={({ item, index }) => {
            console.log(item.financialDetail)
            //const statusBg = assetStatusOptions.find(x => x.value == item.status).label == 'Active' ? '#28a745' : assetStatusOptions.find(x => x.value == item.status).label == 'InMaintenance' ? '#ffc107' : assetStatusOptions.find(x => x.value == item.status).label == 'Inactive' ? '#6c757d' : assetStatusOptions.find(x => x.value == item.status).label == 'Decommissioned' ? '#343a40' : assetStatusOptions.find(x => x.value == item.status).label == 'Reserved' ? '#17a2b8' : assetStatusOptions.find(x => x.value == item.status).label == 'Damaged' ? '#dc3545' : assetStatusOptions.find(x => x.value == item.status).label == 'OnLoan' ? '#fd7e14' : '#6610f2';

            return (
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
                <View style={{ flex: 1, marginRight: 5 }}>
                  <Text style={{ color: '#000', fontWeight: '700', fontSize: 22 }}>{item.assetName}</Text>
                  <Text style={{ color: 'grey', fontWeight: '500', fontSize: 16, marginTop: 5 }}>{`Type: SUV`}</Text>
                </View>
                <View>
                  <Text style={{ alignSelf: 'flex-end', paddingHorizontal: 10, backgroundColor: 'red', textAlign: 'center', color: '#fff', marginBottom: 5, paddingVertical: 3, borderRadius: 5 }}>{'Active'}</Text>
                  <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
                    <TouchableOpacity style={{ marginRight: 10 }} onPress={() => { navigation.navigate('UpdateAsset', item) }}><Avatar.Icon icon="pen" size={30} color={colors.white} style={{ backgroundColor: colors.info }} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      Alert.alert('Delete Asset', 'Are you sure you want to delete this asset?', [
                        {
                          text: 'No',
                          onPress: () => { }
                        },
                        {
                          text: 'Yes',
                          onPress: () => {
                            setLoading(true);
                            deleteCompanyAsset(item.id)
                              .then((data) => {
                                if (data.success) {
                                  Alert.alert('Delete Asset', 'Asset deleted successfully.');
                                  getAllCompanyAssets();
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

                    }}><Avatar.Icon icon="delete" size={30} color={colors.white} style={{ backgroundColor: colors.danger }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          }}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20, paddingTop: 5 }}
        />
      </View >
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