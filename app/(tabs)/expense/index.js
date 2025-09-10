import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Searchbar, Avatar } from 'react-native-paper';
import colors from '../../../src/constants/colors';
import Expense from '../../../src/screens/Expense/Expense';
import { getUserDataFromToken } from '../../../src/api/getCompanyIdFromToken';
import { deleteExpenseById, getCompanyUserExpenses } from '../../../src/api/expense';
import { useNavigation } from 'expo-router';
import { eExpenseFrequency, eExpenseType } from '../../../constants/Enums';

export default function ExpenseScreen() {
	const navigation = useNavigation();
	const [search, setSearch] = useState('');
	const [expense, setExpense] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);



	const onRefresh = useCallback(() => {
		setRefreshing(true);
		getUserDataFromToken()
			.then(data => {
				getCompanyUserExpenses(data.sub)
					.then((data) => {
						setExpense(data.content.$values);
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

	function getAllExpenses() {
		getUserDataFromToken()
			.then(data => {
				getCompanyUserExpenses(data.sub)
					.then((data) => {
						setExpense(data.content.$values);
					})
					.catch((error) => {
						console.log(error);
					})
			})
			.catch(error => {
				console.log(error);
			});
	}

	useEffect(() => {
		setLoading(true);
		getUserDataFromToken()
			.then(data => {
				getCompanyUserExpenses(data.sub)
					.then((data) => {
						setLoading(false);
						setExpense(data.content.$values);
					})
					.catch((error) => {
						setLoading(false);
						console.log(error);
					})
			})
			.catch(error => {
				setLoading(false);
				console.log(error);
			});
	}, []);

	const expenseTypeOptions = Object.entries(eExpenseType)
		.filter(([key, value]) => typeof value === 'number')
		.map(([label, value]) => ({
			label,
			value,
		}));
	
		const expenseFrequencyOptions = Object.entries(eExpenseFrequency)
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
				<Expense navigation={navigation} />
				<Searchbar
					placeholder="Search Expense..."
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
					data={expense}
					keyExtractor={item => item.id}
					renderItem={({ item }) => {
						return (
							<Card style={styles.card}>
								<Card.Title
									title={item.notes}
									subtitle={`Type: ${expenseTypeOptions.find(x => x.value == item.expenseType).label} • Frequency: ${expenseFrequencyOptions.find(x => x.value == item.frequency).label}`}
									left={props => <Avatar.Icon {...props} icon="fuel" color={colors.white} style={{ backgroundColor: colors.primary }} />}
									right={props =>
										<View style={{ flexDirection: 'row', alignItems: 'center' }}>
											<TouchableOpacity onPress={() => { navigation.navigate('UpdateExpense', item) }}><Avatar.Icon {...props} icon="pen" color={colors.white} style={{ backgroundColor: colors.info, marginRight: 16 }} /></TouchableOpacity>
											<TouchableOpacity onPress={() => {
												Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
													{
														text: 'No',
														onPress: () => { }
													},
													{
														text: 'Yes',
														onPress: () => {
															setLoading(true);
															deleteExpenseById(item.id)
																.then((data) => {
																	if (data.success) {
																		Alert.alert('Delete Expense', 'Expense deleted successfully.');
																		getAllExpenses();
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

											}}><Avatar.Icon {...props} icon="delete" color={colors.white} style={{ backgroundColor: colors.danger, marginRight: 16 }} /></TouchableOpacity>
										</View>
									}
								/>
							</Card>
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