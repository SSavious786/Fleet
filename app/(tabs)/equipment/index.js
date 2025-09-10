import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Text } from 'react-native';
import { Card, Searchbar, Avatar } from 'react-native-paper';
import { deleteEquipmentById, getEquipment, getEquipmentByCompanyUser } from '../../../src/api/equipment';
import colors from '../../../src/constants/colors';
import Equipment from '../../../src/screens/Equipment/Equipment';
import { getUserDataFromToken } from '../../../src/api/getCompanyIdFromToken';
import { useNavigation } from 'expo-router';
import { eEquipmentStatus, eEquipmentType } from '../../../constants/Enums';


export default function EquipmentListScreen() {
	const navigation = useNavigation();
	const [search, setSearch] = useState('');
	const [equipment, setEquipment] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const filteredEquipment = equipment.filter(e =>
		e.name.toLowerCase().includes(search.toLowerCase())
	);

	function getAllEquipment() {
		getEquipment()
			.then(data => {
				if (data.success) {
					setEquipment(data.content.$values);
				}
			})
			.catch(err => {
				console.log(err);
			});
	}

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		getEquipment()
			.then(data => {
				if (data.success) {
					setEquipment(data.content.$values);
				}
			})
			.catch(err => {
				console.log(err);
			});
		setRefreshing(false);
	}, []);

	useEffect(() => {
		setLoading(true);
		getEquipment()
			.then(data => {
				if (data.success) {
					setEquipment(data.content.$values);
				}
				setLoading(false);
			})
			.catch(err => {
				console.log(err);
				setLoading(false);
			});
	}, []);

	const equipmentTypeOptions = Object.entries(eEquipmentType)
		.filter(([key, value]) => typeof value === 'number')
		.map(([label, value]) => ({
			label,
			value,
		}));

	const equipmentStatusOptions = Object.entries(eEquipmentStatus)
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
			<KeyboardAvoidingView style={{ flex: 1 }} contentContainerStyle={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS == 'ios' ? 80 : 0}>
				<Equipment />
				<Searchbar
					placeholder="Search equipment..."
					value={search}
					onChangeText={setSearch}
					style={styles.searchbar}
					iconColor={colors.accent}
					inputStyle={{ color: colors.dark }}
				/>
				<FlatList
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					data={filteredEquipment}
					keyExtractor={item => item.id}
					renderItem={({ item, index }) => {
						const statusBg = equipmentStatusOptions.find(x => x.value == item.status).label == 'InService' ? '#05a34a' : equipmentStatusOptions.find(x => x.value == item.status).label == 'Active' ? '#00a66b' : equipmentStatusOptions.find(x => x.value == item.status).label == 'Inactive' ? '#7987a1' : equipmentStatusOptions.find(x => x.value == item.status).label == 'OutOfService' ? '#ff3366' : '#fbbc06';

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
								<Avatar.Icon size={40} icon="cog" color={colors.white} style={{ backgroundColor: colors.accent }} />
								<View style={{
									flex: 1,
									marginHorizontal: 10
								}}>
									<Text style={{ color: '#000', fontWeight: '700', fontSize: 22 }}>{item.name}</Text>
									<Text style={{ color: 'grey', fontWeight: '500', fontSize: 16, marginTop: 5 }}>{`Type: ${equipmentTypeOptions.find(x => x.value == item.type).label}`}</Text>
								</View>
								<View>
									<Text style={{ alignSelf: 'flex-end', textAlignVertical: 'top', paddingHorizontal: 10, backgroundColor: statusBg, textAlign: 'center', color: '#fff', marginBottom: 5, paddingVertical: 3, borderRadius: 5 }}>{equipmentStatusOptions.find(x => x.value == item.status).label}</Text>
									<View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
										<TouchableOpacity style={{ marginRight: 10 }} onPress={() => { navigation.navigate('UpdateEquipment', item) }}><Avatar.Icon icon="pen" size={30} color={colors.white} style={{ backgroundColor: colors.info }} /></TouchableOpacity>
										<TouchableOpacity onPress={() => {
											Alert.alert('Delete Equipment', 'Are you sure you want to delete this equipment?', [
												{
													text: 'No',
													onPress: () => { }
												},
												{
													text: 'Yes',
													onPress: () => {
														setLoading(true);
														deleteEquipmentById(item.id)
															.then((data) => {
																if (data.success) {
																	Alert.alert('Delete Equipment', 'Equipment deleted successfully.');
																	getAllEquipment();
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
					style={{ flex: 1 }}
					contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 20, paddingTop: 5 }}
				/>
			</KeyboardAvoidingView>
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
		color: colors.accent,
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